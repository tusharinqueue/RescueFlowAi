# RescueFlowAI – Technical Reference & Architecture Documentation (`info.md`)

Welcome to the complete codebase analysis for **RescueFlowAI** — an AI-powered emergency response and dispatch platform designed for rapid incident triage, multimodal reporting, automated resource allocation, and real-time situational analytics.

---

## 1. System Overview & Key Features

RescueFlowAI connects citizens, emergency dispatchers, and first responders through a decoupled full-stack architecture:

- **Frontend**: Next.js 16 (App Router + Turbopack), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: FastAPI (Python 3.11+), Pydantic v2 Settings & Schemas, Uvicorn, Supabase Auth/DB (PostgreSQL + RLS), Gemini AI & OpenAI integrations, Twilio Voice API.

### Core Features
1. **Multimodal Citizen Reporting (`/report`)**:
   - Audio/speech-to-text recording, photo uploads, geo-location detection, incident severity calculation, and quick reporting modal.
2. **AI Incident Analysis & Triage (`/ai/analyze`, `/ai/transcribe`)**:
   - Automatic classification (Road Accident, Fire, Medical, Industrial, Natural Disaster, Security).
   - AI confidence scoring, estimated casualties calculation, and recommended responder units.
   - Whisper-powered audio dispatch transcriptions.
3. **Real-time Dispatcher Command Center (`/dashboard`, `/dispatch`, `/incidents`)**:
   - Dynamic dispatch management matrix, live responder status tracking (En Route, On Scene, Available).
   - Instant unit assignment and status mutation.
4. **Interactive GIS Incident Heatmap & Live Map (`/map`)**:
   - Geospatial incident positioning, status indicators, and department readiness metrics.
5. **Analytics & Performance Monitoring (`/analytics`)**:
   - Incident volume trends (Line Charts), severity breakdowns (Donut Charts), resolution SLA metrics, and active personnel metrics.
6. **Automated Demo Voice Call Dispatch (`/voice/call`)**:
   - Twilio integration for automated outbound phone call dispatches to emergency first responders.
7. **Authentication & Role-Based Access Control (RBAC)**:
   - Supabase JWT authentication supporting 4 user roles: `citizen`, `dispatcher`, `responder`, `admin`.
   - Dual-mode Edge middleware: auto-bypasses auth guards during local dev/demo mode when Supabase keys are unconfigured.

---

## 2. Directory Structure Tree

```
RescueFlowAI/
├── .gitignore                      # Git ignore patterns for root repository
├── CLAUDE.md                       # Project coding standards, instructions, and commands
├── LICENSE                         # MIT License
├── README.md                       # High-level overview and setup guide
├── SPEC.md                         # Product specification and feature specifications
├── docker-compose.yml              # Local container orchestrations (backend + dev environment)
├── info.md                         # Comprehensive technical reference document (This file)
│
├── backend/                        # FastAPI Python 3.11 Backend
│   ├── .env.example                # Example backend environment variables
│   ├── .gitignore                  # Git ignore rules for backend
│   ├── main.py                     # Entry point: FastAPI app factory, CORS, lifespan, exception handlers
│   ├── pytest.ini                  # Pytest test suite configuration
│   ├── requirements.txt            # Python package dependencies (fastapi, pydantic, supabase, etc.)
│   │
│   ├── app/
│   │   ├── __init__.py             # App package initializer
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py          # Central V1 API Router aggregator
│   │   │       └── routers/
│   │   │           ├── ai.py       # AI endpoints (/analyze, /transcribe)
│   │   │           ├── dispatch.py # Dispatch endpoints (/dispatch)
│   │   │           ├── health.py   # System health-check endpoint (/health)
│   │   │           ├── incidents.py# Incident CRUD & status endpoints (/incidents)
│   │   │           └── voice.py    # Twilio automated voice call trigger endpoint (/voice/call)
│   │   │
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings singleton (App, Supabase, Gemini, OpenAI, Twilio)
│   │   │   ├── exceptions.py       # Custom exception hierarchy & global FastAPI exception handlers
│   │   │   └── security.py         # Supabase JWT token validator & RBAC dependencies
│   │   │
│   │   ├── db/
│   │   │   └── supabase.py         # Supabase admin (service-role) & anon client factories
│   │   │
│   │   ├── schemas/
│   │   │   ├── ai_report.py        # Pydantic models for AI request & response structures
│   │   │   ├── dispatch.py         # Pydantic models for unit dispatch requests & responses
│   │   │   ├── incident.py         # Incident creation, update, and detail response models
│   │   │   ├── response.py         # Standardized API generic response wrappers & paginated schemas
│   │   │   └── voice.py            # Twilio voice call payload & status schemas
│   │   │
│   │   └── services/
│   │       ├── ai_service.py       # Gemini 1.5 & OpenAI Whisper AI integration logic
│   │       ├── incident_service.py # Database operations & business logic for incidents
│   │       ├── notification_service.py # Firebase / Push notification dispatch service stub
│   │       └── voice_service.py    # Twilio REST API voice call execution logic
│   │
│   └── tests/                      # Pytest unit & integration test suites
│
└── frontend/                       # Next.js 16 TypeScript Frontend
    ├── .env.example                # Example frontend environment variables
    ├── .gitignore                  # Git ignore rules for Next.js frontend
    ├── components.json             # shadcn/ui configuration file
    ├── next.config.js              # Next.js build & image domain configuration
    ├── package.json                # Project scripts and dependencies
    ├── package-lock.json           # Locked npm dependencies tree
    ├── postcss.config.js           # PostCSS configuration for Tailwind CSS
    ├── tailwind.config.ts          # Custom Tailwind design system tokens, colors, & keyframes
    ├── tsconfig.json               # TypeScript compiler options
    │
    └── src/
        ├── middleware.ts           # Next.js Edge Auth & Supabase session middleware
        │
        ├── app/                    # Next.js 16 App Router Routes
        │   ├── layout.tsx          # Root HTML layout with Inter font and CSS imports
        │   ├── page.tsx            # High-impact Landing Page with hero section, live stats & feature cards
        │   ├── loading.tsx         # Global route loading UI fallback
        │   ├── error.tsx           # Global error boundary UI fallback
        │   ├── not-found.tsx       # Custom 404 page
        │   ├── globals.css         # CSS variables, glassmorphism tokens, dark theme styles
        │   │
        │   ├── (auth)/             # Auth Route Group (shared minimal layout)
        │   │   ├── layout.tsx      # Auth container layout
        │   │   ├── login/
        │   │   │   └── page.tsx    # Interactive Login Page with demo quick-login presets
        │   │   └── register/
        │   │       └── page.tsx    # User registration form with role selector
        │   │
        │   ├── (dashboard)/        # Main App Dashboard Route Group (shared Sidebar + Navbar layout)
        │   │   ├── layout.tsx      # Authenticated shell layout (Sidebar + Header + PageContainer)
        │   │   ├── dashboard/
        │   │   │   └── page.tsx    # Dispatch Command Dashboard (KPI stats, Heatmap, AI Insights, Active Units)
        │   │   ├── incidents/
        │   │   │   ├── page.tsx    # Incidents List & Filtering Table
        │   │   │   └── [id]/
        │   │   │       └── page.tsx# Comprehensive Incident Detail view with AI breakdown & dispatch panel
        │   │   ├── dispatch/
        │   │   │   └── page.tsx    # Dedicated Dispatcher Management Matrix
        │   │   ├── analytics/
        │   │   │   └── page.tsx    # Analytics & Insights Dashboard (Recharts graphs & metrics)
        │   │   ├── map/
        │   │   │   └── page.tsx    # GIS Live Incident Map View
        │   │   └── settings/
        │   │       └── page.tsx    # System settings, notifications, & user profile management
        │   │
        │   └── report/
        │       └── page.tsx        # Public Emergency Incident Reporting Wizard (Speech, Media, GPS)
        │
        ├── components/             # UI Components Library
        │   ├── dashboard/          # Dashboard Widgets
        │   │   ├── active-responders.tsx  # Live responder units list & status badges
        │   │   ├── ai-insight-card.tsx    # Gemini AI emergency triage summary card
        │   │   ├── department-status.tsx  # Department readiness ring progress bars
        │   │   ├── incident-heatmap.tsx   # Visual spatial heatmap grid component
        │   │   ├── incident-timeline.tsx  # Chronological log of incident state changes
        │   │   ├── quick-report-button.tsx# Floating SOS quick report button
        │   │   └── stats-grid.tsx         # Quick stat KPI overview grid
        │   │
        │   ├── incident-reporting/
        │   │   └── quick-report-modal.tsx # SOS Emergency Reporting Modal Dialog
        │   │
        │   ├── layout/
        │   │   └── page-container.tsx    # Standardized responsive container wrapper
        │   │
        │   ├── navigation/
        │   │   ├── navbar.tsx             # Top bar header with search modal, notifications, & profile menu
        │   │   └── sidebar.tsx            # Left navigation sidebar with active tab highlighting
        │   │
        │   └── ui/                        # Reusable Atomic Design UI Components
        │       ├── badge.tsx              # Status & Severity Badge badges
        │       ├── button.tsx             # Custom styled button with variants & loading state
        │       ├── card.tsx               # Glassmorphism container cards
        │       ├── count-up.tsx           # Animated numbers counter component
        │       ├── donut-chart.tsx        # SVG Donut Chart component for severity distribution
        │       ├── input.tsx              # Form text field & textarea inputs
        │       ├── line-chart.tsx         # SVG Line Chart component for time-series analytics
        │       ├── notification-panel.tsx # Slide-out header notification dropdown panel
        │       ├── progress-bar.tsx       # Animated status bar indicator
        │       ├── ring-progress.tsx      # SVG Circular progress ring widget
        │       ├── search-modal.tsx       # Global search dialog filter modal
        │       ├── skeleton.tsx           # UI loading skeleton place-holder
        │       ├── spinner.tsx            # SVG loading spinner
        │       └── stat-card.tsx          # Stat widget with metric trends
        │
        ├── hooks/
        │   └── use-async.ts               # Custom React hook for handling asynchronous promise states
        │
        ├── lib/
        │   ├── mock-data.ts               # Fallback mock dataset (incidents, units, stats, AI reports)
        │   ├── utils.ts                   # Utility helper functions (cn, formatDate, severity badge helpers)
        │   ├── api/
        │   │   └── client.ts              # Custom Axios API client instance with JWT request/response interceptors
        │   └── supabase/
        │       ├── client.ts              # Browser Supabase client creator
        │       └── server.ts              # Server-side Supabase client creator
        │
        └── types/
            ├── database.ts                # Database table types placeholder
            └── index.ts                   # Domain types, Enums, Interfaces (Incident, User, GeoLocation, AiReport)
```

---

## 3. Deep-Dive File Breakdown

### Root Files

#### [`CLAUDE.md`](file:///e:/Clone/RescueFlowAI/CLAUDE.md)
- **Purpose**: Reference guidelines for repository architecture, key commands, code style rules, and development practices.

#### [`docker-compose.yml`](file:///e:/Clone/RescueFlowAI/docker-compose.yml)
- **Purpose**: Container orchestration specification for running FastAPI backend, PostgreSQL, and Redis locally in containerized environments.

---

### Backend Files (`/backend`)

#### [`backend/main.py`](file:///e:/Clone/RescueFlowAI/backend/main.py)
- **Purpose**: The FastAPI application factory and execution entry point.
- **Main Functions**:
  - `lifespan(app: FastAPI)`: Async context manager for startup logging and resource warming.
  - `create_application() -> FastAPI`: Configures application routes, CORS middleware (`CORSMiddleware`), custom exception handlers, and mounts `/api/v1` router.
- **Main Variables**: `app` (FastAPI singleton), `api_router`.

#### [`backend/app/core/config.py`](file:///e:/Clone/RescueFlowAI/backend/app/core/config.py)
- **Purpose**: Centralized application configuration powered by `pydantic-settings`.
- **Main Classes & Functions**:
  - `Settings(BaseSettings)`: Validates environment variables (`.env`). Key variables: `APP_NAME`, `APP_ENV`, `DEBUG`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.
  - `get_settings() -> Settings`: LRU-cached settings accessor function.

#### [`backend/app/core/security.py`](file:///e:/Clone/RescueFlowAI/backend/app/core/security.py)
- **Purpose**: Security utilities, Supabase JWT verification, and Role-Based Access Control (RBAC) dependencies.
- **Main Functions**:
  - `get_current_user(credentials)`: Validates bearer token against Supabase Auth (`supabase.auth.get_user(token)`), returning user dict (`id`, `email`, `role`).
  - `require_dispatcher(user)`: Enforces `dispatcher` or `admin` role authorization.
  - `require_admin(user)`: Enforces `admin` role authorization.

#### [`backend/app/core/exceptions.py`](file:///e:/Clone/RescueFlowAI/backend/app/core/exceptions.py)
- **Purpose**: Domain exception hierarchy and global error handlers.
- **Main Classes**:
  - `RescueFlowException(Exception)`: Base custom exception.
  - Subclasses: `IncidentNotFoundException`, `UnauthorizedAccessException`, `AIServiceException`, `VoiceServiceException`.
- **Handlers**: `rescue_flow_exception_handler`, `unhandled_exception_handler`.

#### [`backend/app/db/supabase.py`](file:///e:/Clone/RescueFlowAI/backend/app/db/supabase.py)
- **Purpose**: Supabase Python client initializers.
- **Main Functions**:
  - `get_supabase_client()`: Cached Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS).
  - `get_supabase_anon_client()`: User-scoped client using `SUPABASE_ANON_KEY`.

#### [`backend/app/api/v1/api.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/api.py)
- **Purpose**: Aggregates all V1 API domain routers under `/api/v1`.
- **Main Variable**: `api_router` (`APIRouter`).

#### Router Files (`backend/app/api/v1/routers/`)
1. [`incidents.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/routers/incidents.py):
   - `POST /api/v1/incidents/`: `create_incident()` — Accepts `CreateIncidentRequest`, returns `IncidentResponse`.
   - `GET /api/v1/incidents/`: `list_incidents()` — Returns paginated `PaginatedResponse[IncidentResponse]`.
   - `GET /api/v1/incidents/{incident_id}`: `get_incident()`.
   - `PATCH /api/v1/incidents/{incident_id}/status`: `update_incident_status()`.
2. [`ai.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/routers/ai.py):
   - `POST /api/v1/ai/analyze`: `analyze_incident()` — Triggers Gemini incident classification & triage.
   - `POST /api/v1/ai/transcribe`: `transcribe_audio()` — Triggers Whisper audio transcription.
3. [`dispatch.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/routers/dispatch.py):
   - `POST /api/v1/dispatch/`: `dispatch_responders()` — Requires dispatcher role to assign responder units.
4. [`voice.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/routers/voice.py):
   - `POST /api/v1/voice/call`: `trigger_voice_call()` — Initiates automated Twilio call.
5. [`health.py`](file:///e:/Clone/RescueFlowAI/backend/app/api/v1/routers/health.py):
   - `GET /api/v1/health/`: `health_check()` — Returns operational status, app version, and UTC timestamp.

#### Schemas (`backend/app/schemas/`)
- `incident.py`: `CreateIncidentRequest`, `UpdateIncidentStatusRequest`, `IncidentResponse`.
- `ai_report.py`: `AnalyzeIncidentRequest`, `AiIncidentReport`.
- `dispatch.py`: `DispatchRequest`, `DispatchResponse`, `DispatchedUnitSchema`.
- `voice.py`: `TriggerVoiceCallRequest`, `VoiceCallResponse`.
- `response.py`: `APIResponse[T]`, `PaginatedResponse[T]`.

#### Services (`backend/app/services/`)
- `incident_service.py`: `IncidentService` class for database querying, creation, and status mutation.
- `ai_service.py`: `AIService` class encapsulating Google Gemini API & OpenAI Whisper calls.
- `voice_service.py`: `VoiceService` class wrapping Twilio client calls.
- `notification_service.py`: `NotificationService` class for push notifications.

---

### Frontend Files (`/frontend`)

#### Top-level Frontend Files
- [`middleware.ts`](file:///e:/Clone/RescueFlowAI/frontend/src/middleware.ts): Edge middleware refreshing Supabase session cookies and guarding `/dashboard`, `/incidents`, `/dispatch`, `/map`, `/settings`. Auto-bypasses guards in demo mode when Supabase env variables are missing.
- [`tailwind.config.ts`](file:///e:/Clone/RescueFlowAI/frontend/tailwind.config.ts): Custom design system specifying color palettes (cyan, emerald, rose, amber, glass tokens) and keyframe animations (`pulse-subtle`, `shimmer`).

#### Route Pages (`frontend/src/app/`)

1. [`layout.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/layout.tsx): Root layout setting up `Inter` font, metadata, and HTML container.
2. [`page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/page.tsx): High-impact landing page featuring animated live ticker stats, emergency report CTA, and interactive feature highlights.
3. [`(auth)/login/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(auth)/login/page.tsx): Authentication page with quick preset buttons for Instant Citizen, Dispatcher, and Responder logins.
4. [`(auth)/register/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(auth)/register/page.tsx): User registration screen supporting role selection.
5. [`(dashboard)/layout.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/layout.tsx): Authenticated container layout integrating [`Sidebar`](file:///e:/Clone/RescueFlowAI/frontend/src/components/navigation/sidebar.tsx), [`Navbar`](file:///e:/Clone/RescueFlowAI/frontend/src/components/navigation/navbar.tsx), and [`PageContainer`](file:///e:/Clone/RescueFlowAI/frontend/src/components/layout/page-container.tsx).
6. [`(dashboard)/dashboard/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/dashboard/page.tsx): Central dispatch dashboard aggregating stat grids, AI insight cards, department readiness ring charts, active responders, and heatmap views.
7. [`(dashboard)/incidents/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/incidents/page.tsx): Incidents list page with search, severity filter pills, status dropdowns, and tabular views.
8. [`(dashboard)/incidents/[id]/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/incidents/[id]/page.tsx): Comprehensive incident detail workspace displaying location details, uploaded media, AI triage analysis summary, dispatched units timeline, and instant unit assignment options.
9. [`(dashboard)/dispatch/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/dispatch/page.tsx): Command matrix interface for emergency dispatchers to view pending incidents and dispatch nearest responder units.
10. [`(dashboard)/analytics/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/analytics/page.tsx): Analytics dashboard with SVG line charts (incident trends), donut charts (severity distribution), and key performance indicators.
11. [`(dashboard)/map/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/map/page.tsx): Interactive GIS map workspace showing real-time incident pins and location metrics.
12. [`(dashboard)/settings/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/(dashboard)/settings/page.tsx): System configurations page for notification thresholds, AI confidence scores, and profile management.
13. [`report/page.tsx`](file:///e:/Clone/RescueFlowAI/frontend/src/app/report/page.tsx): Multimodal emergency incident reporting wizard supporting browser geolocation detection, live voice recording/transcription, image attachment previews, and immediate submission.

#### Component Library (`frontend/src/components/`)

##### Dashboard Components (`/components/dashboard/`)
- `stats-grid.tsx`: Grid displaying key operational metrics (Total Incidents, Active Units, Avg Response Time, AI Accuracy).
- `ai-insight-card.tsx`: Card showcasing Gemini AI's triage report, confidence score, recommended units, and immediate action items.
- `department-status.tsx`: Progress rings displaying readiness percentages for Police, Fire, Ambulance, and Rescue departments.
- `active-responders.tsx`: List of active unit badges, location status (En Route, On Scene), and ETA indicators.
- `incident-heatmap.tsx`: Visual spatial grid depicting high-density incident locations.
- `incident-timeline.tsx`: Event stream detailing state transitions for incidents.
- `quick-report-button.tsx`: Floating action button for opening emergency report modal.

##### Navigation & Layout Components (`/components/navigation/`, `/components/layout/`)
- `navbar.tsx`: Header bar featuring search dialog trigger, notification panel, active role display, and user avatar menu.
- `sidebar.tsx`: Collapsible left sidebar menu with active path styling and system branding.
- `page-container.tsx`: Responsive container wrapping page content with consistent padding and max-widths.

##### UI Atomic Components (`/components/ui/`)
- `button.tsx`: Styled button supporting `primary`, `secondary`, `danger`, `outline`, and `ghost` variants.
- `card.tsx`: Card, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` containers.
- `badge.tsx`: Colored status and severity pills (`critical`, `high`, `moderate`, `low`, `pending`, `dispatched`, etc.).
- `count-up.tsx`: Smooth animated number counter for statistics.
- `donut-chart.tsx`: Lightweight SVG donut chart renderer with legend support.
- `line-chart.tsx`: Lightweight SVG line chart renderer for trend visualization.
- `notification-panel.tsx`: Dropdown drawer displaying real-time alert notifications.
- `search-modal.tsx`: Global search modal dialog filtering incidents by title, location, or ID.
- `ring-progress.tsx`: Circular SVG progress indicator widget.
- `progress-bar.tsx`: Linear progress bar component.
- `input.tsx`: Form text inputs and textareas with standard styling.
- `skeleton.tsx` & `spinner.tsx`: Loading state indicator utilities.

#### Core Data & Utilities (`frontend/src/lib/`, `frontend/src/types/`)

- [`frontend/src/types/index.ts`](file:///e:/Clone/RescueFlowAI/frontend/src/types/index.ts): Defines all TypeScript interfaces and type unions (`IncidentSeverity`, `IncidentStatus`, `IncidentType`, `ResponderType`, `UserRole`, `Incident`, `GeoLocation`, `AiIncidentReport`, `DispatchUnit`, `ApiResponse`, `PaginatedResponse`).
- [`frontend/src/lib/mock-data.ts`](file:///e:/Clone/RescueFlowAI/frontend/src/lib/mock-data.ts): Rich seed mock data (`MOCK_INCIDENTS`, `MOCK_RESPONDERS`, `MOCK_DEPARTMENT_STATUS`, `MOCK_ANALYTICS_DATA`) enabling full offline preview functionality.
- [`frontend/src/lib/utils.ts`](file:///e:/Clone/RescueFlowAI/frontend/src/lib/utils.ts): Helper functions (`cn` for Tailwind class merging, `formatDate`, `getSeverityBadgeVariant`, `getStatusBadgeVariant`).
- [`frontend/src/lib/api/client.ts`](file:///e:/Clone/RescueFlowAI/frontend/src/lib/api/client.ts): Axios client instance configured with automatic Supabase JWT Bearer header insertion and automatic 401 redirect handling.

---

## 4. Key Data Models & Enumerations

### Incident Severity (`IncidentSeverity`)
- `"critical"`: Immediate threat to life/property (Red)
- `"high"`: Severe incident requiring immediate dispatch (Orange)
- `"moderate"`: Standard emergency response required (Yellow)
- `"low"`: Non-urgent incident (Blue/Gray)

### Incident Status (`IncidentStatus`)
- `"pending"` $\rightarrow$ `"ai_processing"` $\rightarrow$ `"dispatched"` $\rightarrow$ `"on_scene"` $\rightarrow$ `"resolved"` / `"cancelled"`

### Incident Types (`IncidentType`)
- `"road_accident"`, `"fire"`, `"medical"`, `"industrial"`, `"natural_disaster"`, `"security"`, `"other"`

### Responder Types (`ResponderType`)
- `"ambulance"`, `"fire_brigade"`, `"police"`, `"rescue"`

---

## 5. Development & Execution Instructions

### Frontend Execution
```powershell
cd frontend
npm install
npm run dev
```
- Dev Server URL: `http://localhost:3000` (or `http://localhost:3001` if 3000 is occupied).

### Backend Execution
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
- API Base URL: `http://localhost:8000/api/v1`
- OpenAPI Docs: `http://localhost:8000/docs`
