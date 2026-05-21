# Zichao Wu - Senior Software Engineer / Software Architect

Senior software developer and architect with a 25-year body of work across carrier-grade telecom systems, backend services, database platforms, payment systems, reporting, lawful-intercept interfaces, MMS/SMS/voice infrastructure, REST modernization, and AI voice agents. This resume is grounded in repository evidence spanning 2001-2026 source history and current repositories including `AdminServer`, `BillServer`, `CDRServer`, `UMServer`, `CRServer`, `CardControl`, `JobBillServer`, `JobReportServer`, `MMSC`, `Common`, `AutoPay`, `AISClient`, `PromoServer`, `serviceapp`, `Li-X1X2X3`, `li-simulator-x1x2x3`, `telecom_ivr`, and `miffy`.

## Professional Summary

Senior software engineer and architect with 25+ years of hands-on experience building and modernizing carrier-grade telecom platforms. Deep background in C/C++ backend services, socket/IDL systems, prepaid billing, CDR processing, account lifecycle, voicemail/unified messaging, call routing, card/voucher systems, SMS/MMS delivery, CALEA/lawful-intercept workflows, reporting, payment gateways, PostgreSQL/Oracle/MySQL database access, and production troubleshooting. Recent work extends that long-running platform foundation into REST APIs, PostgreSQL migration, Linux modernization, AI-powered IVR, RTP media processing, OpenAI Realtime-compatible voice agents, and GPU/local LLM runtime infrastructure.

## Technical Skills

**Languages:** C, C++, Python, C#, Java, SQL, Bash, JavaScript/HTML/CSS.

**Backend / Platform:** legacy socket services, IDL-generated clients/servers, embedded HTTP/JSON REST APIs, FastAPI, WebSockets, Spring Boot, .NET 8, TCP/UDP protocols, Linux services, Makefiles, CMake, Maven.

**Telecom Domains:** prepaid billing, account provisioning, rating, rate plans, buckets, packages/add-ons, CDRs, voicemail/UM, call routing, SMS, MMS, MMSC, IVR, RTP, SIP-ready voice flows, CALEA, lawful intercept X1/X2/X3, SMSC/notification integrations.

**Databases:** PostgreSQL/libpq, Oracle OCI, MySQL, ODBC, UCDA abstraction layer, connection pooling, prepared statements, schema migration, partitioning, indexing, query tuning, production database troubleshooting.

**Payments / Commerce:** credit-card validation and transaction processing, multi-gateway routing, Authorize.Net, Moneris, PowerTranz, FAC, Eigen, legacy payment gateways, token operations, refunds, voids, proxy compatibility layers.

**AI / Voice Infrastructure:** OpenAI Realtime, Twilio Media Streams, RTP/UDP, G.711 mu-law/A-law, VAD, Whisper/faster-whisper, LangChain-style agents, vLLM, Qwen/Qwen3 ASR/TTS, Piper, ElevenLabs, MiniMax, local/GPU inference runtime planning.

**Operations / DevOps:** Linux deployment, systemd service templates, Docker Compose evidence in lawful-intercept simulator repos, RunPod/Vast.ai GPU deployment scripts, health/readiness endpoints, TAE logging, structured telemetry, troubleshooting runbooks.

## Career Narrative

### 2001-2007: Carrier Telecom Foundation
- Built and extended core Admin, Billing, Card, CDR, CR, UM, Alert, DataGuard, and Common platform services in C/C++.
- Added prepaid service support, CDR generation hooks, CRServer integration, billing IDs, number management safeguards, QDN/SMSCDR/SMSC integrations, contact-data expansions, replication support, card batch functions, and early call-routing interfaces.
- Worked across Oracle/ODBC-era data access patterns and service-to-service socket clients used by carrier operations.

### 2008-2016: Reporting, Billing, Messaging, and Operational Scale
- Expanded job/report systems for daily and monthly carrier reporting, CDR-based revenue reports, account activity summaries, bucket reporting, voucher modification history, OTA subscriber reporting, deleted-account reporting, and customer-specific report variants.
- Supported billing jobs for periodic charges, account expiry, sweeps, bucket resets, data/CTS alerts, SMS/MMS notifications, orphan cleanup, CALEA processing, and account disablement.
- Maintained and evolved SMS/MMS/voicemail integrations, including MMSC and UM workflows, delivery reports, message cleanup, notification behavior, and customer-specific operational fixes.

### 2017-2024: Database Modernization, APIs, Payments, and Cloud-Adjacent Services
- Advanced UCDA database abstraction across PostgreSQL, Oracle OCI, MySQL, ODBC, INI, and in-memory backends.
- Added or documented PostgreSQL/libpq implementation patterns, optional connection pooling, SQL generation behavior, migration guidance, and production tuning recommendations.
- Worked on service-layer payment modernization in `serviceapp`, including C#/.NET credit-card processing, multi-gateway transaction routing, legacy proxy compatibility, Linux deployment guidance, and native-library integration.
- Worked with lawful-intercept and external API/service adapters, including ETSI X1/X2/X3 simulator and C++ Network Element implementations.

### 2025-2026: REST Modernization and AI/Voice Infrastructure
- Added optional embedded REST APIs to legacy telecom services while preserving socket/IDL contracts.
- Built shared `Common/rest` infrastructure and service-specific adapters for Admin, Bill, Card, UM, CR, and CDR workflows.
- Built AI voice-agent systems in `telecom_ivr` and `miffy`, including RTP media, Twilio/OpenAI Realtime integration, telecom backend tools, OSE REST data sources, voicemail playback, voucher top-up flows, add-on purchase flows, local realtime wrapper, vLLM/Qwen/Qwen3 ASR/TTS, and GPU deployment scripts.

## Evidence-Based Achievement Bullets

- Sustained and modernized a carrier-grade telecom platform over a 25-year code history, with evidence from source comments and commits spanning 2001-2026.
- Built and maintained core telecom backend services for account provisioning, prepaid billing, card/voucher management, CDR retrieval, call routing, voicemail/unified messaging, MMSC, job billing, and reporting.
- Extended legacy C++ socket/IDL service contracts across 479 reviewed IDL interfaces in AdminServer, BillControl, UMServer, CRServer, CardControl, CDRServer, and MMSCServer.
- Added foundational telecom capabilities including prepaid service support, CDR generation, CRServer integration, data replication, SMS/CDR server integration, contact-data expansions, card batch generation, and number-management safeguards.
- Modernized legacy C++ services with optional embedded REST APIs for Admin, Bill, Card, UM, CR, and CDR services, using opt-in `restpn` and `restthreads` settings to preserve backward compatibility.
- Designed a reusable `Common/rest` layer with HTTP parsing, route dispatch, JSON response helpers, IDL-friendly key aliases, route discovery, and transport/business error separation.
- Implemented REST mappings for account lookup/modification, rate plans, buckets, payment schedules, CDR generation, CDR queries, card status/activation, voicemail messages, call routing, packages, add-ons, and administrative operations.
- Built and supported job automation for recurring telecom operations: period charges, account expiry/disablement, bucket resets, customer sweeps, CTS/data/monthly alerts, SMS/MMS notifications, CALEA processing, orphan message cleanup, and file cleanup.
- Expanded reporting systems for CDR-derived revenue, account activity, bucket usage, vendor/card snapshots, deleted account information, OTA subscriber information, voucher history, daily/monthly reports, and customer-specific report formats.
- Supported MMSC and MMS sender capabilities, including WAP-209/MMSE encoding, multipart text/image messages, HTTP POST delivery, content-type detection, traceable error handling, and MMS troubleshooting workflows.
- Supported PostgreSQL modernization through UCDA/libpq integration, optional connection pooling, PostgreSQL build targets, schema/data-type migration guidance, partitioning design, indexing recommendations, and query/performance monitoring documentation.
- Authored PostgreSQL voicemail capacity planning for a 30M-subscriber / 150M-message workload, including hash partitioning by `clientid`, BIGINT/TIMESTAMP migration recommendations, PostgreSQL parameter tuning, and monitoring extension guidance. Production impact needs confirmation.
- Supported payment processing modernization through C#/.NET and legacy C++ credit-card services with multi-gateway routing, transaction processing, refunds/voids/token operations, tax/proxy compatibility, and Linux deployment guidance.
- Implemented and documented lawful-intercept interfaces, including ETSI X1/X2/X3 C++ components and Java/Spring Boot simulator evidence with mutual TLS, Docker Compose, Swagger, ADMF/MDF simulation, and X2/X3 delivery flows.
- Built telephony AI/IVR systems that replace menu-driven voicemail workflows with natural voice interactions over RTP using Whisper/Piper/OpenAI/Groq/local LLM options and deterministic telecom intent routing.
- Built Miffy, a realtime telecom voice agent using FastAPI, Twilio Media Streams, OpenAI Realtime-compatible WebSockets, RTP/UDP sessions, G.711 audio, VAD, telecom function calling, OSE REST backends, and operational analytics.
- Added Primal RTP integration with REST session creation, UDP media handling, jitter buffering, PCMU/PCMA codec validation, dynamic port allocation, session inspection, timeout cleanup, and a C++03 header-only client for legacy call-control integration.
- Built a local OpenAI Realtime-compatible wrapper for configurable STT/LLM/TTS providers: faster-whisper, OpenAI STT/TTS, vLLM/Qwen, Qwen3-ASR, Qwen3-TTS, Piper, ElevenLabs, and MiniMax.
- Added GPU runtime deployment artifacts for local AI services, including RunPod setup/start/stop/verify scripts, Vast.ai guidance, readiness checks, startup scripts, and systemd service examples.
- Improved operational troubleshooting through TAE trace IDs, REST request/response telemetry, result-code logging, latency tracking, health/readiness endpoints, structured error mapping, and documented runbooks.

## Project Descriptions

### Carrier Telecom Core Platform
Long-running C/C++ service platform covering AdminServer, BillServer, CDRServer, UMServer, CRServer, CardControl, MMSC, Common, AutoPay, AISClient, JobBillServer, and JobReportServer. Responsibilities include subscriber provisioning, prepaid billing, rate plans, CDRs, card/voucher systems, number routing, voicemail, SMS/MMS, MMSC, alerts, reporting, replication, and operational jobs.

**Technologies:** C/C++, IDL/socket services, Oracle OCI, ODBC, MySQL, PostgreSQL, UCDA, TAE logging, Linux/Windows service patterns.

### REST Modernization Program
Incrementally exposed legacy telecom systems through embedded HTTP/JSON APIs without breaking existing socket clients. Added common REST infrastructure, service adapters, discovery endpoints, canonical IDL naming, alias-friendly request fields, business-result envelopes, and opt-in startup configuration.

**Technologies:** C++, embedded HTTP server, JSON, IDL, Makefiles, Linux, PostgreSQL builds.

### Database Modernization / PostgreSQL Migration
Modernized database access through UCDA and PostgreSQL/libpq support, including connection pooling references, PostgreSQL-specific build files, migration documentation, schema recommendations, partitioning strategy, tuning parameters, and monitoring guidance.

**Technologies:** PostgreSQL, libpq, Oracle OCI, MySQL, ODBC, C++, connection pooling, partitioning, indexing, pg_stat_statements, auto_explain.

### Billing, Job Automation, and Reporting
Built and maintained batch/job services for recurring telecom operations and reporting. Work includes daily/monthly reports, account activity, airtime usage, CDR extraction, bucket reports, voucher history, card/vendor snapshots, account expiry alerts, data/CTS alerts, orphan cleanup, and CALEA handling.

**Technologies:** C++, UCDA, SQL, BillControl/Admin/UM/Card/CR clients, SMS/MMS, SMTP, TAE logging.

### MMSC / SMS / Messaging Infrastructure
Supported MMS and SMS-related systems including MMSC service interfaces, MMS sender functions, WAP/MMSE encoding, multipart MMS messages, intercarrier SMTP/MMS troubleshooting, mailbox correlation, notification delivery, and SMSC integrations.

**Technologies:** C/C++, MMSC, WAP-209/MMSE, HTTP POST, SMTP, SMSC, sockets, TAE logging.

### Payment Processing Services
Worked on serviceapp payment systems spanning legacy C++ and modern C#/.NET services. Architecture includes multiple payment gateways, proxy compatibility, transaction routing, tax calculation, token/refund/void support, reporting, and Linux deployment guidance.

**Technologies:** C#, .NET 8, C++, TCP/UDP, native library interop, Authorize.Net, Moneris, PowerTranz, FAC, Eigen, Linux deployment.

### Lawful Intercept / ETSI X1 X2 X3
Implemented and evaluated lawful-intercept components, including C++ X1/X2/X3 interfaces and Java/Spring Boot simulator integration for ADMF/MDF and Network Element test workflows.

**Technologies:** C++11, Java 21, Spring Boot, Maven, Docker Compose, mutual TLS, XML, ETSI TS 103 221, TCP, Swagger.

### AI Voice / IVR Modernization
Built AI voice systems that connect telephony media to telecom backend actions. `telecom_ivr` covers RTP, Whisper, Piper/OpenAI TTS, deterministic voicemail flows, cloud/local LLM providers, and UM Server integration. `miffy` advances the design with Twilio/OpenAI Realtime, RTP session APIs, OSE REST tools, voicemail playback, voucher top-up, add-ons, local realtime wrapper, and GPU model deployment.

**Technologies:** Python, FastAPI, WebSockets, Twilio, OpenAI Realtime, RTP/UDP, G.711, Whisper/faster-whisper, LangChain-style orchestration, vLLM, Qwen, Piper, RunPod/Vast.ai.

## Version Optimized For Senior Software Engineer

Senior backend engineer with 25+ years of C/C++ telecom platform experience and recent Python/AI voice infrastructure work. Strongest value is hands-on delivery across complex production systems: legacy service protocols, database access, REST modernization, CDR/billing/account workflows, voicemail, MMS/SMS, payments, lawful intercept, and realtime voice media.

**Resume bullets:**
- Maintained and modernized carrier-grade telecom systems across account, billing, CDR, card, voicemail, call-routing, messaging, job, and reporting services.
- Delivered backward-compatible REST APIs across legacy C++ services while preserving socket/IDL client contracts.
- Built production-oriented troubleshooting surfaces through TAE logging, trace IDs, result-code envelopes, request/response telemetry, health checks, and operational docs.
- Implemented telecom AI voice agents using RTP/Twilio/OpenAI Realtime-compatible media paths and backend tools for account, voucher, CDR, add-on, and voicemail actions.
- Worked across PostgreSQL, Oracle, MySQL, ODBC, C++, Python, C#, Java/Spring Boot, Linux services, and payment gateway integrations.

## Version Optimized For Software Architect / Staff Engineer

Software architect and staff-level engineer with a 25-year record of evolving carrier telecom systems without disrupting production contracts. Strongest value is architecture that connects legacy platforms to modern API, database, cloud, payment, lawful-intercept, and AI voice ecosystems.

**Resume bullets:**
- Defined incremental modernization paths for legacy telecom platforms: preserve stable socket/IDL contracts, add REST adapters, modernize database access, and expose safe integration surfaces for new applications and AI agents.
- Designed reusable service patterns across Admin, Bill, CDR, UM, CR, Card, MMSC, JobBill, reporting, payments, and lawful-intercept domains.
- Authored database migration and capacity guidance for PostgreSQL adoption, partitioning, connection pooling, schema optimization, and monitoring.
- Designed realtime telecom AI architecture across RTP/Twilio/OpenAI-compatible protocols, OSE REST backends, local/GPU inference wrappers, and operational deployment scripts.
- Balanced production constraints, legacy compatibility, and modernization goals across C++, Python, C#, Java/Spring Boot, PostgreSQL/Oracle, Linux, and telephony protocols.

## LinkedIn Headline

Senior Software Engineer & Architect | 25+ Years Telecom Platforms | C++/Python/C# | Billing/CDR/Voicemail/MMS | PostgreSQL/Oracle | AI Voice & Cloud Infrastructure

## LinkedIn About

I am a senior software developer and architect with 25+ years of experience building and modernizing carrier-grade telecom platforms.

My work spans C/C++ backend services, prepaid billing, account provisioning, CDRs, card/voucher systems, call routing, voicemail/unified messaging, SMS/MMS/MMSC, job automation, reporting, Oracle/PostgreSQL/MySQL database access, payment gateways, lawful-intercept interfaces, and production troubleshooting. I have spent much of my career keeping mission-critical legacy platforms stable while extending them for new business needs.

Recent work builds on that foundation: embedded REST APIs for legacy telecom services, PostgreSQL migration planning, Linux modernization, AI-powered IVR, RTP/Twilio/OpenAI Realtime voice agents, local vLLM/Qwen wrappers, and GPU-hosted AI runtime deployment scripts.

I am strongest where old and new systems must work together: preserving stable production contracts, finding practical migration paths, improving observability, and turning complex telecom backends into platforms that modern applications and AI agents can safely use.

## Claims That Need Confirmation Before Use With Hard Numbers

- Exact employer names, job titles by year, and official dates.
- Production subscriber counts, message volumes, call volumes, revenue protected, latency improvement, uptime, cost savings, and team size.
- Production ownership details for AWS EKS, Kubernetes, Helm, and Docker beyond the repo evidence found in simulator, AI runtime, and deployment-planning artifacts.
- Which payment gateways and lawful-intercept components were production-deployed versus implemented, tested, or analyzed.
- Which AI voice systems are prototypes, pilots, or production deployments.
