# OpenCourts.FYI  
## Software Requirements Specification (SRS)

**Audience:** Code With The Carolinas volunteers, partners, and stakeholders

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for opencourts.fyi, a multi-state open court data portal initially focused on North and South Carolina.

OpenCourts.FYI delivers a “public good” defined by two attributes:

- **Non-rivalrous:** One person’s use does not reduce the amount available for others.
  - My consumption does not diminish your ability to consume it.
  - Everyone can use it at the same time without “using it up.”
  - Why it matters: Non‑rivalry means the marginal cost of serving one more user is essentially zero — perfect for digital public goods.
- **Non-excludable:** It is difficult or impossible to prevent people from accessing it, even if they haven’t paid for it.
  - You can’t easily block someone from using it.
  - Access cannot be restricted without significant cost or effort.
  - Why it matters: Non‑excludability creates the classic “free rider” problem — people can benefit without contributing, which is why public goods often require collective funding or stewardship.

> Governance and all aspects of this project will be to ensure that opencourts.fyi remains a public good.

### 1.2 Scope

opencourts.fyi will:

- Aggregate, document, and publish court-related datasets from official court websites and other public sources.
- Provide human-friendly access (accessible web UI and documentation).
- Provide machine-friendly access (CSV/JSON endpoints, data catalogues, APIs) for downstream tools and AI agents.
- Support community-contributed datasets and visualizations with AI + human moderation.
- Provide transparent provenance and compliance with originating court policies.
- Be deployable to production via Terraform.
- Support a local development environment.
- Exclusively host legally open, reusable, and redistributable data. Thus, only permissively-licensed content is allowed (no unlicensed or restrictively licensed content).

  **Allowed Licenses:**
  - Creative Commons CC‑BY 4.0
  - CC0 (Public Domain Dedication)
  - Open Data Commons Public Domain Dedication (PDDL)

  **Disallowed Licenses:**
  - All Rights Reserved
  - CC BY NC, CC BY NC SA, CC BY NC ND, CC BY ND
  - Any “noncommercial,” “noderivatives,” or “noredistribution” license
  - Proprietary vendor licenses (LexisNexis, Westlaw, Tyler, etc.)
  - Research-only or education-only licenses
  - Licenses requiring approval for reuse
  - Licenses restricting automated access
  - Licenses requiring DRM or tracking

### 1.3 Target Users

**Primary users:**
- Upstream public good collaborators: Measures for Justice, SCProbateData.org
- Data scientists / analysts: need clean datasets, metadata, and APIs for modeling and visualization.
- Journalists / watchdogs: need interpretable data, story-ready visualizations, provenance, and context.
- Artificial intelligence agents (tools, assistants): need machine-readable datasets, schemas, and catalogues for automated analysis and integration.

**Secondary users:**
- Nonprofit advocates, government officials, civic technologists, researchers, and community members submitting data or visualizations.

---

## 2. System Overview

At a high level, opencourts.fyi will consist of:

- **Web portal and API layer:** CKAN-based (or CKAN-like) data portal for datasets, metadata, and downloads.
- **Data ingestion and processing:** Scripts / serverless functions to collect and clean data from court sites and other sources.
- **Storage layer:** Relational DB for metadata and structured data; object storage for files.
- **Visualization layer:** Static/external visualizations.
- **AI review and governance layer:** AI-assisted review pipeline for community submissions and compliance checking.
- **Infrastructure-as-code:** Terraform-based infrastructure in cloud (e.g., Azure) with GitOps-style workflow, plus local dev environment.

---

## 3. Functional Requirements

### 3.1 Dataset Management

- **FR-1: Create and manage datasets**
  - Authorized users can create datasets with title, description, tags, jurisdiction (state, county), court level.
  - Source information (URLs, institution names).
  - Provenance metadata (see Section 4).
  - Upload of structured data files (CSV, JSON, XLSX) and documentation files (PDF, MD, HTML, etc.).
  - Linking to remote resources (e.g., files on court websites, APIs, or data lakes).

- **FR-2: Dataset versions**
  - Support for dataset versioning (or equivalent metadata) when datasets are updated or re-ingested.
  - Users can see when a dataset was last updated and, where possible, what changed.

- **FR-2A: Update / recrawl metadata**
  - The system shall support recording per-dataset update/recrawl metadata including `min_recrawl_interval_seconds`.
  - Automated ingestion pipelines and schedulers shall respect `min_recrawl_interval_seconds` for a dataset’s configured source(s) and shall not recrawl more frequently than the specified minimum.

- **FR-3: Dataset search and discovery**
  - Users can search datasets by keywords, tags, jurisdiction, date ranges, court type, data type.
  - Users can filter datasets using facets (state, county, court level, topic, reviewed/unreviewed).

### 3.2 Data Access, APIs, and Catalogs

- **FR-4: CSV and JSON access**
  - Endpoints that return CSV and JSON formatted data for each dataset (or selected resources).
  - Support for pagination and basic query/filter parameters where feasible.

- **FR-5: Machine-readable catalogues**
  - Expose machine-readable catalogues (e.g., DCAT-style or CKAN API endpoints) that list datasets, resources (files, APIs), and metadata (schemas, field descriptions, provenance fields).
  - Catalogues accessible to automated tools and AI agents without requiring authentication for public datasets.

- **FR-6: Schema / field metadata**
  - Allow maintainers to document field-level metadata (name, description, type, allowed values) for key datasets.
  - Field metadata accessible via UI and API for machine consumption.

### 3.3 Provenance and Court Terms of Use Compliance

- **FR-7: Provenance metadata**
  - For each dataset derived from court sources, store at minimum: source URLs, source institution, date/time retrieved, file hash, description of transformations, terms of use or policy reference.

- **FR-8: Provenance display**
  - Display a human-readable provenance summary on each dataset page.
  - Provenance metadata accessible via API for machine use.

- **FR-9: Court Terms of Use compliance notice**
  - Indicate the relevant court Terms of Use on each dataset page.
  - Include a short statement that data is derived from court sources and not an official record.

- **FR-10: Automatic provenance logging for automated ingestion**
  - Ingest pipelines (e.g., serverless functions) automatically record source URLs, retrieval timestamps, file hashes, pipeline name/version.

- **FR-10A: Bronze/Silver/Gold storage lineage**
  - Automated ingestion pipelines shall support a medallion-style storage model with distinct stages for:
    - **Bronze (ingest):** raw ingested data preserved in its original format(s).
    - **Silver (transform):** cleaned/standardized datasets stored in **Parquet** format.
    - **Gold (publish):** publication-ready datasets stored in **Parquet** format and optionally rendered/exported as **CSV** and **JSON**.
  - For each published (gold) dataset/resource, the system shall record lineage that links the gold artifact(s) back to the specific silver artifact(s) and bronze artifact(s) from which they were produced.
  - Lineage records shall include, at minimum: storage location(s) (container/path or equivalent), file hash(es) for each stage artifact, timestamps, and the pipeline run identifier and pipeline name/version that produced each transformation.

### 3.4 Community Contributions & Governance

- **FR-11: Community dataset submissions**
  - Registered community contributors can submit new datasets or resources (including links and visualizations).
  - Submissions enter a pending or draft state and are not publicly visible until approved.

- **FR-12: Community visualization submissions**
  - Contributors can submit embedded visualizations (excluding Power BI) as resources.
  - Contributors must provide title, description, tags, source dataset(s) and links, and description of methodology.

- **FR-13: AI-assisted review**
  - On submission, the system triggers an AI review process that checks for presence and quality of provenance metadata, flags potential violations of court Terms of Use and portal policies, flags potential PII or sensitive content, and assesses metadata completeness and clarity.
  - The AI review produces a structured report (scores, flags, recommended actions) stored with the submission.

- **FR-14: Human moderation**
  - A human moderator is required to approve, reject, or request changes on each community submission.
  - Moderators see submission details, AI review report, submission history, and user identity.
  - Only moderators (or higher) can change a submission from pending to published.

- **FR-15: Badges and review indicators**
  - The system provides visible indicators on datasets: whether they have been AI-reviewed, human-reviewed/approved, and whether provenance has been verified.
  - Badges are driven from internal metadata fields and not directly editable by contributors.

- **FR-16: Takedown request handling**
  - The system provides a public takedown request mechanism (e.g., form or contact) that allows requesters to identify datasets or resources and state reasons (e.g., PII, legal risk, errors).
  - Moderators have a workflow to temporarily hide datasets/resources, review and decide on takedown, and document resolution (e.g., remove, redact, reject request).

### 3.5 Visualization

- **FR-17: Visualization linkage**
  - Each embedded visualization shall be associated with one or more underlying datasets in the catalog.
  - Clear indication of whether the visualization is official or community-contributed.

### 3.6 Local Development and Environment Management

- **FR-18: Local dev environment**
  - The system shall be runnable locally on developer machines with containerized services (e.g., Docker Compose) or documented setup scripts.
  - Local instances of portal (CKAN or equivalent), database, minimal storage.
  - Developers can create test datasets, test AI review integration using mocked or dev credentials, and run unit and integration tests.

- **FR-19: Staging and production environments**
  - The system supports at least a staging environment for testing and a production environment for public access.
  - Configuration (URLs, credentials, feature flags) shall be environment-specific and not hard-coded.

### 3.7 Court Discovery and Court Registry

- **FR-20: National Court Discovery as a Registry and Verification Pipeline**
  - The system shall implement court discovery as a canonical registry and verification pipeline, not as a generalized web-crawling process.
  - The system shall maintain a single authoritative Court Registry as the source of truth for all courts in the United States.
  - Each court in the Court Registry shall have a stable, unique identifier that persists across URL changes, renaming, or restructuring.
  - The Court Registry shall store, at minimum: jurisdiction level, court type, state, county/locality identifiers, hierarchical relationships, official website URL(s), provenance source(s), and verification status.
  - The Court Registry shall be versioned, auditable, and human-reviewable, including the ability to view historical changes and the provenance/rationale for edits.
  - The system shall seed the Court Registry from authoritative, official judicial directories published by state judicial branches, administrative offices of the courts, or equivalent official entities.
  - Registry expansion shall proceed outward from authoritative sources; generalized web crawling shall not be used as a primary discovery mechanism.
  - When authoritative directories are incomplete, secondary aggregators may be used only as non-authoritative hints to identify potentially missing courts.
  - Secondary aggregator hints shall never be treated as canonical sources and shall require independent verification before a court is added to the Court Registry.
  - The system shall support modular, state-specific adapters that ingest court listings from official state sources and emit standardized Court Registry updates.
  - State adapters shall be independently maintainable, replaceable, and testable; changes in a state website’s structure shall be isolated to the corresponding adapter without affecting other states.
  - The system shall define a national taxonomy of court types and jurisdiction levels.
  - Each state shall map its court naming conventions and structures to the national taxonomy via explicit configuration.
  - Raw state-specific court names and labels shall be preserved alongside normalized national classifications.
  - The system shall support hierarchical court models that vary by state (e.g., multi-tier trial courts, specialty courts, and administrative divisions).
  - The system shall remain up-to-date via scheduled verification and event-driven signals.
  - Scheduled verification shall periodically validate court URLs, detect redirects or failures, and re-run state adapters when authoritative sources change.
  - Event-driven signals shall include user reports, partner notifications, and automated anomaly detection.
  - URL changes, court renaming, and structural reorganization shall be treated as expected events and shall result in versioned registry updates rather than being treated as errors.
  - The registry and adapters shall be maintainable by a distributed team of volunteers, with documentation sufficient to add or update courts without deep engineering expertise.
  - Registry updates shall follow a lightweight review and approval workflow with clear provenance requirements.
  - Validation rules shall prevent duplicate courts, missing required fields, and inconsistent hierarchy.
  - The Court Registry shall drive downstream systems, including CKAN organization creation, dataset ownership, and ingestion pipelines.
  - CKAN shall reflect the Court Registry but shall not serve as the canonical source of court identity or structure.

- **FR-21: CKAN Bootstrap and Registry Sync for North Carolina and South Carolina Courts**
  - The system shall provide an automated, repeatable process to bootstrap and continuously synchronize CKAN court “organization” entities from the Court Registry.
  - The initial implementation shall support, at minimum, all courts enumerated by the authoritative official court directories for **North Carolina** and **South Carolina** as configured registry sources.
  - Each sync run shall produce a machine-readable coverage report for NC and SC that enumerates: authoritative source entries discovered, Court Registry entries created/updated, entries pending verification, entries excluded (with reasons), and the timestamp/version of the source inputs used.
  - The sync process shall be **idempotent**: running it multiple times with unchanged Court Registry input shall not create duplicates and shall result in no net CKAN changes.
  - The sync process shall support a **dry-run** mode that outputs a planned change set (create/update/deactivate) without modifying CKAN.
  - CKAN organizations created/managed by this process shall be keyed to the Court Registry’s stable court identifier, and the CKAN organization “name/slug” shall remain stable across court renames or URL changes.
  - The system shall represent court hierarchy in CKAN in a deterministic, queryable way (even if CKAN lacks native hierarchical orgs), at minimum by storing `court_id` and `parent_court_id` (and/or equivalent fields) in organization metadata (e.g., `extras`) and ensuring the UI/API can reconstruct hierarchy from those fields.
  - The sync process shall detect and report drift between CKAN and the derived state from the Court Registry (including manual edits), and shall either reconcile drift automatically or require explicit maintainer approval per documented policy.
  - The sync process shall not hard-delete CKAN organizations by default; when a court is merged, split, or deactivated in the Court Registry, the corresponding CKAN organization shall be marked inactive/archived in a reversible way while preserving auditability.

---

## 4. Data Governance & Compliance Requirements

### 4.1 Governance Principles

- **DG-1: Public, non-confidential data**
  - The platform focuses on public, non-confidential data; it shall not intentionally store or publish sealed records, confidential information, or PII beyond what is already publicly published by courts.

- **DG-2: Minimal PII**
  - Where court data inherently contains names or identifiers, the portal shall document that the data is sourced from public records and consider redaction policies for particularly sensitive content if practical.

- **DG-3: Clear distinction between official and derived data**
  - The system shall clearly differentiate between official court publications (linked to original sources) and derived datasets processed by opencourts.fyi or community members.

### 4.2 Community Contributions Governance

- **DG-4: Contributor terms**
  - Contributors shall agree to terms stating that they have rights to publish the data/visualizations, their submissions comply with applicable court Terms of Use and law, and they will not upload malicious, discriminatory, or privacy-violating content.

- **DG-5: Provenance requirement**
  - Community submissions shall be required to provide data sources and URLs, and indicate whether data is original, derived, or repackaged.

- **DG-6: Auditability**
  - For each dataset and community submission, the system shall log who submitted it, who approved it, AI review results, and timestamps of all key actions.

### 4.3 Takedown and Corrections

- **DG-7: Takedown workflow**
  - The system shall implement a documented process for handling requests, including time frame for acknowledgment, temporary hide while under review (for serious issues), and escalation path (e.g., to legal partners or court liaisons) where needed.

- **DG-8: Corrections and annotations**
  - The system shall allow maintainers to add correction notes to datasets and point to updated versions or official corrections from courts.

### 4.4 Governance Charter Compliance (Institutional Requirements)

The following requirements ensure that implementation decisions remain compatible with the OpenCourts.fyi Governance Charter (transparency, pluralism, independence, sustainability, and truthiness evaluation).

**Charter reference:** See the canonical charter text in `governance-charter.md` and the website-rendered version in `docs/governance-charter.html`.

- **GC-1: Public governance decision log**
  - The project shall maintain a public, linkable log of governance decisions (e.g., GitHub issues/discussions/PRs) including the decision, rationale, and date.
  - Decisions related to publication status, takedowns, major schema changes, and policy changes shall be logged.

- **GC-2: Truthiness evaluation metadata**
  - For each published dataset, the system shall support recording and displaying a “truthiness evaluation” summary that includes:
    - What the dataset claims to represent (scope/coverage)
    - Verification steps taken (if any) against official sources
    - Known limitations, uncertainty, and potential biases
    - Provenance links and timestamps

- **GC-3: Community challenge and re-evaluation workflow**
  - Any user shall be able to challenge a dataset’s accuracy, provenance, or interpretation via a public issue.
  - Maintainers/moderators shall be able to attach an outcome (e.g., acknowledged, corrected, disputed, withdrawn) and link to resulting changes.

- **GC-4: Public moderation outcomes (with safe redactions)**
  - For community submissions and takedown requests, the system shall publish the outcome and a brief rationale.
  - The system shall support redaction of sensitive details in public rationales when necessary (e.g., to avoid amplifying PII), while still preserving an auditable record for maintainers.

- **GC-5: Low-friction participation**
  - Contributor registration (if required) shall be open and lightweight.
  - The project shall provide a non-authenticated contribution path for reporting issues and suggesting improvements (e.g., GitHub issues or a public contact method).

- **GC-6: Independence and “bus factor” resilience**
  - No critical workflow (publishing, takedowns, schema releases) shall depend on a single individual.
  - The project shall maintain at least two administrators/maintainers with the ability to operate and recover core systems.
  - Administrative access recovery (e.g., credential rotation, access handoff, break-glass procedure) shall be documented.

- **GC-7: Annual review publication**
  - At least once per year, maintainers shall publish a brief public review summarizing:
    - Data coverage and major changes
    - Key improvements
    - Known issues and limitations
    - High-level plans for the coming year

- **GC-8: AI self-identification and labeling**
  - Any automated agent (including AI systems) interacting with humans on behalf of the project shall clearly self-identify as automated at the start of each interaction.
  - AI-generated outputs used in review, moderation, or publication decisions shall be labeled as AI-generated in the UI and in any exported artifacts (e.g., JSON reports).
  - The system shall prevent AI-generated content from being displayed in a way that could reasonably be interpreted as a human-authored statement (e.g., by including an “AI-generated” label adjacent to the content).

- **GC-9: National Court Discovery as a Registry and Verification Pipeline**
  - Court identity, hierarchy, and official URLs shall be governed through a versioned, auditable Court Registry with a lightweight human review/approval workflow for changes.
  - The governance process shall require provenance for registry entries and updates, including whether a change originated from an authoritative directory, a state adapter run, a verified partner report, or a user-submitted issue.
  - The governance process shall explicitly prohibit treating non-authoritative aggregators or generalized web crawling as canonical sources of court identity.
  - Maintainers shall be able to produce a public, reviewable change log and periodic audit artifacts (e.g., diffs/reports) showing registry additions, removals, merges/splits, URL changes, and verification status changes.
  - Governance decisions and implementation choices for the registry and adapters shall prioritize durability, auditability, low operational cost, and long-term scalability to all 50 U.S. states.

- **GC-10: CKAN Bootstrap and Registry Sync Auditability**
  - CKAN court-organization state derived from the Court Registry shall be reproducible from versioned inputs, including the registry version and the sync tool/script version.
  - Each sync run shall produce a public, reviewable artifact (e.g., JSON/CSV report or diff summary) describing proposed/applied changes, including counts of created/updated/deactivated organizations and any drift detected.
  - Manual edits to CKAN court-organization metadata that is designated as registry-derived shall be discouraged; if performed, the governance process shall require either (a) backporting the change to the Court Registry or (b) documenting an explicit override rule so the next sync run is predictable and auditable.

---

## 5. Security Requirements

### 5.1 Access Control

- **SEC-1: Roles and permissions**
  - Roles include at least: Anonymous (read-only access to public data), Contributor (can submit datasets/resources for review), Moderator (can approve/reject submissions and manage content), Admin (full system configuration and user management).
  - Only moderators/admins can change review status, set or override review badges, and publish to production.

- **SEC-2: Authentication**
  - Admins and moderators shall use strong authentication, ideally via federated identity (e.g., SSO with MFA).
  - Contributor accounts shall require strong passwords and rate-limited login attempts.

### 5.2 Data and Infrastructure Security

- **SEC-3: Encryption**
  - All web traffic shall use HTTPS.
  - Data at rest (databases and storage) shall be encrypted using platform-native encryption.

- **SEC-4: Network controls**
  - Databases shall not be directly publicly accessible from the internet.
  - Only the web application and authorized backend services shall access the database and storage.

- **SEC-5: Secret management**
  - Secrets (DB passwords, API keys, AI credentials) shall be stored in a secure secret manager (e.g., Key Vault), not in Git.
  - Terraform and CI/CD pipelines shall reference secrets from secure stores.

### 5.3 Application Security

- **SEC-6: Input validation & sanitization**
  - User-submitted content (titles, descriptions, HTML, embeds) shall be sanitized to prevent XSS and injection.
  - Embed support shall be restricted to safe patterns (e.g., whitelisted domains).

- **SEC-7: Dependency management**
  - The system shall track dependencies and apply security patches regularly.
  - Only vetted CKAN extensions or libraries shall be used.

- **SEC-8: Logging & anomaly detection**
  - Authentication failures, unexpected errors, and unusual submission patterns shall be logged.
  - Alerts shall be configured for suspicious patterns (e.g., spikes in failed logins or AI-detected PII).

---

## 6. Monitoring, Reliability, and Disaster Recovery

### 6.1 Monitoring and Alerts

- **MON-1: Uptime and health checks**
  - The system shall expose a basic health endpoint and be monitored by an external uptime service.
  - Alerts shall be configured for site unavailability and high error rates (5xx).

- **MON-2: Resource monitoring**
  - CPU, memory, disk usage, and database health shall be monitored.
  - Alerts shall be configured for threshold breaches that risk downtime or data loss.

### 6.2 Logging

- **MON-3: Centralized logging**
  - Application logs (portal, API) and system logs (web server, DB) shall be centralized in a logging system for analysis and incident response.

### 6.3 Backup and Disaster Recovery

- **DR-1: Regular backups**
  - Databases shall be backed up regularly (e.g., nightly), with retention appropriate for reconstruction and audit.
  - Backups shall be stored in a separate, secure storage location.
  - At least 30 days of backups shall be retained.

- **DR-2: Restore testing**
  - Procedures to restore from backup shall be documented and tested at least quarterly.

- **DR-3: Infrastructure rebuild**
  - Terraform definitions shall support recreating the infrastructure in staging and production from scratch if needed.

---

## 7. Infrastructure and Deployment Requirements

### 7.1 Infrastructure-as-Code with Terraform

- **INF-1: Terraform-managed resources**
  - Core infrastructure (compute, networking, storage, database, monitoring) shall be defined in Terraform.
  - Both staging and production environments shall be defined using Terraform with environment-specific variables.

- **INF-2: Git-based workflows**
  - Infrastructure configuration shall be stored in Git.
  - Changes shall go through pull requests and review before being applied.
  - Volunteers shall be able to edit Terraform files and submit changes under review.

### 7.2 CI/CD

- **INF-3: Automated deployment**
  - The system shall support automated deployment workflows for applying Terraform changes and deploying application updates.
  - Staging deployments shall be tested before promoting to production.

- **INF-3A: Data pipeline configuration in GitHub**
  - Azure Data Factory (ADF) pipeline configurations (pipelines, datasets, linked services, triggers, and related artifacts) shall be stored in a GitHub repository using ADF Git integration.
  - GitHub shall be the source of truth for ADF pipeline configurations; changes shall be made in Git and promoted via pull requests and review before being published/deployed to ADF environments.

### 7.3 Local Development

- **INF-4: Local environment parity**
  - Developers shall be able to run a local stack (portal + DB + minimal storage) with a small sample dataset and mocked or configurable AI review endpoints.
  - Documentation shall exist for setup, running tests, and contributing via Git.

---

## 8. Non-Functional Requirements

- **NFR-1: Availability**
  - Target availability for the public portal: 99%+ (no strict SLA, but practical reliability).

- **NFR-2: Performance**
  - Typical dataset search and page loads shall complete within a few seconds under normal load.
  - CSV/JSON API responses shall be reasonably responsive for moderate dataset sizes (tens to hundreds of thousands of rows).

- **NFR-3: Usability**
  - The UI shall be accessible and usable by non-technical users.
  - Data catalog and documentation shall be understandable by journalists and policymakers without technical training.

- **NFR-4: Accessibility**
  - The site shall follow accessibility best practices (e.g., WCAG-inspired) where feasible.

- **NFR-5: Transparency & trust**
  - The system shall prioritize clear messaging on data sources, limitations and caveats, and review and governance processes.

- **NFR-6: Court Record Custody and Source Preservation Policy**
  - The system shall distinguish between (a) records **stored in Azure Blob Storage** (copied/preserved artifacts) and (b) records **referenced via external URLs** (link-only resources), and shall expose this distinction in dataset/resource metadata.
  - When the platform performs or publishes derivative works, analytics products, versioned datasets, or long-term citations that depend on a source file, the system shall copy the source file into Azure Blob Storage and treat that copy as the preserved input artifact for reproducibility.
  - When the platform is acting solely as a discovery/catalog layer (i.e., no derivatives, analytics, versioning, or long-term citation requirements), the system shall link to the original court-hosted file(s) rather than copying them.
  - For every copied/preserved file in Azure Blob Storage, the system shall support provenance tracking, hashing, and versioning at minimum including: original source URL, retrieval timestamp, cryptographic hash (e.g., SHA-256), size, content type, and a version identifier that links derivatives back to the specific preserved source artifact.
  - The system shall apply this policy uniformly across all court types and all record formats supported by the portal (e.g., CSV, JSON, PDF, HTML, images, and other downloadable artifacts).
  - The system shall document the custody decision for each dataset and each resource as metadata (e.g., `custody_mode` = `link_only` | `copied_to_blob`, with associated fields such as `external_url` and/or `blob_uri`, plus a rationale/category such as `discovery_only` | `derivative_required` | `analytics_required` | `versioning_required` | `long_term_citation_required`).
  - The system shall make this policy enforceable and auditable by ensuring (a) custody metadata is required at publish time, (b) custody decisions and changes are logged with actor and timestamp, and (c) maintainers can generate an audit report enumerating all datasets/resources and their custody mode, hashes (for copied files), and version lineage.
  - The implementation shall align with cost-effective, volunteer-operated infrastructure by minimizing unnecessary copying, enabling retention/lifecycle controls for preserved artifacts, and supporting link-only operation where appropriate without sacrificing provenance transparency.

---

## Nice to Have

- MCP tools to manage and query the data resources.
