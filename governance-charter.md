# OpenCourts.fyi Governance Charter

*A volunteer-led, self-correcting justice data project for North and South Carolina.*

**Effective date:** 2026-01-16  
**Status:** Living document; updated via public pull request

## 1. Mission

OpenCourts.fyi is a volunteer-run public-interest project dedicated to making court data in North Carolina and South Carolina transparent, accessible, and understandable.

Our goal is to support communities, journalists, researchers, and advocates by providing reliable information about how the courts operate.

The project is designed as a self-correcting institution that learns, adapts, and improves through open participation and transparent processes.

## 2. Guiding Principles

OpenCourts.fyi is grounded in the qualities of durable, self-correcting institutions.

- **Transparency:** All data, code, documentation, and governance decisions are public.
- **AI disclosure:** Any automated agent (including AI systems) interacting with humans on behalf of OpenCourts.fyi clearly self-identifies as automated, and AI-generated content used in governance is labeled as such.
- **Truthiness evaluation:** We commit to assessing the accuracy, provenance, and reliability of all data we publish, including documenting limitations and uncertainty.
- **Feedback loops:** Errors and gaps are surfaced through automated checks and community reporting.
- **Adaptability:** The platform evolves as courts, laws, and community needs change.
- **Pluralism:** Anyone may contribute, review, or challenge data or decisions.
- **Independence:** No single person or organization controls the project.
- **Sustainability:** Processes are intentionally lightweight so volunteers can maintain them.

## 3. Organizational Structure

OpenCourts.fyi is maintained by a distributed group of volunteers who contribute time, expertise, and technical support as they are able.

There is no paid staff, no formal board, and no financial activity beyond basic hosting and domain costs.

### 3.1 Volunteer Maintainers

A small group of maintainers oversees data ingestion, validation, CKAN configuration, documentation, schema updates, community submissions, and issue resolution.

Responsibilities rotate informally based on availability.

### 3.2 Community Contributors

Anyone may submit dashboards, analyses, or data quality reports; propose improvements; participate in discussions; or flag errors.

Participation is open, transparent, and asynchronous.

## 4. Roles and Responsibilities

### 4.1 Maintainers

- Maintain ingestion pipelines and platform uptime.
- Review and merge pull requests.
- Approve or revise community dashboard submissions.
- Publish schema updates and changelogs.
- Document data provenance and known limitations.
- Uphold the project’s commitment to evaluating the truthiness of data.

### 4.2 Contributors

- Submit dashboards, analyses, or corrections.
- Participate in discussions and reviews.
- Help identify gaps in county-level data.
- Provide local context and insights.

### 4.3 Users

- Report issues or inaccuracies.
- Suggest improvements.
- Use the data responsibly and transparently.

## 5. Governance Processes

### 5.1 Decision-Making

Decisions are made through open discussion on GitHub or public communication channels.

Maintainers seek consensus whenever possible.

If consensus is unclear, maintainers make a decision based on transparency, data accuracy, sustainability for volunteers, and community input.

### 5.2 Data Governance

- **Versioned schemas:** All datasets use versioned schemas with documented changes.
- **Automated validation:** Pipelines flag missing fields, schema drift, and anomalies.
- **Truthiness evaluation:** Data is verified against official sources when possible, uncertainty is documented, and provenance notes are published.
- **Public documentation:** Data dictionaries, known issues, and limitations are openly published.

### 5.3 Community Dashboard Workflow

- Contributors submit dashboards through CKAN.
- Automated checks flag metadata or formatting issues.
- Maintainers review submissions as time allows.
- Contributors may revise and resubmit.

### 5.4 Issue Reporting

- Anyone may file issues on GitHub.
- Maintainers triage issues based on severity and volunteer availability.
- Critical issues, such as broken ingestion, receive priority attention.

### 5.5 Annual Review

Once per year, maintainers publish a short public note summarizing data coverage, improvements, known issues, and plans for the coming year.

The review is intentionally brief to respect volunteer capacity.

## 6. Ethical and Privacy Commitments

- No personally identifiable information beyond what is legally public in court records is published.
- Sensitive data, including juvenile or sealed records, is excluded or redacted.
- All code and governance policies are open-source.
- Any automated agent (including AI systems) interacting with humans on behalf of OpenCourts.fyi self-identifies as automated at the start of the interaction.
- AI-generated outputs used in governance, review, or publication decisions are labeled as AI-generated and are not represented as human judgment.
- Truthiness evaluations include ethical considerations around misinterpretation, bias, and context.

## 7. Sustainability

Because OpenCourts.fyi is volunteer-run, all processes must be simple, documented, and automatable.

- No workflow should depend on a single person.
- The project may evolve slowly based on volunteer availability.
- The community is encouraged to step in when maintainers are unavailable.

## 8. Amendments

This charter may be updated through a public GitHub pull request, open discussion, and maintainer consensus.

## 9. Public Accountability

OpenCourts.fyi commits to publishing governance decisions, maintaining open access to data and documentation, responding to community feedback as volunteer time allows, and upholding rigorous truthiness evaluation standards.
