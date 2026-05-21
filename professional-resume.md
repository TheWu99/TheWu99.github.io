# Zichao Wu - Senior Software Engineer / Software Architect

Senior software developer and architect focused on carrier-grade telecom backends, database modernization, cloud/runtime operations, and AI voice-agent infrastructure. Evidence reviewed from local repositories: `AdminServer`, `BillServer`, `UMServer`, `CRServer`, `CardControl`, `JobBillServer`, `Common`, and `miffy`.

## Professional Summary

Senior software engineer and architect with deep experience modernizing legacy telecom platforms and building production-oriented backend systems across C++, Python, REST APIs, PostgreSQL, Oracle OCI, real-time media, and AI voice infrastructure. Strong record of extending carrier-grade account, billing, voicemail, card/voucher, call-routing, and job-processing services while preserving existing socket/IDL contracts. Recent work bridges legacy telecom systems into modern REST and AI workflows, including an OpenAI Realtime/Twilio/RTP voice agent, OSE-backed account tools, local vLLM/Qwen realtime wrapper, PostgreSQL migration strategy, and operational deployment scripts for GPU-hosted AI services.

## Technical Skills

**Languages:** C, C++, Python, Bash, SQL, Java/Spring Boot (needs confirmation from repos reviewed), JavaScript/HTML/CSS.

**Backend and API:** Legacy C++ socket/IDL services, embedded HTTP/JSON REST adapters, FastAPI, WebSockets, OpenAI Realtime-style protocols, Twilio Media Streams, RTP/UDP media bridges, C++03 header-only integration clients.

**Telecom Domains:** prepaid billing, account lifecycle, rating, CDRs, vouchers/cards, buckets/packages/add-ons, voicemail/UM, call routing, SMS/MMS notifications, CALEA workflows, IVR/voice-agent integration.

**Databases:** PostgreSQL/libpq, Oracle OCI, MySQL, ODBC, UCDA abstraction layer, connection pooling, prepared statements, migration planning, partitioning, indexing, query/performance tuning.

**AI / Voice Infrastructure:** OpenAI Realtime, Whisper/faster-whisper, vLLM, Qwen/Qwen3 ASR/TTS, Piper, ElevenLabs, MiniMax, G.711 mu-law/A-law, VAD, audio transcoding, realtime function calling.

**Cloud / DevOps:** Linux services, Makefiles, systemd service examples, RunPod/Vast.ai GPU runtime planning, AWS C6 build evidence. AWS EKS, Kubernetes, Helm, and production AWS ownership need confirmation from outside the reviewed repos.

**Reliability and Operations:** opt-in service flags, worker-thread configuration, TAE logging, request/response telemetry, health/readiness endpoints, error mapping, timeout handling, graceful fallback, operational runbooks.

## Evidence-Based Achievement Bullets

- Modernized five legacy C++ telecom services by adding optional embedded REST APIs beside existing socket/IDL interfaces for AdminServer, BillControl, CardControl, UMServer, and CRServer, preserving backward compatibility through opt-in `restpn` and `restthreads` runtime settings.
- Designed and reused a dependency-light `Common/rest` layer with HTTP parsing, route dispatch, JSON response helpers, case-insensitive route matching, and IDL-friendly request key aliases, reducing repeated REST plumbing across service adapters.
- Brought 447 legacy IDL interfaces into REST modernization scope across Admin, Bill, UM, CR, and Card services; AdminServer documentation states all listed interfaces are concretely mapped, while other adapters expose discovery and return clear HTTP `501` for known-but-unmapped methods.
- Built REST mappings for high-value telecom operations including account lookup/modification, rate plans, buckets, payment schedules, CDR generation, card activation/status, voicemail message retrieval, call-routing number management, and package/add-on workflows.
- Implemented an AI-powered telecom voice agent, Miffy, using FastAPI, WebSockets, Twilio Media Streams, OpenAI Realtime, server-side VAD, G.711 audio, telecom function calling, and OSE REST backends for live account, billing, CDR, card, and voicemail actions.
- Extended Miffy beyond Twilio by adding Primal RTP session APIs, UDP RTP handling, jitter buffering, codec validation for PCMU/PCMA, RTP-to-OpenAI audio bridging, session timeout cleanup, and a C++03 header-only REST client for legacy Primal call-control integration.
- Replaced mock voice-agent data paths with OSE REST-backed account lookup, subscriber greeting, voucher top-up through Bill `GenCDR6`, call-history retrieval through CDR `GetRecAccount2`, Card voucher validation, and structured OSE REST telemetry with latency and result-code logging.
- Built a local OpenAI Realtime-compatible wrapper that can route STT, LLM, and TTS through faster-whisper/OpenAI/Qwen3-ASR, vLLM/Qwen, Piper/Qwen3-TTS/OpenAI/ElevenLabs/MiniMax while keeping Miffy’s telecom tool execution model intact.
- Added readiness checks, provider configuration, startup scripts, RunPod setup/start/stop/verify scripts, and systemd service templates for GPU-hosted Qwen/vLLM/Qwen3-ASR/Qwen3-TTS wrapper deployments.
- Authored PostgreSQL modernization guidance for voicemail scale, including UCDA/libpq reference material, optional connection pooling, 30M-subscriber/150M-message capacity planning, hash partitioning by `clientid`, optimized BIGINT/TIMESTAMP schema recommendations, and monitoring/tuning guidance. Production deployment impact needs confirmation.
- Supported operational telecom job automation in JobBillServer for periodic charging, account expiry/disablement, bucket resets, data/package alerts, SMS/MMS notification flows, CALEA configuration, and encrypted CALEA SMS file handling.
- Built a local C++ encryption web tool around the shared `CEncryption` library with login, MD5-hash ini user loading, form-based conversion API, and SMS-focused encryption modes for development/testing workflows.

## Project Descriptions

### Legacy Telecom REST Modernization
Modernized carrier telecom C++ services by layering REST over existing IDL-style interfaces without removing legacy socket behavior. Services include AdminServer, BillControl, CardControl, UMServer, and CRServer. The shared REST layer provides route registration, request parsing, JSON responses, discovery endpoints, configurable worker threads, and consistent business-result envelopes.

**Technologies:** C++, Common/rest, IDL, JSON, HTTP, Makefiles, Linux, PostgreSQL builds.

### Miffy AI Telecom Voice Agent
Realtime voice agent for telecom subscriber support. Miffy handles inbound Twilio calls and Primal RTP sessions, connects to OpenAI Realtime or a local-compatible wrapper, and executes telecom tools for balance, CDR history, vouchers, add-ons, purchases, voicemail, and greetings. The implementation includes caller-number resolution through Admin REST, OSE REST logging, function-call handling, sentiment/prompt-drift tracking, and voicemail audio playback.

**Technologies:** Python, FastAPI, WebSockets, Twilio, OpenAI Realtime, RTP/UDP, G.711, asyncio, REST, PostgreSQL-backed telecom services.

### Local Realtime AI Wrapper / GPU Runtime
Built an OpenAI Realtime-compatible wrapper so Miffy can use local or configurable AI providers while preserving the same realtime protocol and tool workflow. The wrapper supports STT, LLM, and TTS provider selection, readiness checks, test coverage, Qwen/vLLM deployment scripts, and RunPod/systemd operations for GPU testing.

**Technologies:** FastAPI, WebSockets, faster-whisper, OpenAI STT/TTS, vLLM, Qwen/Qwen3-ASR/Qwen3-TTS, Piper, ElevenLabs, MiniMax, systemd, RunPod/Vast.ai.

### PostgreSQL / UCDA Modernization
Documented and supported PostgreSQL migration paths for legacy telecom systems using UCDA as a database abstraction layer across Oracle OCI, MySQL, ODBC, in-memory, INI, and PostgreSQL backends. The reviewed code includes PostgreSQL-specific libpq integration, connection pooling references, SQL generation patterns, and performance-focused voicemail database recommendations.

**Technologies:** PostgreSQL, libpq, Oracle OCI, MySQL, ODBC, C++, UCDA, partitioning, indexing, pg_stat_statements, auto_explain.

### Telecom Job Automation
JobBillServer automates recurring telecom operational work: periodic charges, customer/account sweeps, bucket resets, monthly/data/CTS alerts, orphan voicemail cleanup, CALEA processing, SMS/MMS notification flows, and service integrations with Admin, Bill, UM, CR, Card, Alert, SMSC, and DataGuard clients.

**Technologies:** C++, UCDA, BillControl/AdminServer/UMServer clients, TAE logging, SMS/MMS, SMTP, CALEA, Linux service runtime.

## Resume Version: Senior Software Engineer

**Summary:** Senior backend and telecom software engineer with strong C++/Python experience modernizing legacy carrier systems, building REST APIs over existing service contracts, and integrating realtime AI voice workflows with account, billing, CDR, card, and voicemail backends. Comfortable owning production troubleshooting across Linux services, databases, network protocols, audio streams, and cross-service APIs.

**Selected bullets:**
- Delivered opt-in REST modernization across legacy C++ telecom services while preserving existing socket/IDL contracts and minimizing migration risk for dependent systems.
- Implemented service-specific REST adapters for account, billing, card, voicemail, and call-routing workflows with consistent JSON envelopes, discovery endpoints, and business-result handling.
- Built Miffy, a realtime telecom support voice agent connecting Twilio/OpenAI Realtime/RTP media to live backend tools for account lookup, voucher top-up, CDR history, add-ons, purchases, and voicemail.
- Added RTP/UDP media bridging with jitter buffering, G.711 codec handling, dynamic port allocation, session inspection, timeouts, and a C++03 REST client for legacy integration.
- Improved operability with structured REST telemetry, latency tracking, tool success/failure events, health/readiness endpoints, startup scripts, and deployment runbooks.

## Resume Version: Software Architect / Staff Engineer

**Summary:** Software architect and staff-level engineer specializing in modernization of carrier telecom platforms, database migration strategy, and AI-enabled cloud/runtime architecture. Experienced designing incremental migration paths that preserve legacy protocols while enabling REST, realtime AI agents, PostgreSQL, GPU inference, and operational automation.

**Selected bullets:**
- Defined an incremental modernization architecture that layers reusable embedded REST adapters over legacy C++ IDL services, creating a bridge from carrier backends to modern web, automation, and AI workflows.
- Established shared REST conventions across Admin, Bill, Card, UM, and CR systems: discovery endpoints, canonical IDL naming, alias-friendly JSON input, transport/business error separation, and opt-in runtime configuration.
- Designed Miffy’s end-to-end voice-agent architecture across Twilio Media Streams, Primal RTP, OpenAI Realtime-compatible protocols, telecom function tools, OSE REST services, and local/GPU AI provider options.
- Authored PostgreSQL capacity and migration guidance for large voicemail workloads, including schema optimization, hash partitioning, connection pooling, monitoring extensions, and hardware/runtime tuning. Production impact metrics need confirmation.
- Planned GPU-hosted local AI infrastructure with RunPod/Vast.ai, vLLM/Qwen, Qwen3-ASR/TTS, readiness checks, systemd service templates, and clear security guidance around localhost-bound model endpoints.

## LinkedIn Headline

Senior Software Engineer & Architect | Telecom Backend Modernization | C++/Python | PostgreSQL/Oracle | Realtime AI Voice Agents | Cloud/GPU Infrastructure

## LinkedIn About

I am a senior software developer and architect focused on modernizing carrier-grade telecom systems and connecting them to modern API, cloud, database, and AI workflows.

My work spans legacy C++ backend services, prepaid billing, account management, cards/vouchers, CDRs, voicemail, call routing, job automation, PostgreSQL/Oracle migration, and production troubleshooting. Recent projects include adding embedded REST APIs to core telecom services, building an AI-powered realtime voice agent for subscriber support, and designing local/GPU AI runtime infrastructure with OpenAI Realtime-compatible protocols, vLLM/Qwen, STT/TTS providers, RTP media handling, and telecom backend tools.

I am strongest where architecture and production reality meet: preserving stable legacy contracts, creating pragmatic migration paths, improving reliability and observability, and turning complex backend systems into platforms that newer applications and AI agents can safely use.

## Claims That Need Confirmation Before Use With Numbers

- Exact years of experience and employer/client names.
- Production subscriber volume, call volume, revenue, latency, uptime, or cost-savings outcomes.
- AWS EKS, Kubernetes, Helm, and Docker production deployment ownership for the reviewed telecom/Miffy repos. The repo evidence includes RunPod/Vast.ai GPU planning, systemd scripts, AWS C6 build evidence, and Kubernetes/RTP considerations, but not complete EKS/Helm manifests in the target repositories reviewed.
- Java/Spring Boot production ownership. This is in the provided background, but not evidenced in the reviewed target repos.
