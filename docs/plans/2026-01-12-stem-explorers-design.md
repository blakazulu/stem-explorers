# STEM Explorers - Design Document

**Date:** 2026-01-12
**Project:** School Learning Management System (Grades 1-6)
**Site Name:** STEM Explorers (חוקרי STEM)

---

## 1. Overview

A learning platform for an elementary school implementing STEM education (Science, Technology, Engineering, Mathematics). The platform serves teachers, parents, and students with role-based access to pedagogical content, documentation, research journals, and AI-generated reports.

**Key Goals:**
- Transparency for parents (see what kids are learning)
- Knowledge tools for teachers (content, forum, chatbot)
- Engaging experience for students (research journal)
- Modern, cutting-edge tech feel representing STEM education

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Netlify Functions (serverless) |
| **Database** | Firebase Firestore |
| **File Storage** | Firebase Storage |
| **Chatbot** | Botpress (free tier with knowledge base) |
| **AI Reports** | Google Gemini API (Flash-Lite) |
| **Email** | Resend or SendGrid (via Netlify Functions) |
| **Hosting** | Netlify |
| **PWA** | next-pwa |

---

## 3. User Roles & Authentication

### 3.1 Roles

| Role | Password Pattern | Capabilities |
|------|------------------|--------------|
| **Admin** | `admin-{secret}` | Everything: upload/delete work plans, manage questions, configure reports, delete any content, manage settings |
| **Teacher** | `teacher-{grade}` | View pedagogical model, add documentation, forum access, chatbot, view reports |
| **Parent** | `parent-{grade}` | View-only: pedagogical model, work plans, documentation, reports, explanation pages |
| **Student** | `student-{grade}` | View-only: pedagogical model, work plans, documentation, explanation pages + Research Journal wizard (no reports) |

### 3.2 Grade Levels
א, ב, ג, ד, ה, ו (6 grades)

### 3.3 Authentication Flow
1. User enters full name + password
2. System looks up password in Firestore
3. Password determines role + grade
4. Redirect to appropriate dashboard

**Example Passwords:**
- `admin-stem2025` → Admin
- `teacher-א` → Teacher for grade א
- `parent-ג` → Parent for grade ג
- `student-ה` → Student for grade ה

---

## 4. Data Models (Firestore)

```
/users/{password}
  - name: string
  - role: "admin" | "teacher" | "parent" | "student"
  - grade: "א" | "ב" | "ג" | "ד" | "ה" | "ו" | null
  - createdAt: timestamp

/grades/{gradeId}
  - name: "א" | "ב" | "ג" | "ד" | "ה" | "ו"

/units/{unitId}
  - gradeId: string
  - name: string
  - introFileUrl: string
  - unitFileUrl: string
  - order: number
  - createdAt: timestamp

/documentation/{docId}
  - unitId: string
  - gradeId: string
  - images: string[] (urls)
  - text: string
  - teacherName: string
  - createdAt: timestamp

/researchJournals/{journalId}
  - unitId: string
  - gradeId: string
  - studentName: string
  - answers: { questionId: string, answer: any }[]
  - createdAt: timestamp

/reports/{reportId}
  - unitId: string
  - gradeId: string
  - teacherContent: string (markdown)
  - parentContent: string (markdown)
  - generatedAt: timestamp

/questions/{questionId}
  - type: "rating" | "single" | "multiple" | "open"
  - text: string
  - options: string[] (for choice types)
  - target: { grades: string[], units: string[] }
  - order: number

/forum/{postId}
  - room: "requests" | "consultations"
  - authorName: string
  - title: string
  - content: string
  - replies: { authorName, content, createdAt }[]
  - createdAt: timestamp

/settings/explanationButtons
  - buttons: { id, role, label, content, visible }[]

/settings/emailConfig
  - adminEmails: string[]
  - frequency: "immediate" | "daily"
  - includeContent: boolean

/settings/reportConfig
  - elements: { id, label, enabledForTeacher, enabledForParent }[]
  - aiPromptInstructions: string

/botKnowledge/{docId}
  - title: string
  - content: string
  - fileUrl: string (optional)
  - createdAt: timestamp
```

---

## 5. Screen Layouts

### 5.1 Admin Dashboard
```
┌─────────────────────────────────────────┐
│  STEM Explorers - Admin                 │
├─────────────────────────────────────────┤
│ [Work Plans Management] [Questions Mgmt]│
│ [Report Settings] [Bot Knowledge Base]  │
│ [Explanation Pages] [Email Settings]    │
│ [Password Management] [View All Content]│
└─────────────────────────────────────────┘
```

### 5.2 Teacher Dashboard
```
┌─────────────────────────────────────────┐
│  STEM Explorers - Teacher               │
├─────────────────────────────────────────┤
│ [Select Grade: א ב ג ד ה ו]             │
│                                         │
│ [Pedagogical Model] [Forum] [Bot]       │
│ [Reports]                               │
└─────────────────────────────────────────┘
```

### 5.3 Parent Dashboard
```
┌─────────────────────────────────────────┐
│  STEM Explorers - Parent (Grade ג)      │
├─────────────────────────────────────────┤
│ [Pedagogical Model] [Work Plan]         │
│ [Documentation] [Reports]               │
│ [About the Work*] [Work Method*]        │
│ [What It Gives*]                        │
└─────────────────────────────────────────┘
* Admin-configurable explanation buttons
```

### 5.4 Student Dashboard
```
┌─────────────────────────────────────────┐
│  STEM Explorers - Student (Grade ג)     │
├─────────────────────────────────────────┤
│ [Pedagogical Model] [Work Plan]         │
│ [Documentation] [Research Journal]      │
│ [About Research Work*]                  │
│ [About Entrepreneurship*]               │
└─────────────────────────────────────────┘
* Admin-configurable explanation buttons
```

---

## 6. Core Features

### 6.1 Pedagogical Model Tree

**Structure:**
```
Grade א
├── Unit: "מים וסביבה"
│   ├── Intro file (מבוא)
│   └── Unit file (היחידה)
├── Unit: "אנרגיה מתחדשת"
└── ...
```

**Admin Upload Flow:**
1. Admin selects grade
2. Uploads 2 files per unit: intro PDF/Word + unit PDF/Word
3. Enters unit name
4. System creates tree node automatically

**File Handling:**
- Supported formats: PDF, Word (.docx)
- Word files converted to PDF on upload for consistent display
- PDF viewer: pdf.js embedded viewer

### 6.2 Research Journal (יומן חוקר)

**Student Flow:**
1. Click "Research Journal"
2. Select unit
3. Answer questions (wizard format)
4. Submit
5. Triggers AI report regeneration

**Question Types:**
- Rating (1-5 scale)
- Single choice
- Multiple choice
- Open text

**Admin Question Builder:**
- Create/edit/delete questions
- Set question type + text + options
- Set target scope: all grades, specific grades, specific units, or combination
- Reorder via drag-and-drop
- Preview wizard

### 6.3 AI Reports

**Generation Flow:**
1. Student submits Research Journal
2. Netlify Function triggers
3. Fetches all journal entries for unit + grade
4. Sends to Gemini with admin-configured prompt
5. Generates separate content for teachers vs parents
6. Saves to Firestore

**Admin Configuration:**
- Toggle report elements (summary, patterns, challenges, suggestions, per-student)
- Configure what teachers see vs what parents see
- Custom AI prompt instructions

### 6.4 Forum

**Structure:**
- Requests room (בקשות) - triggers admin email
- Consultations room (התייעצויות) - general discussion

**Features:**
- Teachers only
- Create/view/reply to posts
- Edit/delete own posts
- Admin can delete any post

**Email Notifications (Requests room):**
- Configurable: immediate or daily digest
- Configurable: title only or full content
- Sent via Resend/SendGrid

### 6.5 Documentation

**Teacher Upload:**
- Select unit
- Upload up to 5 images
- Add optional text description
- Save

**Image Processing:**
1. Resize to max 800px width (maintain ratio)
2. Compress (optimize quality vs size)
3. Convert to WebP
4. Upload to Firebase Storage

**Gallery View:**
- Grid of documentation entries
- Click to expand
- Teachers can delete own entries
- Admin can delete any entry
- Parents/Students view only

### 6.6 Chatbot (Botpress)

**Integration:**
- Floating chat widget (teachers only)
- Opens chat panel on click

**Knowledge Sources (auto-synced):**
- Work plans (PDF/Word content extracted)
- Documentation entries
- Forum posts
- Research Journal responses
- AI-generated reports
- Custom knowledge base (admin uploads)

**Sync Strategy:**
- Webhook to Botpress on content changes
- Or: scheduled daily sync
- Admin can trigger manual refresh

### 6.7 Explanation Pages

**Per-role configurable buttons:**
- Parents: "About the Work", "Work Method", "What It Gives"
- Students: "About Research Work", "About Entrepreneurship"

**Admin Configuration:**
- Rename button labels
- Edit content (rich text + images, no videos)
- Toggle visibility on/off

---

## 7. Admin Configuration Panels

1. **Work Plans Management** - Upload/delete/reorder units per grade
2. **Questions Management** - Create/edit Research Journal questions
3. **Report Settings** - Configure report elements and role visibility
4. **Bot Knowledge Base** - Upload docs, add FAQs, trigger refresh
5. **Explanation Pages** - Rename/edit/toggle explanation buttons
6. **Email Settings** - Admin emails, frequency, content options
7. **Password Management** - Create/delete passwords, assign roles

---

## 8. Visual Design

### 8.1 Design Principles
- Modern, cutting-edge tech feel
- STEM-themed (science, tech, engineering, math)
- Clean, not cluttered
- RTL Hebrew only
- Minimum 16px fonts
- No purple gradients

### 8.2 Color Palette
```
Primary:     #0F766E (Teal - science/tech feel)
Secondary:   #0284C7 (Blue - trust/knowledge)
Accent:      #F59E0B (Amber - energy/creativity)
Success:     #22C55E (Green)
Error:       #EF4444 (Red)
Background:  #F8FAFC (Light gray)
Text:        #1E293B (Dark slate)
```

### 8.3 Adaptive Themes by Role
| Role | Feel | Accent Colors |
|------|------|---------------|
| **Admin** | Professional, dashboard-like | Teal + Gray |
| **Teacher** | Clean, efficient, knowledge-focused | Teal + Blue |
| **Parent** | Warm, transparent, trustworthy | Teal + Amber |
| **Student** | Fun, engaging, interactive | Bright teal + Amber + playful icons |

### 8.4 Typography
| Usage | Font | Style |
|-------|------|-------|
| **Headers** | Rubik | Bold, modern, geometric |
| **Body text** | Heebo | Clean, readable, friendly |

**Sizing:**
- H1: 32px (Rubik Bold)
- H2: 24px (Rubik SemiBold)
- H3: 20px (Rubik Medium)
- Body: 16px (Heebo Regular)
- Small: 14px (Heebo Regular)

### 8.5 UI Elements
- Rounded corners (8px-12px)
- Subtle shadows
- STEM-inspired icons (atoms, gears, lightbulbs, graphs)
- Micro-animations on interactions
- Cards-based layout

---

## 9. PWA Configuration

**Features:**
- Installable on mobile (Add to Home Screen)
- App icon on phone
- Splash screen on launch
- Online only (no offline caching)

**Manifest:**
```json
{
  "name": "STEM Explorers",
  "short_name": "STEM Explorers",
  "theme_color": "#0F766E",
  "background_color": "#F8FAFC",
  "display": "standalone",
  "orientation": "portrait"
}
```

**App Icon:**
- STEM-themed logo (stylized atom/gear combo)
- Sizes: 192x192, 512x512

**Install Prompt:**
- Show "Add to Home Screen" banner after 2nd visit
- Dismissible, remembers preference

---

## 10. Project Structure (Proposed)

```
stem-explorers/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   ├── parent/
│   │   │   └── student/
│   │   ├── api/                # API routes (or Netlify Functions)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── forms/              # Form components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── ...
│   ├── lib/
│   │   ├── firebase.ts         # Firebase config
│   │   ├── gemini.ts           # Gemini API client
│   │   ├── botpress.ts         # Botpress integration
│   │   └── utils.ts
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── netlify/
│   └── functions/              # Netlify serverless functions
├── public/
│   ├── icons/                  # PWA icons
│   └── manifest.json
├── docs/
│   └── plans/
└── ...config files
```

---

## 11. External Services Setup

### 11.1 Firebase
- Create Firebase project
- Enable Firestore (production mode)
- Enable Storage
- Configure security rules
- Get config keys for Next.js

### 11.2 Botpress
- Create Botpress account
- Set up bot with knowledge base
- Get embed code / API keys
- Configure webhook for content sync

### 11.3 Gemini API
- Get API key from Google AI Studio
- Use Gemini Flash-Lite for cost efficiency
- Configure in Netlify environment variables

### 11.4 Email (Resend/SendGrid)
- Create account
- Verify domain
- Get API key
- Configure in Netlify environment variables

### 11.5 Netlify
- Connect to Git repository
- Configure build settings
- Set environment variables
- Enable Functions

---

## 12. Security Considerations

- Password stored as document ID (hashed in production)
- Firestore security rules based on session/role
- File uploads validated (type, size)
- Image processing server-side only
- API routes protected by role verification
- No sensitive data in client-side code
- Environment variables for all secrets

---

## 13. Future Considerations (Out of Scope)

- Multi-school support
- Real user accounts (email/password registration)
- Push notifications
- Offline mode
- Analytics dashboard
- Multi-language support

---

*Document generated: 2026-01-12*
