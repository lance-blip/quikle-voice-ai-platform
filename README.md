# Quikle Voice AI Platform

**A no-code, white-labeled end-to-end AI voice agent SaaS platform**

Quikle is a comprehensive voice AI platform designed to replicate and extend the capabilities of modern conversational AI systems. Built with a focus on agency-client management, sophisticated voice agent orchestration, and enterprise-grade scalability, Quikle empowers agencies to deploy, manage, and optimize AI voice agents for small and medium-sized businesses.

---

## 🎯 Vision

Build a production-ready SaaS platform that enables agencies to create and manage sophisticated AI voice agents with zero coding required. The platform provides a visual flow editor, knowledge base integration, voice cloning capabilities, and comprehensive analytics—all wrapped in a white-labeled interface that agencies can brand as their own.

---

## ✨ Key Features

### **Visual Flow Editor**
- Infinite, pannable/zoomable node canvas with drag-and-drop functionality
- Node types: start, speak, action (SMS, appointments, CRM/sheets integration, webhooks), and end nodes
- Real-time configuration panel that updates based on selected nodes
- Dynamic fallback handling using knowledge base when users deviate from the flow

### **Knowledge Base ("Thoughts")**
- Multi-format support: TXT, MP3/WAV, PDF, CSV, and URL ingestion
- Semantic search powered by vector embeddings (pgvector)
- Real-time updates and searchable content management

### **Voice & TTS Management**
- Integrated voice library from ElevenLabs and Cartesia
- Advanced filtering by gender, accent, language, and style
- In-app voice cloning with 1-2 minute recording or MP3/WAV upload
- Secure processing and storage of voice profiles

### **Automations Hub**
- Trigger-action workflow builder separate from call flows
- Triggers: Incoming Webhook, On Call Completed
- Actions: AI field extraction, webhook dispatch, contact management, scheduled callbacks

### **Multi-Tenant Architecture**
- Agency owner accounts with unlimited client sub-accounts
- Complete data isolation per client
- Role-based access control (RBAC) with JWT authentication
- Row-level security for all database operations

### **Analytics & Monitoring**
- Detailed call logs with transcripts, summaries, and embedded recordings
- Performance metrics and latency tracking
- Client-specific dashboards with white-label support
- Real-time call status monitoring

---

## 🏗️ Architecture

### **Technology Stack**

**Frontend**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC 11 for end-to-end type safety
- Wouter for client-side routing
- shadcn/ui component library

**Backend**
- Node.js with Express 4
- tRPC for API layer
- Drizzle ORM for database operations
- JWT-based authentication via Manus OAuth

**Database**
- MySQL/TiDB (Supabase-compatible schema)
- pgvector for semantic search
- Row-level security (RLS) for multi-tenancy

**External Integrations**
- **Telephony**: Twilio, Telnyx
- **STT**: Gladia, Deepgram
- **LLM**: OpenAI, Anthropic, Google, Groq, Llama, Grok
- **TTS**: ElevenLabs, Cartesia
- **Storage**: S3-compatible object storage

### **Architecture Principles**

The platform is designed with **portability** and **scalability** as core principles. While initially implemented with Manus backend services, the architecture is structured to enable seamless migration to Supabase with minimal code changes. All external integrations are modularized, database schemas follow Supabase conventions, and authentication patterns align with industry standards.

**Security** follows a zero-trust model with Cloudflare tunnel integration, end-to-end encryption for call recordings and API keys, and strict tenant data isolation. The system is containerized using Docker for consistent deployment across environments.

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js 22.x or higher
- pnpm package manager
- MySQL/TiDB database instance
- S3-compatible storage bucket

### **Installation**

```bash
# Clone the repository
git clone https://github.com/lance-blip/quikle-voice-ai-platform.git
cd quikle-voice-ai-platform

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
quikle-voice-ai-platform/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilities and tRPC client
├── server/                # Backend services
│   ├── _core/            # Framework infrastructure
│   ├── db.ts             # Database query helpers
│   └── routers.ts        # tRPC API procedures
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Table definitions
├── shared/               # Shared types and constants
├── storage/              # S3 storage helpers
├── docs/                 # Documentation and specifications
│   ├── quikle-master-prd-manus.md
│   ├── mission-overview.txt
│   └── script.py
├── database/             # Schema migrations and seeds
├── scripts/              # Deployment and utility scripts
├── tests/                # Test suites
├── .env.example          # Environment variable template
├── docker-compose.yml    # Container orchestration
└── README.md             # This file
```

---

## 🔧 Environment Variables

The platform requires several environment variables for proper operation. A complete template is provided in `.env.example`.

### **Core Configuration**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL/TiDB connection string | Yes |
| `JWT_SECRET` | Session cookie signing secret | Yes |
| `VITE_APP_ID` | Manus OAuth application ID | Yes |
| `OAUTH_SERVER_URL` | OAuth backend base URL | Yes |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal URL | Yes |

### **Storage Configuration**

| Variable | Description | Required |
|----------|-------------|----------|
| `BUILT_IN_FORGE_API_URL` | Manus built-in APIs endpoint | Yes |
| `BUILT_IN_FORGE_API_KEY` | Bearer token for built-in APIs | Yes |

### **Branding Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_TITLE` | Application title | Quikle Voice AI Platform |
| `VITE_APP_LOGO` | Logo image URL | (system default) |

### **External Service Keys** (Optional)

Configure these for production deployments:

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Twilio telephony
- `TELNYX_API_KEY` - Telnyx telephony
- `ELEVENLABS_API_KEY` - ElevenLabs TTS
- `CARTESIA_API_KEY` - Cartesia TTS
- `OPENAI_API_KEY` - OpenAI LLM
- `ANTHROPIC_API_KEY` - Anthropic LLM
- `DEEPGRAM_API_KEY` - Deepgram STT
- `GLADIA_API_KEY` - Gladia STT

---

## 💻 Development Workflow

### **Database Changes**

1. Update schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Add query helpers in `server/db.ts`
4. Create or update tRPC procedures in `server/routers.ts`

### **Adding Features**

1. Define database tables in `drizzle/schema.ts`
2. Create query functions in `server/db.ts`
3. Add tRPC procedures in `server/routers.ts`
4. Build UI components in `client/src/pages/`
5. Wire up with `trpc.*.useQuery/useMutation` hooks

### **Testing**

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test:unit
pnpm test:integration

# Run with coverage
pnpm test:coverage
```

---

## 🎨 Branding

Quikle uses a distinctive color palette and typography system designed for professional SaaS applications.

### **Color Palette**

- **Primary**: `#191970` (Midnight Blue) - Headers, primary actions, brand elements
- **Secondary**: `#E27D60` (Coral) - Accents, secondary actions, highlights
- **Accent**: `#41B3A3` (Teal/Aquamarine) - Interactive elements, success states

### **Typography**

- **Headings**: Poppins (sans-serif)
- **Body**: Lato (sans-serif)

### **Brand Voice**

Expert but accessible, growth-focused, supportive, practical, and professional. All communications should balance technical precision with clarity for non-technical users.

---

## 📊 Performance Targets

### **Latency**

- **Target**: < 800ms median voice-to-voice latency
- **Acceptable (PoC)**: < 1500ms
- **Breakdown**:
  - STT: 100-400ms
  - LLM TTFT: 200-500ms
  - TTS: 200-300ms
  - Network: 50-200ms

### **Concurrency**

- **Standard Plan**: ≥ 40 concurrent calls
- **Enterprise Scale**: Thousands of concurrent calls

### **Security**

- Zero-exposure architecture via Cloudflare tunnel
- AES-256 encryption for data at rest
- TLS 1.3 for data in transit
- API keys stored in secure vault
- Complete tenant data isolation

---

## 🚢 Deployment

### **Docker Deployment**

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Environment-Specific Configuration**

The platform supports multiple deployment environments:

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Production deployment with full security

Configuration is managed through environment variables and Docker Compose overrides.

---

## 🤝 Contributing

We welcome contributions to the Quikle platform! Please follow these guidelines:

### **Commit Message Format**

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear and structured commit history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(agent-builder): add voice cloning node type
fix(auth): resolve JWT token expiration issue
docs(readme): update deployment instructions
refactor(database): optimize call log queries
```

### **Branch Strategy**

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### **Pull Request Process**

1. Create a feature branch from `develop`
2. Make your changes with clear, conventional commits
3. Write or update tests as needed
4. Update documentation if required
5. Submit PR with detailed description
6. Ensure CI checks pass
7. Request review from maintainers

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[quikle-master-prd-manus.md](docs/quikle-master-prd-manus.md)** - Complete Product Requirements Document
- **[mission-overview.txt](docs/mission-overview.txt)** - Mission overview and execution scope
- **[script.py](docs/script.py)** - PRD structure and metadata extraction

Additional documentation will be added as the platform evolves.

---

## 📋 Roadmap

### **Phase 1: Core Platform** (Current)
- ✅ Project initialization and structure
- ✅ Authentication and multi-tenancy
- ✅ Database schema design
- 🔄 Visual flow editor
- 🔄 Knowledge base integration
- 🔄 Voice management system

### **Phase 2: Voice AI Pipeline**
- ⏳ STT integration (Gladia, Deepgram)
- ⏳ LLM orchestration (OpenAI, Anthropic)
- ⏳ TTS integration (ElevenLabs, Cartesia)
- ⏳ Real-time call handling
- ⏳ Voice cloning implementation

### **Phase 3: Advanced Features**
- ⏳ Automations hub
- ⏳ Analytics dashboard
- ⏳ White-label customization
- ⏳ Advanced integrations (CRM, calendars, webhooks)

### **Phase 4: Scale & Optimize**
- ⏳ Performance optimization (< 800ms latency)
- ⏳ Concurrency scaling (40+ simultaneous calls)
- ⏳ Enterprise features
- ⏳ Supabase migration path

---

## 🔒 Security

Security is a top priority for Quikle. We implement multiple layers of protection:

- **Zero-Trust Architecture**: All services communicate through encrypted channels
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: JWT-based with secure session management
- **Authorization**: Row-level security and role-based access control
- **API Security**: Rate limiting, input validation, and secure key storage
- **Audit Logging**: Comprehensive logging of all security-relevant events

For security concerns or to report vulnerabilities, please contact the maintainers directly.

---

## 📄 License

This project is proprietary software owned by Quikle. All rights reserved.

---

## 🙏 Acknowledgments

Quikle is built on the shoulders of giants. We acknowledge and thank the open-source community for the following technologies:

- React, TypeScript, and the JavaScript ecosystem
- tRPC for type-safe APIs
- Drizzle ORM for database operations
- shadcn/ui for beautiful components
- Tailwind CSS for utility-first styling
- The teams at ElevenLabs, Cartesia, OpenAI, Anthropic, Twilio, and Telnyx for their APIs

---

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [https://github.com/lance-blip/quikle-voice-ai-platform/issues](https://github.com/lance-blip/quikle-voice-ai-platform/issues)
- **Documentation**: See `docs/` directory
- **Email**: support@quikle.ai

---

**Built with ❤️ by the Quikle Team**

*Empowering agencies to deliver exceptional voice AI experiences*

