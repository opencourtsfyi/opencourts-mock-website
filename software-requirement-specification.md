# OpenCourts.FYI  
## Software Requirements Specification (SRS)

**Audience:** Code With The Carolinas volunteers, partners, and stakeholders

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for opencourts.fyi.

This SRS is intentionally scoped to a **Phase 0 prototype** whose goal is to demonstrate that annual reports on South Carolina probate courts from sccourts.org can be ingested, processed into normalized data, published as open downloads, consumed by Power BI, and presented as a dataset on a static website.

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

The Phase 0 prototype will:

- Ingest annual reports on probate courts from sccourts.org (initial focus: a single annual report / year) and archive the raw source artifact(s).
- Process and normalize the ingested data into a tabular, analytics-friendly structure.
- Publish processed outputs as **public downloads** in **Parquet and CSV** formats.
- Provide human-friendly access via an accessible **static website** that simulates a CKAN-style catalog.
- Provide machine-friendly access via **purely static** JSON catalog/metadata artifacts.
- Provide transparent provenance and compliance notes referencing originating court policies.
- Support a local development environment for running ingestion/processing and generating the static site artifacts.

The Phase 0 prototype will **not**:

- Implement CKAN or a CKAN API.
- Provide a dynamic query API (no server-side pagination/filtering endpoints).
- Implement community submission or takedown workflows in software (policy-only/manual processes for Phase 0).
- Require end-user accounts or logins for public access.
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
- Data scientists / analysts: need clean datasets, metadata, and stable download URLs for modeling and visualization.
- BI developers / analysts using Power BI: need normalized, refreshable Parquet/CSV datasets and stable schemas.
- Journalists / watchdogs: need interpretable data, story-ready visualizations, provenance, and context.
- Artificial intelligence agents (tools, assistants): need machine-readable metadata and catalogues for automated analysis and integration.

**Secondary users:**
- Nonprofit advocates, government officials, civic technologists, researchers, and community members submitting data or visualizations.

---

## 2. System Overview

At a high level, opencourts.fyi will consist of:

- **Static catalog website:** A static site that simulates a CKAN-style catalog (dataset listing + dataset detail pages).
- **Static metadata (“API”) artifacts:** Purely static JSON files (e.g., dataset list, dataset metadata, and DCAT-style catalogue) served by the static site.
- **Data ingestion and processing pipeline:** Scripts and/or scheduled jobs to retrieve annual reports from sccourts.org, extract tables, and normalize the data.
- **Artifact publishing:** Public hosting for published Parquet/CSV downloads and static JSON metadata.
- **Analytics consumption:** Power BI connects to the published normalized outputs via stable public URLs.

---

## 3. Functional Requirements

### 3.1 Dataset Management

- **FR-1: Create and manage datasets**
  - Maintainers can define datasets using a repository-managed manifest that drives both the static website pages and the static metadata artifacts.
  - Each dataset definition includes at minimum: title, description, tags, jurisdiction, court level, source institution, and source URLs.
  - Each dataset definition includes provenance metadata (see Section 3.3).
  - Datasets are published by updating the manifest and publishing generated artifacts (static pages + static JSON + downloadable files).

- **FR-1a: Ingest and normalize SC probate annual reports**
  - The system ingests annual probate court report(s) from sccourts.org for a specified year.
  - The ingestion process extracts relevant tables and normalizes the data into a documented schema suitable for analytics and BI.
  - The processing step performs basic validation (e.g., required fields present, correct types, non-negative numeric values where applicable) and fails fast on unrecoverable errors.

- **FR-2: Dataset versions**
  - The system supports annual releases for probate court annual reports (e.g., partitioned by year).
  - Each published dataset release includes: `year`, `published_at`, and `schema_version`.
  - Users can see when a dataset was last updated and, where feasible, a short change summary.

- **FR-3: Dataset search and discovery**
  - The static website provides basic dataset discovery (listing and optional client-side search/filter by keyword/tags/jurisdiction).

### 3.2 Data Access, APIs, and Catalogs

- **FR-4: Public Parquet and CSV downloads**
  - Each published dataset provides downloadable files in **Parquet** and **CSV** formats.
  - Downloads are publicly accessible via stable URLs.
  - The prototype does not provide a dynamic query API (no server-side pagination, filtering, or parameterized endpoints).

- **FR-5: Machine-readable catalogues**
  - Expose **purely static** machine-readable catalogues (e.g., DCAT-style JSON) that list datasets, resources (downloads), and core metadata.
  - Catalogues are accessible to automated tools and AI agents without requiring authentication for public datasets.

- **FR-6: Schema / field metadata**
  - Maintainers can document field-level metadata (name, description, type, allowed values) for the normalized probate annual report dataset.
  - Field metadata is accessible via the static website and via static machine-readable metadata.

- **FR-6a: Power BI consumption of normalized data**
  - The published Parquet/CSV outputs are structured and stable enough to be consumed by Power BI (including refresh scenarios).
  - The project documents the expected schema and how to connect Power BI to the public downloads.

### 3.3 Provenance and Court Terms of Use Compliance

- **FR-7: Provenance metadata**
  - For each dataset derived from court sources, store at minimum: source URLs, source institution, date/time retrieved, file hash, description of transformations, terms of use or policy reference.

- **FR-7a: Raw source archiving**
  - The system retains an archive of the raw source artifact(s) used to produce each published dataset release, including a cryptographic hash.

- **FR-8: Provenance display**
  - Display a human-readable provenance summary on each dataset page.
  - Provenance metadata accessible via static machine-readable metadata.

- **FR-9: Court Terms of Use compliance notice**
  - Indicate the relevant court Terms of Use on each dataset page.
  - Include a short statement that data is derived from court sources and not an official record.

- **FR-10: Automatic provenance logging for automated ingestion**
  - Ingest pipelines (e.g., serverless functions) automatically record source URLs, retrieval timestamps, file hashes, pipeline name/version.

### 3.4 Community Contributions & Governance

Community submissions and takedown handling are **policy-only/manual processes** in Phase 0.
The prototype does not implement submission forms, moderation tooling, AI review, badges, or automated takedown workflows in software.

### 3.5 Local Development and Environment Management

- **FR-11: Local dev environment**
  - The prototype shall be runnable locally on developer machines using documented setup scripts.
  - Developers can run ingestion/processing to produce the normalized Parquet/CSV outputs and generate the static site + static metadata artifacts.

- **FR-12: Staging and production environments**
  - The project supports at least a staging site and a production site for public access.
  - Configuration (e.g., base URLs for downloads) shall be environment-specific and not hard-coded.

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
  - If the project accepts community contributions during Phase 0, contributors shall agree to terms stating that they have rights to publish the data, their submissions comply with applicable court Terms of Use and law, and they will not upload malicious, discriminatory, or privacy-violating content.

- **DG-5: Provenance requirement**
  - Community submissions shall be required to provide data sources and URLs, and indicate whether data is original, derived, or repackaged.

- **DG-6: Auditability**
  - For each dataset and any community submission accepted during Phase 0, the project shall maintain an auditable record (e.g., via Git history, issues, and pull requests) of who submitted it, who approved it, and timestamps of key actions.

### 4.3 Takedown and Corrections

- **DG-7: Takedown workflow**
  - The project shall maintain a documented, manual process for handling requests, including time frame for acknowledgment, temporary hide while under review (for serious issues), and escalation path (e.g., to legal partners or court liaisons) where needed.

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
  - Maintainers shall be able to attach an outcome (e.g., acknowledged, corrected, disputed, withdrawn) and link to resulting changes.

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

---

## 5. Security Requirements

### 5.1 Access Control

- **SEC-1: Roles and permissions**
  - Roles include at least: Anonymous (read-only access to public data and downloads) and Maintainer (publishes/updates datasets and site artifacts).
  - The prototype does not require end-user accounts for public access.

- **SEC-2: Authentication**
  - Maintainers shall use strong authentication for any systems used to publish the site and datasets (e.g., GitHub with MFA).

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
  - Any rendered HTML content included in the static site shall be sanitized/controlled to prevent XSS.

- **SEC-7: Dependency management**
  - The system shall track dependencies and apply security patches regularly.
  - Only vetted libraries shall be used.

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
  - Phase 0 may be deployed as a static website without Terraform.
  - If/when managed infrastructure is introduced, core resources (hosting, storage, monitoring) should be defined in Terraform with environment-specific variables.

- **INF-2: Git-based workflows**
  - Infrastructure configuration shall be stored in Git.
  - Changes shall go through pull requests and review before being applied.
  - Volunteers shall be able to edit Terraform files and submit changes under review.

### 7.2 CI/CD

- **INF-3: Automated deployment**
  - The system shall support automated deployment workflows for applying Terraform changes and deploying application updates.
  - Staging deployments shall be tested before promoting to production.

### 7.3 Local Development

- **INF-4: Local environment parity**
  - Developers shall be able to run ingestion/processing locally and generate the static site artifacts using a small sample dataset.
  - Documentation shall exist for setup and contributing via Git.

---

## 8. Non-Functional Requirements

- **NFR-1: Availability**
  - Target availability for the public portal: 99%+ (no strict SLA, but practical reliability).

- **NFR-2: Performance**
  - Typical dataset search and page loads shall complete within a few seconds under normal load.
  - CSV/Parquet downloads and static JSON metadata files shall be reasonably responsive for moderate dataset sizes (tens to hundreds of thousands of rows).

- **NFR-3: Usability**
  - The UI shall be accessible and usable by non-technical users.
  - Data catalog and documentation shall be understandable by journalists and policymakers without technical training.

- **NFR-4: Accessibility**
  - The site shall follow accessibility best practices (e.g., WCAG-inspired) where feasible.

- **NFR-5: Transparency & trust**
  - The system shall prioritize clear messaging on data sources, limitations and caveats, and review and governance processes.

---

## Nice to Have

- MCP tools to manage and query the data resources.
