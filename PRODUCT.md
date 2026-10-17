# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — Ordinary citizen in an emergency:**
Anyone with a smartphone who witnesses or is involved in an incident (accident, fire, gas leak, medical emergency, structural collapse, road crash, etc.). They are in high stress, possibly panicked, and need to report what's happening as fast as possible — under 30 seconds — without navigating complex UI. They just need help to arrive.

**Secondary — Safety officer / dispatcher:**
Professional users at industrial sites (construction, steel plants, factories) or in centralized control rooms who monitor incoming incidents, assess severity, dispatch responders, and track resolution. They need total situational awareness with zero cognitive friction.

**Tertiary — Facility manager / executive:**
Views safety analytics, incident trends, and compliance data across sites. Uses dashboards and reports.

**Device context:** mobile-first for the citizen reporter (often outdoors, gloved, poor lighting); desktop-first for the dispatcher dashboard.

## Product Purpose

RescueFlow AI is an AI-powered emergency reporting and incident dispatch platform. A citizen reports an incident via voice, photo, video, or text. Google Gemini and OpenAI Whisper classify the incident type, estimate severity, and trigger automated responder notifications via Twilio. Dispatchers see a live GIS map and incident feed. The goal: reduce the time between an incident occurring and the right responders arriving at the scene.

**Success:** a citizen reports in under 30 seconds; a dispatcher sees the triage result and dispatches within 60 seconds of report submission.

## Positioning

The only incident-reporting platform that accepts multimodal input (voice in Hindi/Punjabi/English, photos, video) and automatically classifies, triages, and dispatches — removing the human lag of traditional call-centre dispatch. Other platforms require manual input and human triage; RescueFlow AI's mechanism is the AI triage pipeline.

## Operating Context

- **Industrial deployments:** construction sites, steel plants (Tata Steel, Bharat Steel), power plants (NTPC), highway corridors — environments where workers may have gloves, loud surroundings, and limited connectivity
- **India-first:** domestic facilities; primary languages Hindi, Punjabi, and English; names/addresses in Indian formats
- **Demo stage:** currently a portfolio/concept demonstration to stakeholders and potential clients; not yet live at a paying deployment
- **Fallback:** mock data available when Gemini API key is absent — app is always demonstrable offline
- **Infrastructure:** Next.js 15 frontend, Supabase (PostgreSQL + Auth), Gemini API, Whisper API, Twilio (voice + SMS), MapLibre GL for GIS

## Capabilities and Constraints

- **Reporting inputs:** photo upload, video upload, voice recording (transcribed by Whisper), free-text
- **AI triage:** Gemini classifies incident type, severity (critical / high / moderate / low), affected units needed
- **Dispatch:** Twilio automated calls + SMS to nearest registered responders
- **GIS:** MapLibre GL heatmap + marker map; currently seeded with dummy incidents around Noida NCR (Microsoft Sovereign / KP Towers area, Sector 16B)
- **Languages:** English, Hindi, Punjabi (i18n via translations map)
- **Auth:** Supabase Auth; role-based (citizen vs. safety officer vs. admin) — not fully implemented in demo
- **Undecided:** pricing model, SLA tiers, data retention policy, GDPR/DPDP compliance posture

## Brand Commitments

- **Name:** RescueFlow AI (rendered as `RescueFlow AI` or `RescueFlowAI`; `Rescue` + amber-coloured `Flow` in the logotype)
- **Voice:** Decisive, confident, human. Never playful. Lives are at stake.
- **Personality in three words:** Urgent · Precise · Trustworthy
- **No invented claims:** testimonials, client logos, SLA benchmarks, and pricing figures must not be fabricated; client names shown (Tata Steel, Siemens, etc.) are illustrative examples, not confirmed customers

## Evidence on Hand

- Working Next.js frontend with mock data fallback — always demonstrable
- MapLibre GL map centred on Microsoft Sovereign / KP Towers, Noida (28.5740°N, 77.3112°E) with 8 dummy incidents
- Gemini + Whisper integration (requires API keys for live mode)
- Twilio integration (requires credentials for live dispatch)
- Supabase schema in place
- No real user testimonials, no confirmed client deployments, no live incident data

## Product Principles

1. **Speed is the product.** Every interaction must be completable faster than the alternative (calling 112). Reduce steps, not features.
2. **Legibility over aesthetics.** In an emergency, clarity beats beauty. Every visual decision serves immediate comprehension.
3. **AI handles complexity; humans stay in control.** The AI triages and suggests; a dispatcher approves dispatch. The human is never removed from life-critical decisions.
4. **Design for the worst moment.** The reporter is panicked, outdoors, on mobile, possibly in poor lighting. The UI must work under those conditions.
5. **Trust is earned by precision.** Exact times, real incident IDs, confirmation flows, and accurate severity labels build confidence that the system is working.

## Accessibility & Inclusion

- Large tap targets on the citizen-facing report flow (min 44×44px) — users may be gloved or in stress
- High contrast required on all severity indicators (WCAG AA minimum; AA+ preferred for critical alerts)
- Voice input as a first-class path — not a fallback — for users who cannot or do not want to type
- `prefers-reduced-motion` respected throughout
- Multi-language: Hindi, Punjabi, English — UI copy fully translatable; no hardcoded English-only strings in citizen-facing flows
