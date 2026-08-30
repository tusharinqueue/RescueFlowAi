# CLAUDE.md

---

# Project

## RescueFlowAI — AI-Powered Emergency Response & Dispatch System

### Tech Stack

#### Frontend

- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui
- Framer Motion

---

#### Backend

- FastAPI (Python)

---

#### Database

- Supabase PostgreSQL

---

#### Authentication

- Supabase Auth
- Email Authentication
- Google OAuth

---

#### Storage

- Supabase Storage
  - Images
  - Videos
  - Audio Files

---

#### Artificial Intelligence

- Google Gemini API
- OpenAI Whisper API

---

#### Maps

- Google Maps JavaScript API

---

#### Notifications & Communication

- Twilio Voice API (Demo Mode)
- Firebase Cloud Messaging

---

#### Deployment

- Vercel (Frontend)
- Render (Backend)
- Supabase Cloud (Database)

---

# Conventions

## General

- Use **TypeScript Strict Mode**.
- Never use `any`.
- Keep code clean, modular, and reusable.
- Follow consistent naming conventions.
- Write self-explanatory code with meaningful variable names.

---

## Frontend

- Store reusable UI components inside:

```
src/components/
```

- Store pages inside:

```
src/app/
```

- Use **Tailwind CSS** for all styling.
- Use **shadcn/ui** components wherever possible.
- Use **Framer Motion** for page transitions and UI animations.
- Ensure the application is fully responsive.

---

## Backend

- Store API routes inside:

```
backend/routers/
```

- Follow **PEP8** coding standards.
- Use **async/await** throughout.
- Avoid callbacks.
- Keep routers, services, and utilities separated.

---

## Environment Variables

Frontend

```
.env.local
```

Backend

```
.env
```

Rules

- Never hardcode API keys.
- Never expose secrets in client-side code.
- Always access credentials through environment variables.

---

# Testing

## Frontend

Run

```bash
npm test
```

Store tests inside

```
__tests__/
```

---

## Backend

Run

```bash
pytest
```

Store tests inside

```
tests/
```

---

## Testing Rules

- Every new feature must include at least one integration test.
- Mock all AI responses during testing.
- Never call Gemini API during tests.
- Never call Twilio Voice API during tests.
- Always use demo/mock mode for external services.

---

# Git Workflow

## Branch Strategy

- Create one branch for every feature.
- Never develop directly on `main`.

---

## Commit Message Format

### New Feature

```
feat: <feature-name>
```

Example

```
feat: add AI incident classification
```

---

### Bug Fix

```
fix: <bug-description>
```

Example

```
fix: resolve dashboard loading issue
```

---

### Refactoring

```
refactor: <description>
```

Example

```
refactor: optimize incident API
```

---

## Pull Requests

- Create a Pull Request for every feature.
- Request review before merging.
- Squash commits before merging into `main`.

---

# Project Boundaries

## File Safety

- Do not delete existing files without confirmation.
- Do not rename project folders without approval.
- Do not modify project structure unless required.

---

## Environment Files

- Do not modify `.env`.
- Do not modify `.env.local`.

---

## Dependencies

- Do not install new packages without confirmation.
- Prefer existing libraries already included in the project.

---

## Database

- Do not modify the database schema without approval.
- Do not delete existing tables.
- Do not remove migrations.

---

## AI & External APIs

- Do not make real Gemini API calls during testing.
- Do not make real Twilio Voice API calls during testing.
- Always use mocked or demo responses during development.
- Keep the application in **Demo Mode** for all emergency dispatch features.

---

# Code Quality Guidelines

- Write reusable components.
- Keep functions small and focused.
- Use proper error handling.
- Validate all user inputs.
- Handle loading and error states gracefully.
- Follow accessibility (a11y) best practices.
- Optimize for performance and readability.

---

# Demo Mode Requirements

Since RescueFlowAI is a hackathon prototype:

- Simulate emergency voice calls instead of contacting real emergency services.
- Simulate responder dispatch.
- Simulate push notifications where required.
- Display all dispatch events on the Admin Dashboard.
- Ensure the complete workflow can be demonstrated without relying on external emergency systems.

---

# Goal

Build a clean, production-quality MVP that demonstrates how AI can automate emergency reporting, incident analysis, responder recommendation, and dispatch coordination through an intuitive, responsive, and reliable web application.