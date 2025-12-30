# OpenCourts.FYI — System Design (Azure + CKAN 2.10)

**Scope**: This document describes a cost-capped Azure architecture for OpenCourts.FYI that satisfies the SRS requirements using **CKAN 2.10**, **Azure Container Apps** (scale-to-zero), **Azure Blob Storage**, **Azure Functions** for ingestion/review pipelines, and **Terraform** for provisioning.

**Cost target**: $140/month or less for **production + staging**.

---

## 1. Goals and Non-Goals

### Goals
- Publish court-related datasets with strong **provenance**, **licensing**, and **machine-readable access**.
- Support community submissions with **AI-assisted checks** plus **human moderation**.
- Provide a stable, searchable CKAN-backed catalog with APIs (CKAN Action API + DCAT).
- Run within a predictable monthly budget and remain rebuildable via Terraform.

### Non-goals (for this phase)
- Multi-region active/active.
- Paid enterprise search (e.g., Cognitive Search) unless budget grows.
- Heavy custom CKAN feature development beyond high-level extension specs.

---

## 2. High-Level Architecture

### Runtime environments
- **GitHub Pages**: static “mock” preview site (UX prototype + governance + API examples).
- **Staging**: interactive preproduction CKAN for testing deployments and extensions.
- **Production**: public CKAN deployment.

**Canonical URL**: The canonical deployment for the static mock portal is the custom domain `https://opencourts.fyi` (see `docs/CNAME`). Any `github.io/<repo>` project-site URL is considered **non-canonical** and may not support all root-relative URLs referenced by machine-readable feeds.

### Core Azure building blocks
- **Azure Container Apps**: runs containers for CKAN, Solr, Redis, worker(s), and optional datapusher/xloader.
- **Azure Database for PostgreSQL Flexible Server**: CKAN metadata DB + DataStore DB.
- **Azure Blob Storage**: CKAN file storage for uploaded resources (via CKAN extension).
- **Azure Functions (Consumption)**: ingestion + governance pipelines (provenance checks, license/TOS checks, PII checks, metadata quality).
- **Azure Key Vault**: secrets management.
- **Azure Monitor / Application Insights**: logging + metrics.

### Logical diagram (text)
- Users → HTTPS → Container Apps Ingress → CKAN Web
- CKAN Web ↔ PostgreSQL Flexible Server (metadata + datastore)
- CKAN Web ↔ Solr (search)
- CKAN Web ↔ Blob Storage (resource files)
- CKAN Web → Webhook/Event → Azure Functions (review/ingestion)
- Azure Functions ↔ CKAN API + PostgreSQL (store review results)

---

## 3. CKAN 2.10 Deployment Model (Container Apps)

### Containers
Minimum set for CKAN 2.10:
- **ckan-web**: CKAN application (gunicorn/uwsgi behind Container Apps ingress)
- **solr**: Apache Solr (CKAN search)
- **redis**: caching / background tasks coordination
- **ckan-worker**: background jobs (harvesting, validation jobs, etc.)
- Optional:
  - **datapusher / xloader**: automated loading of tabular data into DataStore for previews/querying

### Scale-to-zero strategy
- **Staging** and **Production** use scale-to-zero for compute to minimize cost.
- Expected tradeoff: cold starts (seconds) after idle. Acceptable per cost cap.

### Networking
- Container Apps Ingress provides TLS termination.
- Postgres is **private** (no public access), reachable only from allowed networks (preferred) or restricted by firewall rules.

---

## 4. Data Storage

### 4.1 PostgreSQL Flexible Server
CKAN uses PostgreSQL for:
- **CKAN metadata** database
- **DataStore** (structured tabular data) database

Backups:
- Use **built-in automated backups** with **7-day retention** (free tier baseline).

### 4.2 Azure Blob Storage
- Stores CKAN resource files (CSV/JSON/PDF/etc.)
- Use a single storage account with separate containers:
  - `ckan-prod-resources`
  - `ckan-staging-resources`

---

## 5. Data Pipelines (Azure Functions)

Azure Functions (Consumption plan) provides low-cost event-driven automation:

### 5.1 Ingestion pipeline
Trigger examples:
- Timer trigger for periodic pulls (if sources permit)
- HTTP trigger to run ingestion for a specific source

Responsibilities:
- Fetch data (respecting court policies)
- Transform data (normalize schema, produce CSV/JSON)
- Compute file hashes
- Upload files to Blob
- Create/update dataset/resource in CKAN via Action API
- Record provenance metadata

### 5.2 Submission review pipeline (AI-assisted)
Trigger:
- CKAN webhook on new dataset/resource submission (or polling job if webhook is unavailable)

Checks (high-level):
- **Provenance completeness**: required fields present (source URL, retrieval time, publisher)
- **License compliance**: only CC-BY 4.0 / CC0 / PDDL; block disallowed licenses
- **TOS/policy flags**: heuristic checks + moderator review prompts
- **PII detection**: detect likely PII patterns for moderation (do not auto-publish)
- **Metadata quality**: ensure schema, field dictionary, documentation is present

Output:
- Structured review report stored and displayed to moderators
- Adds review status flags used for visible badges

---

## 6. CKAN Extensions (CKAN 2.10)

### 6.1 Community extensions planned
- **ckanext-cloudstorage**: store uploads in Azure Blob Storage
- **ckanext-scheming**: define custom dataset/resource metadata schemas (provenance fields, jurisdiction fields)
- **ckanext-dcat**: DCAT catalog endpoints for machine consumption
- **ckanext-validation**: validate tabular resources and publish validation reports
- **ckanext-workflow**: draft/pending/approved workflow for community submissions
- **ckanext-saml2auth**: SSO for moderators/admins (MFA enforced by IdP)
- **ckanext-hierarchy**: represent jurisdiction hierarchy (state → county → court)
- **ckanext-versioning** (or revision history strategy): dataset update tracking
- CKAN core:
  - **DataStore** (API access + previews)

### 6.2 Custom extensions (high-level only; implementation deferred)
- **ckanext-opencourts-provenance**: court-specific provenance schema + display
- **ckanext-opencourts-ai-review**: integrates review reports produced by Azure Functions
- **ckanext-opencourts-badges**: renders “AI-reviewed”, “Human-approved”, “Provenance-verified” badges

---

## 7. Security and Compliance

### Identity and access
- Roles: Anonymous / Contributor / Moderator / Admin
- Moderator/Admin authentication via SSO + MFA (IdP enforces MFA)

### Secrets
- Store DB credentials, API keys, and storage keys in **Azure Key Vault**
- Prefer **Managed Identity** from Container Apps to access Key Vault and storage

### Data handling
- Encrypt in transit (HTTPS) and at rest (default encryption for Postgres/Storage)
- Log auth failures and moderation actions

---

## 8. Observability

- **Application Insights**: request traces, dependency calls, exceptions
- **Azure Monitor** alerts:
  - Container restart loops
  - HTTP 5xx rates
  - Postgres CPU/storage thresholds

---

## 9. Staging Environment Strategy (Interactive Testing)

### Why staging
- Test new CKAN config/extensions and data pipelines interactively before production.
- Validate schema changes and workflow rules.

### Cost controls
- **Scale-to-zero** for staging Container Apps.
- Use smaller staging resources than production.
- Keep staging storage separate (separate container), but within the same storage account.

### Isolation
- Separate:
  - CKAN instance (staging hostname)
  - Postgres server (preferred) or separate DBs on same server (lower isolation)
  - Blob container

---

## 10. Terraform (High-Level Resource Specification)

This design is provisioned via Terraform with environment-specific variables.

### Shared resources (optional)
- Resource Group(s)
- Log Analytics Workspace / Application Insights
- Storage Account (containers separated per environment)

### Per environment (staging, production)
- Container Apps Environment
- Container Apps:
  - `ckan-web`
  - `solr`
  - `redis`
  - `ckan-worker`
  - optional `datapusher`
- PostgreSQL Flexible Server
- Key Vault
- DNS records (e.g., `staging.opencourts.fyi`, `data.opencourts.fyi`)

Terraform should:
- Avoid embedding secrets in state; use Key Vault references / managed identity.
- Keep variables per-environment (staging/prod).

---

## 11. Cost Model (Order-of-Magnitude)

> Prices vary by region and usage. The numbers below are conservative “planning estimates” to fit within $140/month.

### Production (target)
- Container Apps (CKAN + Solr + Redis + worker, scale-to-zero): ~$35–$45
- PostgreSQL Flexible Server (burstable): ~$12–$25
- Blob Storage (LRS, low volume): ~$5–$10
- Functions (Consumption, low volume): ~$0–$10
- Monitoring (low volume): ~$5–$15

**Production subtotal**: ~$70–$90

### Staging (target)
- Container Apps (smaller CPU/mem, scale-to-zero): ~$10–$20
- PostgreSQL Flexible Server (small/burstable): ~$12–$20
- Blob Storage (minimal): ~$1–$3

**Staging subtotal**: ~$25–$43

### Total
**Production + Staging**: ~$95–$133/month

This stays under the $140/month cap with buffer for bandwidth spikes.

---

## 12. Machine Readability Guidance (Design-level)

OpenCourts.FYI should publish:
- CKAN **Action API** endpoints (package_list, package_show, resource_show)
- CKAN **DataStore API** for structured tabular data (filters, pagination)
- **DCAT** feed via ckanext-dcat
- Resource-level **schema** documentation:
  - column name
  - type
  - description
  - allowed values / enumerations
  - nullability

---

## 13. Data Governance Guidance (Design-level)

Governance is enforced by:
- License allow-list (CC-BY 4.0 / CC0 / PDDL)
- Provenance requirements (source, retrieval timestamp, transformations, hashes)
- Submission workflow:
  - Contributor submits → AI checks → Moderator review → Publish
- Takedown workflow:
  - Request received → temporarily hide → investigate → resolve with audit trail

---

## 14. Open Questions (for later)
- Whether to use a dedicated harvesting component (CKAN harvester) vs custom Functions.
- Whether to split Postgres into separate servers for metadata vs datastore at larger scale.
- Cold start tolerance for production (keep min replicas at 0 vs 1).
