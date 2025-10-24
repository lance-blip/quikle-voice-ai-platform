# Quikle AI Voice Agent Platform – PRD & Master Prompt for Manus AI

## 1. Introduction and Product Vision
**Product Name**: Quikle  
**Vision**: Build a no-code, white-labeled end-to-end AI voice agent SaaS platform, replicating Thoughtly (app.thoughtly.com) feature-for-feature, with full Quikle branding and extensible architecture. The system must enable agencies to deploy, manage, and optimize sophisticated voice agents for SMBs while being robust, scalable, and intuitive.

---

## 2. Core Objectives
- Precisely reproduce the architecture, user experience, and core functionality of Thoughtly.
- Use Manus as the backend, but ensure the platform can be migrated to Supabase with minimal rework.
- Apply Quikle's branding, color palette, and visual identity across all UI layers.

---

## 3. Target Audience & User Personas
**Primary User (Agency Owner):**
- Needs multi-client management, advanced agent building, analytics, and white-label controls.
**Secondary User (SMB Client):**
- Views analytics dashboard for calls, recordings, transcripts, and agent results.

---

## 4. Functional Requirements
### 4.1 User & Agency Management
- Email/password authentication for Agency Owners.
- Multi-client architecture: agency account contains sub-accounts for each client.
- All agents, numbers, logs, and dashboards scoped per client sub-account.

### 4.2 Agent Builder: Visual Flow Editor
- Infinite, pannable/zoomable node canvas; drag-drop, draw connections.
- Node types: start, speak (with verbatim toggle and prompt mode), action (send SMS, book appointment via Calendly/Cal.com/Acuity/GoHighLevel; push/update CRM/sheets; webhook/API calls with variables), end node.
- Contextual configuration panel on the right, updating to reflect selected node.

### 4.3 Conversational AI Engine
- Dynamic fallback: if user goes out of flow, agent answers using Knowledge Base, then steers back to relevant node.
- **Knowledge Base (“Thoughts”):** Users can upload TXT, MP3/WAV, PDF, CSV, or ingest from a URL. All sources are searchable and updateable.

### 4.4 Voice & TTS Management
- Public library: Integrate with ElevenLabs + Cartesia (searchable, filterable by gender, accent, etc).
- Voice cloning: In-app recorder for 1–2 min; upload existing MP3/WAV. Secure processing.

### 4.5 Automations Hub
- Trigger-action workflow builder, separate from the call flow UI.
- Triggers: Incoming Webhook, On Call Completed.
- Actions: Extract fields (AI, text to structured fields), send webhook, create/update contact, call contact (retry + delay configuration).

### 4.6 Infrastructure & Data Management
- Phone number management: Buy/manage directly via Twilio/Telnyx, connect own carrier.
- Call logs: Detailed record (contact, agent, duration, transcript, summary, recording embedded).

---

## 5. Non-Functional Requirements
### Latency
- < 800 ms median voice-to-voice. Proof-of-concept threshold: 1500 ms.
- Breakdown: STT (100–400 ms), LLM TTFT (200–500 ms), TTS (200–300 ms), network (50–200 ms).
### Concurrency
- Standard plan supports ≥ 40 concurrent calls. Scalability to thousands for enterprise.
### Security
- Robust user authentication.
- API keys, call recordings encrypted at rest/in transit.
- Zero-exposure security (Cloudflare tunnel recommended, see Nova doc).

---

## 6. Architecture – Supabase-First Strategy (But Manus-First Implementation)
### Frontend
- Modern JS framework (React/Vue/Svelte); replicates Thoughtly UX.
### Backend
- **Doc Implementation:** Manus backend initially; code must be portable to Supabase (database, auth, edge functions, storage).
- **Supabase features to cover:** PostgreSQL (core DB), RLS (row-level security), Supabase Auth (JWT, sessions), Edge Functions (serverless business logic/workflows/webhooks, including Twilio/Telnyx call state orchestration, real-time conversation and post-call logic), Supabase Storage (call recordings, audio for cloning, KB docs), pgvector (semantic search embeddings for KB/thoughts).
- File and asset management: All storage must be decoupled, with references to user/account.
- External APIs for telephony, STT, TTS, LLM.
    - Twilio/Telnyx (numbers, calls)
    - Gladia/Deepgram (STT)
    - OpenAI/Google/Anthropic/Groq/Llama/Grok (LLM)
    - ElevenLabs/Cartesia (TTS)
- Real-time orchestration: Edge functions broker all real-time call stages, streaming media and state logic (see Thoughtly pipeline).

---

## 7. Branding & White-Labeling
- All UI skinning controlled via single branding layer reflecting Quikle brand:
  - **Primary**: #191970 Midnight Blue
  - **Secondary**: #E27D60 Coral
  - **Accent**: #41B3A3 Teal/Aquamarine
  - **Typography**: Poppins (headers), Lato (body)
  - **Voice/Tone**: Expert, accessible, positive, supportive, direct
- Agency Owner can upload logo; logo replaces Quikle logo across dashboards, especially client sharables.
- Optionally white-label platform URL.

---

## 8. Best Practices for Implementation (AI Agent Guidance)
- Follow rigorous PRD and agile delivery workflow: treat PRD as a living doc—annotate, revise, version.
- Design comprehensive unit and integration tests for each module (esp. voice/TTS/agent builder/concurrency/call logs).
- Optimize for minimum latency: pipeline STT → LLM → TTS with streaming endpoints, predictive caching, edge location-aware deployment.
- Strict role-based access and separation for agency/accounts, with row-level security and JWT authentication.
- Reference Thoughtly UI/UX and schema for replication. No deviation unless required for platform constraints.
- Modularize all external integrations so platform migration (Manus → Supabase) is simple and robust.
- Ensure knowledge base supports semantic search (pgvector or equivalent embedding engine).
- For infrastructure, apply Nova security and deployment architecture: containerization (Docker Compose), zero trust, Cloudflare tunnel (see Project Nova).

---

## 9. Project Management & Success Metrics
- Success = Functionality and UX/Branding match Thoughtly, with Quikle overlaying all branding.
- Secure, portable codebase ready for future migration to Supabase.
- <800ms median latency; ≥40 concurrent calls.
- All modules work independently before integration; full suite deployed as SaaS.
- Agency setup, agent creation, call flows, KB/fallback, analytics, automations, voice/TTS meet/exceed current Thoughtly features.

---

## 10. Open Questions
- Revisit third-party limits/rate restrictions for each vendor (Twilio, ElevenLabs, STT/LLM, storage).
- Finalize exact migration guide mapping Manus resources to Supabase tables/edges.
- Confirm UI details if any feature is ambiguous relative to Thoughtly.

---

## 11. Appendices
- Reference Quikle Branding Overview for images, colors, logo, and voice.
- Reference Project Nova doc for containerization, network topology, security details, zero-exposure best practice.
- Reference all feature sets as documented from Thoughtly (API, UI, pipeline, agent builder, analytics).

---

**End of PRD for Quikle AI Voice Platform – For Autonomous Agent Execution (Manus AI)**
