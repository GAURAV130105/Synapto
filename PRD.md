# Synapto — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** 21 February 2026  
> **Status:** Draft  
> **Author:** Synapto Team  
> **Hackathon:** 2026 Inclusive Tech Hackathon

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Mission](#3-vision--mission)
4. [Target Users & Personas](#4-target-users--personas)
5. [Goals & Success Metrics](#5-goals--success-metrics)
6. [Feature Requirements](#6-feature-requirements)
   - 6.1 [Sign Language Avatar (3D)](#61-sign-language-avatar-3d)
   - 6.2 [Language Leveler (AI Text Simplification)](#62-language-leveler-ai-text-simplification)
   - 6.3 [Audio Narrative](#63-audio-narrative)
   - 6.4 [Focus Mode](#64-focus-mode)
   - 6.5 [YouTube Content Integration](#65-youtube-content-integration)
   - 6.6 [Voice Assistant](#66-voice-assistant)
   - 6.7 [Authentication & User Profiles](#67-authentication--user-profiles)
   - 6.8 [Dashboard & Content Library](#68-dashboard--content-library)
   - 6.9 [User Preferences & Accessibility Settings](#69-user-preferences--accessibility-settings)
7. [Information Architecture](#7-information-architecture)
8. [Technical Architecture](#8-technical-architecture)
   - 8.1 [Tech Stack](#81-tech-stack)
   - 8.2 [System Architecture Diagram](#82-system-architecture-diagram)
   - 8.3 [Database Schema](#83-database-schema)
   - 8.4 [API Contracts](#84-api-contracts)
   - 8.5 [Third-Party Integrations](#85-third-party-integrations)
9. [Accessibility Requirements (WCAG 2.2 AA)](#9-accessibility-requirements-wcag-22-aa)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [User Flows](#11-user-flows)
12. [Roadmap & Phasing](#12-roadmap--phasing)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

**Synapto** is an AI-powered inclusive education platform that makes learning truly accessible for students with disabilities. It transforms standard educational content—primarily YouTube videos and their transcripts—into multi-modal learning experiences through:

- **3D Sign Language Avatars** for Deaf and hard-of-hearing learners
- **AI-driven Text Simplification** for students with reading differences
- **Audio Narratives** for blind and low-vision learners
- **Focus Mode** for neurodivergent learners
- **Voice Assistant** for hands-free, speech-based navigation

Synapto is built as a modern, serverless web application using **Next.js 16**, **React 19**, **Supabase** (PostgreSQL), and AI services from **Groq** and **OpenAI**, with real-time 3D rendering via **React Three Fiber / Three.js**.

---

## 2. Problem Statement

### The Gap

Over **1.3 billion people** worldwide have a significant disability (WHO, 2023). In education alone, **61 million students** with disabilities face barriers that prevent equitable access to the same learning materials as their peers.

### Current Limitations

| Barrier                                | Affected Group                     | Current "Solution"                     |
| -------------------------------------- | ---------------------------------- | -------------------------------------- |
| No sign language translation           | Deaf / Hard of Hearing             | Human interpreters (expensive, scarce) |
| Complex academic language              | Dyslexia, cognitive disabilities   | Manual re-writing by teachers          |
| Visual-only content (charts, diagrams) | Blind / Low-vision                 | Alt-text (often missing or poor)       |
| Information overload, distracting UIs  | ADHD, Autism, processing disorders | None; students cope individually       |
| Keyboard/mouse required                | Motor disabilities                 | Limited screen-reader support          |

### Core Insight

Accessibility features in existing EdTech platforms are bolt-on afterthoughts—a checkbox, not a core design philosophy. **Synapto is built accessible-first**, where every feature serves the mission of inclusive learning.

---

## 3. Vision & Mission

### Vision

> _A world where every student, regardless of ability, has equal access to quality education._

### Mission

> _To leverage AI and modern web technologies to transform educational content into personalized, multi-modal learning experiences that adapt to individual accessibility needs in real time._

### Design Principles

1. **Nothing About Us Without Us** — Features are designed _for_ people with disabilities, informed by their lived experiences.
2. **Graceful Degradation** — Every AI-powered feature has a local/offline fallback so the platform never breaks.
3. **Beautiful ≠ Inaccessible** — Premium visual design that proves accessibility and aesthetics are not mutually exclusive.
4. **Universal Design** — Accessibility features benefit _all_ learners, not just those with disabilities.

---

## 4. Target Users & Personas

### Primary Personas

#### 🧏 Maya — Deaf University Student

| Attribute           | Detail                                                  |
| ------------------- | ------------------------------------------------------- |
| **Age**             | 20                                                      |
| **Disability**      | Deaf since birth                                        |
| **Context**         | Biology major; lectures are video-based                 |
| **Pain Point**      | Captions alone don't convey nuance; needs ASL           |
| **Synapto Feature** | 3D Sign Language Avatar                                 |
| **Goal**            | Understand lecture content in her native language (ASL) |

#### 📖 Ahmed — Student with Dyslexia

| Attribute           | Detail                                              |
| ------------------- | --------------------------------------------------- |
| **Age**             | 16                                                  |
| **Disability**      | Severe dyslexia                                     |
| **Context**         | High school; heavy textbook load                    |
| **Pain Point**      | Academic language is too complex to decode          |
| **Synapto Feature** | Language Leveler                                    |
| **Goal**            | Read and comprehend textbook material independently |

#### 👁️ Priya — Blind Graduate Student

| Attribute           | Detail                                                       |
| ------------------- | ------------------------------------------------------------ |
| **Age**             | 24                                                           |
| **Disability**      | Completely blind                                             |
| **Context**         | Data Science program; lots of visual charts                  |
| **Pain Point**      | Alt-text is missing or unhelpful                             |
| **Synapto Feature** | Audio Narrative + Voice Assistant                            |
| **Goal**            | Access visual educational content through audio descriptions |

#### 🧠 Jordan — Neurodivergent Learner

| Attribute           | Detail                                                |
| ------------------- | ----------------------------------------------------- |
| **Age**             | 14                                                    |
| **Disability**      | ADHD + Autism spectrum                                |
| **Context**         | Online learning; easily overwhelmed                   |
| **Pain Point**      | Busy interfaces cause cognitive overload              |
| **Synapto Feature** | Focus Mode + Preferences                              |
| **Goal**            | Learn in a distraction-free, customizable environment |

### Secondary Personas

- **Educators / Teachers** — Add YouTube content, monitor student engagement, curate accessible libraries.
- **Accessibility Coordinators** — Verify WCAG compliance, onboard students, configure institutional defaults.

---

## 5. Goals & Success Metrics

### Product Goals

| #   | Goal                                            | Metric                                         | Target (MVP)              |
| --- | ----------------------------------------------- | ---------------------------------------------- | ------------------------- |
| G1  | Provide ASL translation for educational content | % of transcript words with sign coverage       | ≥ 60% common words        |
| G2  | Simplify text to multiple reading levels        | Readability score improvement (Flesch-Kincaid) | ≥ 3 grade-level reduction |
| G3  | Generate audio descriptions for content         | Audio generation success rate                  | ≥ 95%                     |
| G4  | Reduce cognitive load via Focus Mode            | User-reported distraction score (survey)       | ≥ 40% reduction           |
| G5  | WCAG 2.2 AA compliance on all pages             | Automated + manual audit pass rate             | 100%                      |
| G6  | Fast, responsive experience                     | Largest Contentful Paint (LCP)                 | < 2.5s                    |

### Business Goals (Post-Hackathon)

| #   | Goal                                  | Target                |
| --- | ------------------------------------- | --------------------- |
| B1  | Registered users (first 6 months)     | 5,000                 |
| B2  | Content items processed               | 10,000+               |
| B3  | University/school partnerships        | 5+ pilot institutions |
| B4  | LMS integrations (Canvas, Blackboard) | 2+                    |

---

## 6. Feature Requirements

### 6.1 Sign Language Avatar (3D)

**Priority:** P0 (Core)  
**Status:** ✅ Implemented (Functional Prototype)

#### Description

A real-time 3D hand model that translates educational text to American Sign Language (ASL). Uses procedural animation to display fingerspelling and common word signs.

#### Functional Requirements

| ID    | Requirement                                                                               | Priority |
| ----- | ----------------------------------------------------------------------------------------- | -------- |
| SL-01 | Render a rigged, procedurally animated 3D hand using React Three Fiber / Three.js         | P0       |
| SL-02 | Support full A-Z ASL fingerspelling with distinct hand poses per letter                   | P0       |
| SL-03 | Include a database of common ASL word signs (HELLO, THANK YOU, PLEASE, etc.)              | P0       |
| SL-04 | Text-to-sign-gloss matching: tokenize input text and map words to signs or fingerspelling | P0       |
| SL-05 | Playback controls: Play, Pause, Speed (0.5x – 2x), Previous/Next sign                     | P1       |
| SL-06 | Display current sign label and progress indicator                                         | P1       |
| SL-07 | Smooth interpolation (LERP/SLERP) between poses for natural animation                     | P1       |
| SL-08 | Responsive canvas that works on mobile and desktop                                        | P1       |
| SL-09 | Orbit controls for rotating/zooming the 3D view                                           | P2       |

#### Technical Notes

- **Component:** `components/features/sign-3d/sign-language-3d.tsx`
- **3D Model:** `components/features/sign-3d/hand-3d-model.tsx` (procedural bone-based model)
- **Pose Database:** `components/features/sign-3d/sign-poses.ts` (~14 KB of pose data)
- **Rendering:** `@react-three/fiber` v9 + `@react-three/drei` v10
- **Dynamic Import:** Loaded via `next/dynamic` with `ssr: false` to avoid SSR hydration issues with Three.js

---

### 6.2 Language Leveler (AI Text Simplification)

**Priority:** P0 (Core)  
**Status:** ✅ Fully Functional

#### Description

Automatically simplifies complex academic text into three reading levels (Basic, Intermediate, Advanced) using AI, preserving core meaning while reducing cognitive load.

#### Functional Requirements

| ID    | Requirement                                                                        | Priority |
| ----- | ---------------------------------------------------------------------------------- | -------- |
| LL-01 | Accept any text input (transcript, pasted text) and simplify it                    | P0       |
| LL-02 | Support three levels: Basic (ELI5), Intermediate (High School), Advanced (College) | P0       |
| LL-03 | Use Groq API (`llama-3.3-70b-versatile`) as primary AI provider                    | P0       |
| LL-04 | Provide local rule-based fallback when API is unavailable                          | P0       |
| LL-05 | Side-by-side comparison of original vs. simplified text                            | P1       |
| LL-06 | Cache simplified results in `simplified_content` table to avoid re-processing      | P1       |
| LL-07 | Display loading state with progress feedback                                       | P2       |

#### Technical Notes

- **Component:** `components/features/language-leveler.tsx`
- **API Route:** `app/api/ai/simplify-text/route.ts`
- **AI Provider:** Groq API with model `llama-3.3-70b-versatile`
- **Fallback:** Local text-processing utilities in `lib/utils/text-processing.ts`

---

### 6.3 Audio Narrative

**Priority:** P0 (Core)  
**Status:** ✅ Fully Functional

#### Description

Generates spoken audio descriptions of educational content, enabling blind and low-vision students to consume visual and textual information through audio.

#### Functional Requirements

| ID    | Requirement                                                                | Priority |
| ----- | -------------------------------------------------------------------------- | -------- |
| AN-01 | Generate audio from transcript/text content                                | P0       |
| AN-02 | Use OpenAI TTS API as primary audio generation provider                    | P0       |
| AN-03 | Fall back to Web Speech API (`speechSynthesis`) when OpenAI is unavailable | P0       |
| AN-04 | Audio player with Play, Pause, and volume controls                         | P0       |
| AN-05 | Extract and display key points from content                                | P1       |
| AN-06 | Support downloadable audio files                                           | P2       |

#### Technical Notes

- **Component:** `components/features/audio-narrative.tsx`
- **API Route:** `app/api/ai/generate-audio/route.ts`
- **Key Points:** Extracted via `lib/utils/text-processing.ts` → `extractKeyPoints()`

---

### 6.4 Focus Mode

**Priority:** P1 (Important)  
**Status:** ✅ Fully Functional

#### Description

A customizable, distraction-free interface mode that reduces cognitive load by hiding non-essential elements and enhancing readability.

#### Functional Requirements

| ID    | Requirement                                      | Priority |
| ----- | ------------------------------------------------ | -------- |
| FM-01 | Toggle Focus Mode on/off from any page           | P0       |
| FM-02 | Hide images and visual distractions when enabled | P0       |
| FM-03 | Hide ads and sidebars                            | P0       |
| FM-04 | Increase font size for better readability        | P1       |
| FM-05 | Increase line height / text spacing              | P1       |
| FM-06 | Enhance colour contrast (high-contrast mode)     | P1       |
| FM-07 | Persist Focus Mode preference across sessions    | P1       |

#### Technical Notes

- **Component:** `components/features/focus-mode.tsx`
- **Mechanism:** Dynamic CSS injection at runtime
- **Persistence:** Saved to `profiles.preferences` JSONB column in Supabase

---

### 6.5 YouTube Content Integration

**Priority:** P0 (Core)  
**Status:** ✅ Fully Functional

#### Description

Users paste a YouTube URL and the system automatically extracts the video metadata, thumbnail, and transcript. The transcript then becomes the input for all accessibility features.

#### Functional Requirements

| ID    | Requirement                                                                      | Priority |
| ----- | -------------------------------------------------------------------------------- | -------- |
| YT-01 | Accept and validate YouTube URLs (multiple formats: youtu.be, youtube.com, etc.) | P0       |
| YT-02 | Extract video ID, title, and thumbnail URL                                       | P0       |
| YT-03 | Fetch transcript/captions from YouTube via `youtube-transcript` package          | P0       |
| YT-04 | Store content record in Supabase `content` table                                 | P0       |
| YT-05 | Embed YouTube player on content viewer page                                      | P0       |
| YT-06 | Display timestamped transcript segments with click-to-seek functionality         | P1       |
| YT-07 | Transcript search with keyword highlighting                                      | P1       |
| YT-08 | Download transcript as text file                                                 | P2       |

#### Technical Notes

- **Add Content Page:** `app/dashboard/add-content/page.tsx`
- **Content Viewer:** `app/dashboard/content/[id]/page.tsx`
- **YouTube Utilities:** `lib/utils/youtube.ts`
- **API Routes:** `app/api/content/add/route.ts`, `app/api/content/transcript/route.ts`

---

### 6.6 Voice Assistant

**Priority:** P1 (Important)  
**Status:** ✅ Functional Prototype

#### Description

A hands-free, speech-based assistant that lets users navigate the platform, search for YouTube videos, and execute commands using voice input. Critical for users with motor disabilities.

#### Functional Requirements

| ID    | Requirement                                                       | Priority |
| ----- | ----------------------------------------------------------------- | -------- |
| VA-01 | Activate/deactivate via floating microphone button                | P0       |
| VA-02 | Recognize speech input using Web Speech API (`SpeechRecognition`) | P0       |
| VA-03 | Respond with synthesized speech (`speechSynthesis`)               | P0       |
| VA-04 | Navigate between pages by voice command (e.g., "go to dashboard") | P0       |
| VA-05 | Search YouTube by voice (e.g., "search for biology lectures")     | P1       |
| VA-06 | Display search results as cards with thumbnails                   | P1       |
| VA-07 | Play a selected video by voice command ("play video 1")           | P1       |
| VA-08 | Chat history UI showing user/assistant messages                   | P2       |
| VA-09 | Minimize/maximize assistant panel                                 | P2       |

#### Technical Notes

- **Component:** `components/voice-assistant.tsx` (873 lines)
- **Wrapper:** `components/voice-assistant-wrapper.tsx`
- **API Routes:** `app/api/voice/process-command/route.ts`, `app/api/voice/youtube-search/route.ts`
- **YouTube Search:** Uses Piped/Invidious APIs with fallbacks

---

### 6.7 Authentication & User Profiles

**Priority:** P0 (Core)  
**Status:** ✅ Fully Functional

#### Description

Email/password authentication via Supabase Auth with auto-profile creation on sign-up.

#### Functional Requirements

| ID    | Requirement                                              | Priority |
| ----- | -------------------------------------------------------- | -------- |
| AU-01 | Email + password sign-up with form validation (Zod)      | P0       |
| AU-02 | Email + password login                                   | P0       |
| AU-03 | Auto-create `profiles` row on sign-up (database trigger) | P0       |
| AU-04 | Session management via Supabase middleware               | P0       |
| AU-05 | Protected routes (redirect to login if unauthenticated)  | P0       |
| AU-06 | Auth callback handling (email verification flow)         | P1       |
| AU-07 | Sign-up success page                                     | P2       |
| AU-08 | Error page for auth failures                             | P2       |

#### Technical Notes

- **Auth Pages:** `app/auth/login/`, `app/auth/sign-up/`, `app/auth/sign-up-success/`, `app/auth/error/`
- **Auth Callback:** `app/auth/callback/route.ts`
- **Middleware:** `middleware.ts` (session refresh via `lib/supabase/proxy.ts`)
- **Clients:** `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)

---

### 6.8 Dashboard & Content Library

**Priority:** P0 (Core)  
**Status:** ✅ Fully Functional

#### Description

Central hub for content management, quick actions, and navigation to all features.

#### Functional Requirements

| ID    | Requirement                                                                                           | Priority |
| ----- | ----------------------------------------------------------------------------------------------------- | -------- |
| DB-01 | Dashboard home with welcome message and quick-action cards                                            | P0       |
| DB-02 | "Add Content" action to upload new YouTube content                                                    | P0       |
| DB-03 | Content Library page listing all user's content with search/filter                                    | P0       |
| DB-04 | Content Viewer page with integrated tabs for all features (Transcript, Leveler, Audio, Sign Language) | P0       |
| DB-05 | Save/unsave (favorite) content                                                                        | P1       |
| DB-06 | Delete content from library                                                                           | P1       |
| DB-07 | Responsive sidebar navigation (collapsible on mobile)                                                 | P1       |

#### Technical Notes

- **Dashboard Layout:** `app/dashboard/layout.tsx`
- **Dashboard Home:** `app/dashboard/page.tsx`
- **Library:** `app/dashboard/library/page.tsx`
- **API Routes:** `app/api/content/library/route.ts`, `app/api/content/[id]/route.ts`, `app/api/content/remove/route.ts`

---

### 6.9 User Preferences & Accessibility Settings

**Priority:** P1 (Important)  
**Status:** ✅ Fully Functional

#### Description

A dedicated settings page where users customize their accessibility experience. Preferences are persisted in the database and applied globally.

#### Functional Requirements

| ID    | Requirement                                                     | Priority |
| ----- | --------------------------------------------------------------- | -------- |
| UP-01 | Font size control: Small, Normal, Large, Extra-Large            | P0       |
| UP-02 | High contrast toggle                                            | P0       |
| UP-03 | Dyslexia-friendly font toggle                                   | P1       |
| UP-04 | Default language level setting (Beginner/Intermediate/Advanced) | P1       |
| UP-05 | Enable/disable Sign Language avatar by default                  | P1       |
| UP-06 | Enable/disable Audio Narrative by default                       | P1       |
| UP-07 | Text spacing control                                            | P2       |
| UP-08 | Persist preferences to Supabase `profiles.preferences` JSONB    | P0       |

#### Technical Notes

- **Page:** `app/dashboard/preferences/page.tsx`
- **API Route:** `app/api/user/preferences/route.ts`
- **Type Definitions:** `lib/supabase/types.ts` → `UserPreferences` interface

---

## 7. Information Architecture

```
Synapto
├── Landing Page (/)
│   ├── Feature Overview
│   ├── Impact Statistics
│   ├── 3D Spline Hero
│   └── CTA → Sign Up / Login
│
├── Authentication
│   ├── /auth/login
│   ├── /auth/sign-up
│   ├── /auth/sign-up-success
│   ├── /auth/callback
│   └── /auth/error
│
├── Dashboard (/dashboard) [Protected]
│   ├── Home — Quick Actions, Stats
│   ├── Add Content (/dashboard/add-content)
│   │   └── YouTube URL Input → Transcript Extraction
│   ├── Content Viewer (/dashboard/content/[id])
│   │   ├── Tab: Transcript (timestamped, searchable)
│   │   ├── Tab: Language Leveler
│   │   ├── Tab: Audio Narrative
│   │   └── Tab: Sign Language (3D Avatar)
│   ├── Library (/dashboard/library)
│   │   └── Grid of saved/created content
│   └── Preferences (/dashboard/preferences)
│       └── Accessibility settings form
│
└── Global Components
    ├── Voice Assistant (floating FAB, all pages)
    └── Focus Mode (toggle, all pages)
```

---

## 8. Technical Architecture

### 8.1 Tech Stack

| Layer                 | Technology                               | Version            |
| --------------------- | ---------------------------------------- | ------------------ |
| **Framework**         | Next.js (App Router)                     | 16.1.6             |
| **UI Library**        | React                                    | 19.2.4             |
| **Language**          | TypeScript (strict mode)                 | 5.7.3              |
| **Styling**           | Tailwind CSS v4 + custom design tokens   | 4.1.9              |
| **Component Library** | shadcn/ui (Radix UI primitives)          | Latest             |
| **3D Engine**         | Three.js + React Three Fiber + Drei      | 0.182 / 9.5 / 10.7 |
| **Database**          | Supabase (PostgreSQL)                    | —                  |
| **Auth**              | Supabase Auth                            | —                  |
| **AI (Text)**         | Groq API (LLaMA 3.3 70B)                 | —                  |
| **AI (Audio)**        | OpenAI TTS API                           | —                  |
| **Speech**            | Web Speech API (Recognition + Synthesis) | Browser native     |
| **Form Validation**   | Zod + React Hook Form                    | 3.24 / 7.54        |
| **Charts**            | Recharts                                 | 2.15               |
| **Hosting**           | Vercel (serverless)                      | —                  |
| **3D Hero**           | Spline                                   | 4.1                |

### 8.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  React UI  │  │  Three.js  │  │  Web Speech API      │  │
│  │  (Next.js) │  │  (R3F)     │  │  (Recognition +      │  │
│  │            │  │  3D Avatar │  │   Synthesis)          │  │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬───────────┘  │
│        │               │                    │               │
│        └───────────────┼────────────────────┘               │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │  HTTPS
┌────────────────────────┼────────────────────────────────────┐
│                   NEXT.JS API ROUTES (Vercel Serverless)    │
│                        │                                    │
│  ┌─────────────────────┴───────────────────────────────┐    │
│  │                                                     │    │
│  │  /api/content/add          → Add YouTube content    │    │
│  │  /api/content/[id]         → Get content by ID      │    │
│  │  /api/content/library      → List user content      │    │
│  │  /api/content/transcript   → Fetch YT transcript    │    │
│  │  /api/content/remove       → Delete content         │    │
│  │  /api/ai/simplify-text     → Groq text simplify     │    │
│  │  /api/ai/generate-audio    → OpenAI TTS             │    │
│  │  /api/user/preferences     → CRUD preferences       │    │
│  │  /api/voice/process-command→ Voice command handler   │    │
│  │  /api/voice/youtube-search → YouTube search proxy    │    │
│  │                                                     │    │
│  └─────────┬──────────────────┬────────────────────────┘    │
│            │                  │                              │
└────────────┼──────────────────┼──────────────────────────────┘
             │                  │
     ┌───────┴───────┐ ┌───────┴────────┐
     │   SUPABASE    │ │  EXTERNAL APIs │
     │               │ │                │
     │  • Auth       │ │  • Groq API    │
     │  • PostgreSQL │ │  • OpenAI API  │
     │  • RLS        │ │  • Piped API   │
     │  • Triggers   │ │  • Invidious   │
     └───────────────┘ └────────────────┘
```

### 8.3 Database Schema

#### Tables

| Table                | Purpose                                                   | RLS                              |
| -------------------- | --------------------------------------------------------- | -------------------------------- |
| `profiles`           | User profile data + accessibility preferences (JSONB)     | ✅ Own profile only              |
| `content`            | Educational content records (YouTube URLs, transcripts)   | ✅ Authenticated read; own write |
| `saved_content`      | Many-to-many bookmark relationship (users ↔ content)      | ✅ Own bookmarks only            |
| `simplified_content` | Cached AI-simplified text at different reading levels     | ✅ Authenticated read/write      |
| `user_activity`      | Learning analytics log (views, interactions, completions) | ✅ Own activity only             |

#### Entity Relationship

```
auth.users (Supabase managed)
    │
    ├──── 1:1 ───── profiles
    │                   └── preferences (JSONB)
    │
    ├──── 1:N ───── content
    │                   │
    │                   ├──── 1:N ───── simplified_content
    │                   │
    │                   └──── N:M ───── saved_content ───── users
    │
    └──── 1:N ───── user_activity
```

#### Key Indexes

- `idx_saved_content_user_id` — Fast bookmark lookups per user
- `idx_saved_content_content_id` — Fast reverse lookups per content
- `idx_user_activity_user_id` — Fast activity log per user
- `idx_user_activity_content_id` — Fast activity log per content
- `idx_simplified_content_content_id` — Fast cache hits for simplification
- `idx_content_created_by` — Fast content listing per creator

#### Triggers

- `on_auth_user_created` → Auto-inserts row into `profiles` on sign-up
- `profiles_updated_at` → Auto-sets `updated_at` timestamp
- `content_updated_at` → Auto-sets `updated_at` timestamp

---

### 8.4 API Contracts

#### `POST /api/content/add`

Add new educational content from YouTube.

```json
// Request
{
  "title": "string (required)",
  "description": "string",
  "youtube_url": "string (required, valid YouTube URL)",
  "thumbnail_url": "string",
  "transcript": "string"
}

// Response 201
{
  "id": "uuid",
  "title": "string",
  "youtube_url": "string",
  "created_at": "ISO 8601"
}
```

#### `POST /api/ai/simplify-text`

Simplify text to a target reading level.

```json
// Request
{
  "text": "string (required, max 10,000 chars)",
  "level": "beginner | intermediate | advanced"
}

// Response 200
{
  "simplified": "string",
  "provider": "groq | local",
  "level": "string"
}
```

#### `POST /api/ai/generate-audio`

Generate audio narration for text content.

```json
// Request
{
  "text": "string (required)"
}

// Response 200
{
  "audio_url": "string (data URL or blob URL)",
  "provider": "openai | web-speech"
}
```

#### `GET /api/content/library`

Retrieve all content for the authenticated user.

```json
// Response 200
{
  "content": [
    {
      "id": "uuid",
      "title": "string",
      "thumbnail_url": "string",
      "youtube_url": "string",
      "transcript_status": "pending | processing | completed | failed",
      "created_at": "ISO 8601"
    }
  ]
}
```

#### `PATCH /api/user/preferences`

Update user accessibility preferences.

```json
// Request
{
  "fontSize": "small | normal | large | xlarge",
  "highContrast": "boolean",
  "focusMode": "boolean",
  "languageLevel": "beginner | intermediate | advanced",
  "enableSignLanguage": "boolean",
  "enableAudioNarrative": "boolean",
  "textSpacing": "number"
}

// Response 200
{
  "preferences": { ... }
}
```

---

### 8.5 Third-Party Integrations

| Service               | Purpose                                               | Fallback                           |
| --------------------- | ----------------------------------------------------- | ---------------------------------- |
| **Groq API**          | Fast LLM text simplification (LLaMA 3.3 70B)          | Local rule-based simplifier        |
| **OpenAI TTS**        | High-quality audio narration                          | Web Speech API (`speechSynthesis`) |
| **Supabase**          | Auth, PostgreSQL DB, RLS, real-time (future)          | N/A (core infrastructure)          |
| **YouTube**           | Content source, transcript extraction                 | Manual text input                  |
| **Piped / Invidious** | Privacy-respecting YouTube search for voice assistant | Direct YouTube scraping            |
| **Spline**            | 3D hero animation on landing page                     | Static fallback image              |
| **Vercel**            | Hosting, serverless functions, CDN                    | N/A                                |

---

## 9. Accessibility Requirements (WCAG 2.2 AA)

Synapto targets **WCAG 2.2 Level AA** compliance across all pages. Below are the specific standards and their implementation.

### Perceivable

| Criterion                    | Requirement                         | Implementation                                                             |
| ---------------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| 1.1.1 Non-text Content       | All images have text alternatives   | `alt` attributes on all `<img>` tags                                       |
| 1.3.1 Info and Relationships | Semantic HTML structure             | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`                    |
| 1.4.3 Contrast (Minimum)     | 4.5:1 text contrast ratio           | Custom design tokens: Blue #0066CC, Teal #60C685 on dark/light backgrounds |
| 1.4.4 Resize Text            | Text resizable to 200% without loss | Responsive design + user font-size preferences                             |
| 1.4.11 Non-text Contrast     | 3:1 contrast for UI components      | Focus rings, button borders meet requirements                              |

### Operable

| Criterion           | Requirement                           | Implementation                                         |
| ------------------- | ------------------------------------- | ------------------------------------------------------ |
| 2.1.1 Keyboard      | All functionality via keyboard        | Tab, Enter, Escape support on all interactive elements |
| 2.4.3 Focus Order   | Logical tab order                     | Semantic DOM order + `tabIndex` management             |
| 2.4.7 Focus Visible | Visible focus indicators              | Custom focus ring styles (`:focus-visible`)            |
| 2.5.3 Label in Name | Accessible names match visible labels | ARIA labels match visible text                         |

### Understandable

| Criterion                  | Requirement                           | Implementation                                     |
| -------------------------- | ------------------------------------- | -------------------------------------------------- |
| 3.1.1 Language of Page     | Page language declared                | `<html lang="en">`                                 |
| 3.2.1 On Focus             | No unexpected context change on focus | No auto-navigation on focus                        |
| 3.3.1 Error Identification | Errors clearly described              | Form validation messages via React Hook Form + Zod |

### Robust

| Criterion               | Requirement                                   | Implementation                              |
| ----------------------- | --------------------------------------------- | ------------------------------------------- |
| 4.1.2 Name, Role, Value | All UI components have accessible names/roles | Radix UI primitives provide ARIA by default |

### Additional A11y Features (Beyond WCAG)

- **3 colour-blind modes** (Protanopia, Deuteranopia, Tritanopia)
- **Dyslexia-friendly font** option (OpenDyslexic)
- **Reduced motion** support (`prefers-reduced-motion` media query)
- **Voice navigation** as alternative to keyboard/mouse

---

## 10. Non-Functional Requirements

### Performance

| Metric                                  | Target  |
| --------------------------------------- | ------- |
| Largest Contentful Paint (LCP)          | < 2.5s  |
| First Input Delay (FID)                 | < 100ms |
| Cumulative Layout Shift (CLS)           | < 0.1   |
| Three.js scene initialization           | < 1.5s  |
| API response time (Groq simplification) | < 3s    |
| Audio generation latency                | < 5s    |

### Scalability

| Aspect    | Strategy                                            |
| --------- | --------------------------------------------------- |
| Compute   | Vercel serverless functions (auto-scaling)          |
| Database  | Supabase PostgreSQL with proper indexing            |
| CDN       | Vercel Edge Network for static assets               |
| 3D Assets | Dynamic imports, code splitting for Three.js bundle |

### Security

| Aspect              | Implementation                                          |
| ------------------- | ------------------------------------------------------- |
| Authentication      | Supabase Auth (bcrypt password hashing, JWT sessions)   |
| Authorization       | Row Level Security (RLS) on all tables                  |
| API Protection      | Server-side auth checks on all API routes               |
| Environment Secrets | `.env.local` for API keys; never exposed to client      |
| Input Validation    | Zod schemas on all API inputs                           |
| XSS Prevention      | React's default escaping + no `dangerouslySetInnerHTML` |

### Reliability

| Aspect                | Strategy                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| AI Feature Failures   | Every AI feature has a local fallback (Groq → local, OpenAI → Web Speech) |
| Graceful Error States | User-friendly error messages, no raw stack traces                         |
| Data Integrity        | PostgreSQL constraints, CHECK constraints on enums, RLS policies          |

### Browser Support

| Browser             | Version |
| ------------------- | ------- |
| Chrome              | 90+     |
| Firefox             | 90+     |
| Safari              | 15+     |
| Edge                | 90+     |
| Mobile Safari (iOS) | 15+     |
| Chrome Android      | 90+     |

---

## 11. User Flows

### Flow 1: First-Time User Onboarding

```
Landing Page → Click "Get Started"
    → Sign-Up Page (email, password, name)
        → Email verification (optional)
            → Dashboard Home
                → Quick Action: "Add Your First Content"
                    → Paste YouTube URL
                        → Content Viewer with all features
```

### Flow 2: Consuming Content with Accessibility Features

```
Dashboard → Library → Select Content
    → Content Viewer opens
        → Tab: Transcript
            → Read timestamped transcript
            → Click timestamp → video seeks
            → Search transcript
        → Tab: Language Leveler
            → Select reading level (Basic)
            → Click "Simplify Text"
            → View simplified version
        → Tab: Audio
            → Click "Generate Audio"
            → Listen to audio narration
        → Tab: Sign Language
            → 3D avatar animates ASL signs
            → Play/Pause/Speed controls
```

### Flow 3: Voice-Driven Navigation (Hands-Free)

```
Any Page → Click floating mic button (or keyboard shortcut)
    → Voice Assistant panel opens
        → User says: "Search for machine learning lectures"
            → Assistant displays YouTube results
                → User says: "Play video 2"
                    → Video opens in content viewer
        → User says: "Go to preferences"
            → Navigates to preferences page
```

### Flow 4: Customizing Accessibility

```
Dashboard → Preferences
    → Adjust font size (Large)
    → Enable high contrast
    → Set default language level (Basic)
    → Enable dyslexia-friendly font
    → Save → Preferences applied globally
```

---

## 12. Roadmap & Phasing

### Phase 1: MVP / Hackathon (✅ Complete)

| Feature                                                 | Status |
| ------------------------------------------------------- | ------ |
| 3D Sign Language Avatar (fingerspelling + common signs) | ✅     |
| Language Leveler (Groq AI + local fallback)             | ✅     |
| Audio Narrative (OpenAI TTS + Web Speech fallback)      | ✅     |
| Focus Mode (6 customizable settings)                    | ✅     |
| YouTube Integration (URL → transcript → features)       | ✅     |
| Voice Assistant (navigation + YouTube search)           | ✅     |
| Supabase Auth + RLS + Profiles                          | ✅     |
| Dashboard + Library + Preferences                       | ✅     |
| WCAG 2.2 AA Compliance                                  | ✅     |
| Responsive Design (mobile + desktop)                    | ✅     |

### Phase 2: Post-Hackathon (Months 1–3)

| Feature                                                  | Priority |
| -------------------------------------------------------- | -------- |
| User testing with disability community groups            | P0       |
| Real-time live captions (using Web Speech API streaming) | P1       |
| LMS integration — Canvas API                             | P1       |
| Advanced learning analytics dashboard (Recharts)         | P1       |
| Expanded ASL vocabulary (500+ signs, two-handed signs)   | P1       |
| Direct document upload (PDF, DOCX → text extraction)     | P2       |

### Phase 3: Growth (Months 4–6)

| Feature                                       | Priority |
| --------------------------------------------- | -------- |
| Multi-language support (BSL, ISL, LSF)        | P1       |
| Collaborative note-taking with real-time sync | P1       |
| Peer-to-peer content sharing                  | P2       |
| Mobile app (React Native)                     | P2       |
| Community-contributed sign database           | P2       |

### Phase 4: Scale (Months 7–12)

| Feature                                                 | Priority |
| ------------------------------------------------------- | -------- |
| AI-generated sign language video overlay on YouTube     | P1       |
| Institutional admin dashboard                           | P1       |
| SSO integration (SAML, OAuth for universities)          | P1       |
| CDN-cached audio files                                  | P2       |
| ML model fine-tuning for domain-specific simplification | P2       |
| International expansion + localization (i18n)           | P2       |

---

## 13. Risks & Mitigations

| #   | Risk                                    | Impact                                      | Probability | Mitigation                                                   |
| --- | --------------------------------------- | ------------------------------------------- | ----------- | ------------------------------------------------------------ |
| R1  | Groq API rate limits / downtime         | Text simplification unavailable             | Medium      | Local rule-based fallback already implemented                |
| R2  | OpenAI API costs at scale               | Increased operating expenses                | High        | Web Speech API fallback; consider self-hosted TTS models     |
| R3  | ASL accuracy — incorrect signs          | Misinformation for Deaf users               | Medium      | Community review process; disclaimer; user feedback loop     |
| R4  | Three.js performance on low-end devices | Poor 3D avatar experience                   | Medium      | Progressive quality; 2D SVG fallback for older devices       |
| R5  | YouTube API changes / blocking          | Transcript extraction breaks                | Medium      | Multiple transcript sources; manual text input option        |
| R6  | WCAG compliance regression              | Accessibility violations                    | Low         | Automated a11y testing in CI (axe-core); manual audits       |
| R7  | Data privacy (student data)             | Legal/compliance issues                     | Medium      | RLS policies; minimal data collection; FERPA/COPPA review    |
| R8  | Browser speech API inconsistency        | Voice assistant unreliable on some browsers | High        | Feature detection; graceful degradation; text input fallback |

---

## 14. Appendix

### A. Environment Variables

| Variable                        | Required | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Supabase anonymous/public key        |
| `GROQ_API_KEY`                  | Optional | Groq API key for text simplification |
| `OPENAI_API_KEY`                | Optional | OpenAI API key for audio generation  |

### B. File Structure

```
d:\Synapto\
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── generate-audio/route.ts
│   │   │   └── simplify-text/route.ts
│   │   ├── content/
│   │   │   ├── [id]/route.ts
│   │   │   ├── add/route.ts
│   │   │   ├── library/route.ts
│   │   │   ├── remove/route.ts
│   │   │   └── transcript/route.ts
│   │   ├── user/
│   │   │   └── preferences/route.ts
│   │   └── voice/
│   │       ├── process-command/route.ts
│   │       └── youtube-search/route.ts
│   ├── auth/
│   │   ├── callback/route.ts
│   │   ├── error/page.tsx
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── sign-up-success/page.tsx
│   ├── dashboard/
│   │   ├── add-content/page.tsx
│   │   ├── content/[id]/page.tsx
│   │   ├── layout.tsx
│   │   ├── library/page.tsx
│   │   ├── page.tsx
│   │   └── preferences/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── features/
│   │   ├── sign-3d/
│   │   │   ├── hand-3d-model.tsx
│   │   │   ├── index.ts
│   │   │   ├── sign-language-3d.tsx
│   │   │   └── sign-poses.ts
│   │   ├── asl-handshapes.tsx
│   │   ├── audio-narrative.tsx
│   │   ├── focus-mode.tsx
│   │   ├── language-leveler.tsx
│   │   ├── robotic-hands.tsx
│   │   └── sign-language-avatar.tsx
│   ├── ui/                          (57 shadcn/ui components)
│   ├── voice-assistant.tsx
│   └── voice-assistant-wrapper.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── db.ts
│   │   ├── proxy.ts
│   │   ├── schema.sql
│   │   ├── server.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── accessibility.ts
│   │   ├── text-processing.ts
│   │   └── youtube.ts
│   └── utils.ts
├── hooks/
├── scripts/
│   └── 001_create_schema.sql
├── middleware.ts
├── package.json
└── tsconfig.json
```

### C. Design Tokens

| Token           | Value                    | Usage                      |
| --------------- | ------------------------ | -------------------------- |
| Primary Blue    | `#0066CC`                | CTAs, links, active states |
| Accent Teal     | `#60C685`                | Success states, highlights |
| Warm Secondary  | `#C0A040`                | Warnings, accent elements  |
| Background Dark | `hsl(var(--background))` | Dark mode surfaces         |
| Text Primary    | `hsl(var(--foreground))` | Body text                  |
| Font Primary    | Geist                    | All UI text                |
| Font Accessible | OpenDyslexic             | Dyslexia-friendly mode     |

### D. Glossary

| Term               | Definition                                                                           |
| ------------------ | ------------------------------------------------------------------------------------ |
| **ASL**            | American Sign Language — visual language used by the Deaf community in North America |
| **Fingerspelling** | Spelling out words letter-by-letter using ASL hand shapes                            |
| **Gloss**          | A written representation of sign language using English words in CAPS                |
| **RLS**            | Row Level Security — Supabase/PostgreSQL feature to restrict data access per user    |
| **WCAG**           | Web Content Accessibility Guidelines — international standard for web accessibility  |
| **TTS**            | Text-to-Speech — converting written text to spoken audio                             |
| **LLM**            | Large Language Model — AI model used for text processing (e.g., LLaMA)               |
| **R3F**            | React Three Fiber — React renderer for Three.js                                      |

---

_This PRD is a living document. It will be updated as the project evolves through subsequent development phases._

**Last Updated:** 21 February 2026
