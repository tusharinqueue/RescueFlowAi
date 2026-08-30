# SPEC.md

---

# Project Name

## RescueFlowAI — AI-Powered Emergency Response & Dispatch System

> An AI-powered system where a witness uploads an image, video, voice recording, or text describing an emergency. The AI automatically detects the incident type, estimates its severity, generates a structured report, recommends the appropriate responders, triggers a demo AI voice call, and updates a live emergency dispatch dashboard.

---

# Problem

## Who has this problem?

- Citizens
- Road accident witnesses
- Construction workers
- Factory workers
- Security guards
- Bystanders who witness emergencies

---

## How do they solve it today?

- Search for emergency contact numbers manually.
- Call ambulance, police, and fire brigade separately.
- Explain the same incident repeatedly to different operators.
- Try to share the exact GPS location while under stress.
- Wait while different departments coordinate manually.

---

## Why is this a problem?

- Every wasted minute increases the severity of injuries.
- Manual coordination leads to delays.
- Panic causes people to miss important information.
- Different agencies receive inconsistent information.
- There is no centralized emergency reporting system.

---

# Core Flow

> The primary user journey we will demonstrate.

1. Open the **RescueFlowAI** application.

2. Tap **"Report Emergency."**

3. Upload any of the following:
   - 📷 Image
   - 🎥 Video
   - 🎤 Voice Recording
   - 📝 Text Description

4. The application automatically captures:
   - GPS Location
   - Latitude & Longitude
   - Timestamp

5. AI analyzes the uploaded information and identifies:
   - Emergency Type
   - Severity Level
   - Possible Victim Count
   - Potential Hazards

6. AI generates a structured incident report.

7. AI recommends the required emergency responders:
   - 🚑 Ambulance
   - 👮 Police
   - 🚒 Fire Brigade
   - 🏗️ Site Safety Officer (when applicable)

8. A demo AI voice call is triggered.

9. Push notifications are sent to the assigned responders.

10. The incident instantly appears on the Admin Dashboard with:
    - Incident Details
    - Google Maps Location
    - Severity Badge
    - Current Status

11. Status updates follow this workflow:

```
Reported
     ↓
AI Analyzed
     ↓
Dispatched
     ↓
En Route
     ↓
Resolved
```

---

# Technology Stack

> One fixed stack throughout the hackathon.

## Frontend

- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui
- Framer Motion

---

## Backend

- FastAPI (Python)

---

## Database

- Supabase PostgreSQL

---

## Authentication

- Supabase Auth
- Email Authentication
- Google OAuth

---

## Storage

- Supabase Storage

---

## Artificial Intelligence

### Vision & NLP

- Google Gemini API (gemini-1.5-flash)

Used for:

- Image Analysis
- Video Understanding
- Incident Classification
- Severity Prediction
- AI Summary Generation
- Report Generation

### Speech-to-Text

- OpenAI Whisper API

Used for:

- Voice Recording Transcription

---

## Maps

- Google Maps JavaScript API

---

## Voice Calls (Demo)

- Twilio Voice API

---

## Notifications

- Firebase Cloud Messaging

---

## Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- Supabase Cloud

---

# Definition of Done

The project is considered complete when:

- ✅ User authentication is working.

- ✅ A witness can report an emergency using:
  - Image
  - Video
  - Voice
  - Text

- ✅ GPS location is captured automatically.

- ✅ AI correctly identifies the emergency type.

- ✅ AI predicts the severity level.

- ✅ AI generates a structured incident report.

- ✅ AI recommends the required responders.

- ✅ Demo AI voice call is successfully triggered.

- ✅ Push notifications are sent.

- ✅ Incident appears instantly on the live Admin Dashboard.

- ✅ Google Maps displays the incident location.

- ✅ Incident status updates correctly:

```
Reported
     ↓
AI Analyzed
     ↓
Dispatched
     ↓
En Route
     ↓
Resolved
```

- ✅ Complete workflow executes in under **30 seconds**.

- ✅ Application is deployed on a live **Vercel** URL.

- ✅ Demo runs end-to-end without crashes.