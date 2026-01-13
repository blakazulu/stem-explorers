# STEM Explorers (חוקרי STEM)

מערכת ניהול למידה לבתי ספר יסודיים (כיתות א-ו) המיישמים חינוך STEM.

A learning management platform for elementary schools (grades 1-6) implementing STEM education.

---

## Overview | סקירה כללית

STEM Explorers is a comprehensive learning platform designed for elementary schools implementing STEM (Science, Technology, Engineering, Mathematics) education. The platform provides role-based access to pedagogical content, documentation, research journals, and AI-generated reports.

**Key Goals:**
- **Transparency for parents** - See what children are learning
- **Knowledge tools for teachers** - Content management, forum, chatbot assistance
- **Engaging experience for students** - Interactive research journal
- **Modern tech feel** - Representing cutting-edge STEM education

---

## User Roles | תפקידים

The system supports 4 user roles with different access levels:

### Admin (מנהל)
| Feature | Access |
|---------|--------|
| Work Plans | Upload, edit, delete for all grades |
| Pedagogical Model | Full access to all grades |
| Documentation | View and delete any |
| Research Journals | View and delete any |
| Reports | View all, configure AI settings |
| Forum | Full access, delete any post |
| Questions Management | Create, edit, delete journal questions |
| Settings | Email config, report elements, explanation buttons |
| Password Management | Create and edit user passwords |

### Teacher (מורה)
| Feature | Access |
|---------|--------|
| Grade Selection | Can view any grade |
| Pedagogical Model | View units, intro files, unit files |
| Documentation | View gallery, add new (up to 5 images), delete own |
| Reports | View AI-generated reports per unit |
| Forum | View, create posts, reply (2 rooms: Requests & Consultations) |
| Chatbot | Access to knowledge-based assistant |

### Parent (הורה)
| Feature | Access |
|---------|--------|
| Pedagogical Model | View only (assigned grade) |
| Work Plans | View only |
| Documentation | View only |
| Reports | View AI-generated reports |
| Explanation Pages | "About the Work", "Work Method", "What It Gives" |

### Student (תלמיד)
| Feature | Access |
|---------|--------|
| Pedagogical Model | View only (assigned grade) |
| Work Plans | View only |
| Documentation | View only |
| Research Journal | Fill wizard with structured questions |
| Explanation Pages | "About Research Work", "About Entrepreneurship" |

---

## Screens | מסכים

### Login Screen (מסך כניסה)
- Full name input
- Password input
- Password determines role + grade assignment

### Teacher Dashboard (מסך מורה)
```
┌─────────────────────────────────────────┐
│  חוקרי STEM - מורה                      │
├─────────────────────────────────────────┤
│ בחירת שכבה: [א] [ב] [ג] [ד] [ה] [ו]     │
│                                         │
│ [מודל פדגוגי] [תיעודים] [דוחות]         │
│ [פורום] [בוט]                           │
└─────────────────────────────────────────┘
```

### Parent Dashboard (מסך הורה)
```
┌─────────────────────────────────────────┐
│  חוקרי STEM - הורה (כיתה ג)             │
├─────────────────────────────────────────┤
│ [מודל פדגוגי] [תוכנית עבודה]            │
│ [תיעודים] [דוחות]                       │
│ [הסבר על העבודה] [שיטת העבודה]          │
│ [מה זה נותן]                            │
└─────────────────────────────────────────┘
```

### Student Dashboard (מסך תלמיד)
```
┌─────────────────────────────────────────┐
│  חוקרי STEM - תלמיד (כיתה ג)            │
├─────────────────────────────────────────┤
│ [מודל פדגוגי] [תוכנית עבודה]            │
│ [תיעודים] [יומן חוקר]                   │
│ [הסבר על עבודת חקר] [הסבר על יזמות]     │
└─────────────────────────────────────────┘
```

### Admin Dashboard (מסך מנהל)
```
┌─────────────────────────────────────────┐
│  חוקרי STEM - מנהל                      │
├─────────────────────────────────────────┤
│ [תוכניות עבודה] [ניהול שאלות]           │
│ [הגדרות דוחות] [דפי הסבר]               │
│ [הגדרות מייל] [ניהול סיסמאות]           │
│ [צפייה בכל התוכן]                       │
└─────────────────────────────────────────┘
```

---

## Core Features | תכונות עיקריות

### 1. Pedagogical Model (מודל פדגוגי)
A tree structure showing learning units per grade:
```
כיתה א
├── יחידה: "מים וסביבה"
│   ├── קובץ מבוא
│   └── קובץ היחידה
├── יחידה: "אנרגיה מתחדשת"
└── ...
```

- Admin uploads 2 files per unit (intro + unit content)
- Tree built automatically from uploaded work plans
- Click unit to view files

### 2. Research Journal (יומן חוקר)
Student wizard for answering structured questions:

**Question Types:**
- Rating (1-5 scale) - דירוג
- Single choice - בחירה יחידה
- Multiple choice - בחירה מרובה
- Open text - שאלה פתוחה

**Flow:**
1. Student selects unit
2. Answers questions in wizard format
3. Submits journal
4. Triggers AI report regeneration

### 3. AI Reports (דוחות AI)
Powered by Google Gemini:

- Generated automatically when students submit journals
- Separate content for teachers vs parents
- Admin configures report elements and AI instructions
- Shows patterns, insights, and per-student analysis

### 4. Forum (פורום)
Teachers-only discussion area:

**Two Rooms:**
- **Requests (בקשות)** - Sends email notification to admins
- **Consultations (התייעצויות)** - General discussion

**Features:**
- Create/view/reply to posts
- Edit/delete own posts
- Admin can delete any post

### 5. Documentation (תיעודים)
Gallery of learning documentation:

**Teacher Upload:**
- Select unit
- Upload up to 5 images
- Add optional text description

**Image Processing:**
- Auto-resize to max 800px width
- Optimize and compress
- Convert to WebP format

### 6. Chatbot (בוט)
Teachers-only knowledge assistant:
- Floating chat widget
- Has access to all platform content
- Can answer questions about curriculum, methods, etc.

### 7. Explanation Pages (דפי הסבר)
Admin-configurable content pages:

**For Parents:**
- About the Work (הסבר על העבודה)
- Work Method (שיטת העבודה)
- What It Gives (מה זה נותן)

**For Students:**
- About Research Work (הסבר על עבודת חקר)
- About Entrepreneurship (הסבר על יזמות)

---

## Authentication | אימות

### Password-Based Login
- User enters full name + password
- Password is the document ID in Firestore
- Password pattern determines role and grade

### Password Patterns
| Role | Pattern | Example |
|------|---------|---------|
| Admin | `admin-{secret}` | `admin-stem2026` |
| Teacher | `teacher-{grade}` | `teacher-a` |
| Parent | `parent-{grade}` | `parent-b` |
| Student | `zzz-{grade}` | `zzz-c` |

### Grade Mapping
| Hebrew | English |
|--------|---------|
| א | a |
| ב | b |
| ג | c |
| ד | d |
| ה | e |
| ו | f |

---

## Tech Stack | טכנולוגיות

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | Netlify Functions (serverless) |
| **Database** | Firebase Firestore |
| **File Storage** | Firebase Storage |
| **Chatbot** | Botpress (free tier with knowledge base) |
| **AI Reports** | Google Gemini API (Flash-Lite) |
| **Email** | Resend or SendGrid |
| **Hosting** | Netlify |
| **PWA** | next-pwa (installable on mobile) |

---

## Design | עיצוב

### Color Palette
```
Primary:       #0F766E (Teal - science/tech feel)
Primary Light: #14B8A6
Primary Dark:  #0D5D56
Secondary:     #0284C7 (Blue - trust/knowledge)
Secondary Light: #38BDF8
Accent:        #F59E0B (Amber - energy/creativity)
Accent Light:  #FBBF24
Success:       #22C55E (Green)
Error:         #EF4444 (Red)
Background:    #F8FAFC (Light gray)
Text:          #1E293B (Dark slate)

Surface Colors (for depth):
Surface-0:     #FFFFFF
Surface-1:     #F8FAFC
Surface-2:     #F1F5F9
Surface-3:     #E2E8F0

Role Colors:
Admin:         #6366F1 (Indigo - professional)
Teacher:       #0284C7 (Blue - knowledge)
Parent:        #F59E0B (Amber - warmth)
Student:       #10B981 (Emerald - growth/fun)
```

### Typography
| Usage | Font |
|-------|------|
| Headers | Rubik (Bold, modern, geometric) |
| Body | Heebo (Clean, readable, friendly) |

### UI Component Library
The platform includes a comprehensive set of reusable UI components:

| Component | Description |
|-----------|-------------|
| `Button` | Multiple variants (primary, outline, ghost, destructive), icon support, loading states |
| `Card` | Elevated/outlined variants, interactive hover effects |
| `Icon` | STEM-themed Lucide icons (atom, flask, rocket, brain, lightbulb, etc.) |
| `GradeSelector` | Grade selection with Hebrew numeral indicators and ring glow |
| `Progress` | Animated progress bar with step indicators |
| `Skeleton` | Shimmer loading placeholders for cards, text, grids |
| `Toast` | Slide-in notifications with auto-dismiss |
| `EmptyState` | Consistent empty state displays with STEM illustrations |
| `ConfirmDialog` | Animated modal with variant-specific icons |

### Role-Based Theming System
Each role has a distinct visual theme applied via React Context:

| Role | Theme | Icon | Characteristics |
|------|-------|------|-----------------|
| **Admin** | Indigo | Shield | Professional, dashboard-focused, clean data layouts |
| **Teacher** | Blue | GraduationCap | Calm tones, organized interfaces, knowledge icons |
| **Parent** | Amber | Users | Warm highlights, friendly rounded elements |
| **Student** | Emerald | Rocket | Vibrant colors, playful animations, celebration effects |

### Animations
Custom Tailwind animations defined in `tailwind.config.ts`:

```
fadeIn     - Opacity fade (200ms)
slideUp    - Slide from bottom with fade (300ms)
scaleIn    - Scale from 0.95 with fade (200ms)
shimmer    - Loading shimmer effect (2s infinite)
celebrate  - Scale pulse for achievements (500ms)
bounce     - Playful bounce for student elements
```

### Design Principles

**Responsive Design:**
- Mobile-first approach
- Tablet and desktop should look amazing - not just fill up the screen
- Use `max-w-4xl` or `max-w-5xl` to constrain content width on large screens
- Grid layouts: 1 column mobile → 2 columns tablet → 3 columns desktop
- Responsive padding: `p-4 md:p-6`
- Responsive typography: `text-xl md:text-2xl` for headings

**Interactions:**
- `cursor-pointer` on all clickable elements (buttons, links, cards, tabs)
- `transition-all duration-200` for smooth hover effects
- Hover states: `hover:shadow-md` on cards, `hover:text-primary/80` on links
- Focus states with ring indicators

**Animations & Transitions:**
- Smooth transitions on all interactive elements (200-300ms)
- Staggered slide-up animations on page load
- Collapsible sections with height/opacity transitions
- Progress bars with animated fill
- Hover shadow transitions on cards

**Collapsible Sections:**
- Use collapsible accordions where it makes sense (grouped lists, settings)
- ChevronDown icon with 180° rotation animation
- Smooth maxHeight/opacity transitions (300ms)

**Page Structure:**
- Consistent page headers with icon, title, and subtitle
- Role-colored icon backgrounds (e.g., `bg-role-admin/10`)
- Skeleton loading during data fetches
- EmptyState components for no-data scenarios

**General:**
- RTL Hebrew layout
- Minimum 16px fonts
- Modern, clean, not cluttered
- STEM-themed icons (atoms, gears, lightbulbs, rockets)
- Cards-based layout with rounded corners (8px-12px)
- Subtle shadows that enhance on hover

---

## Data Models | מודלים

```
/users/{password}
  - role: "admin" | "teacher" | "parent" | "student"
  - grade: "א" | "ב" | "ג" | "ד" | "ה" | "ו" | null
  - createdAt: timestamp

/units/{unitId}
  - gradeId: string
  - name: string
  - introFileUrl: string
  - unitFileUrl: string
  - order: number

/documentation/{docId}
  - unitId: string
  - gradeId: string
  - images: string[]
  - text: string
  - teacherName: string
  - createdAt: timestamp

/researchJournals/{journalId}
  - unitId: string
  - gradeId: string
  - studentName: string
  - answers: { questionId, answer }[]
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
  - options: string[]
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
/settings/emailConfig
/settings/reportConfig
```

---

## Project Structure | מבנה הפרויקט

```
stem-explorers/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/login/       # Login page
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   ├── admin/          # Admin settings
│   │   │   ├── passwords/      # Password management
│   │   │   ├── questions/      # Questions management
│   │   │   ├── work-plans/     # Work plans management
│   │   │   ├── pedagogical/    # Pedagogical model view
│   │   │   ├── documentation/  # Documentation gallery
│   │   │   ├── journal/        # Research journal wizard
│   │   │   ├── reports/        # AI reports view
│   │   │   └── forum/          # Forum rooms
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx      # Button with variants, icons, loading
│   │   │   ├── Card.tsx        # Card container component
│   │   │   ├── ConfirmDialog.tsx # Confirmation modal
│   │   │   ├── EmptyState.tsx  # Empty state displays
│   │   │   ├── GradeSelector.tsx # Grade selection component
│   │   │   ├── Icon.tsx        # STEM icon component
│   │   │   ├── Input.tsx       # Form input
│   │   │   ├── Progress.tsx    # Progress bar
│   │   │   ├── Skeleton.tsx    # Loading skeletons
│   │   │   └── Toast.tsx       # Toast notifications
│   │   ├── dashboard/          # Dashboard components
│   │   ├── documentation/      # Documentation components
│   │   ├── forum/              # Forum components
│   │   ├── journal/            # Journal wizard components
│   │   └── pedagogical/        # Pedagogical model components
│   ├── lib/
│   │   ├── firebase.ts         # Firebase config
│   │   ├── services/           # Firestore services
│   │   └── utils/              # Utility functions
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Role-based theming
│   └── types/                  # TypeScript types
├── public/
│   ├── icons/                  # PWA icons
│   └── manifest.json           # PWA manifest
├── docs/
│   ├── idea.pdf                # Original idea document
│   └── plans/                  # Design documents
└── scripts/
    └── seed-users.ts           # Database seeding script
```

---

## Getting Started | התחלה מהירה

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd stem-explorers

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Seed initial users (optional)
npx tsx scripts/seed-users.ts

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Build for Production

```bash
npm run build
npm start
```

---

## PWA Support | תמיכה באפליקציה

The app is installable on mobile devices:
- Add to Home Screen prompt
- App icon on phone
- Splash screen on launch
- Standalone display mode

---

## Future Considerations | שיקולים לעתיד

- Multi-school support
- Real user accounts (email/password)
- Push notifications
- Offline mode
- Analytics dashboard
- Multi-language support

---

## Documentation | תיעוד נוסף

- [Original Idea (PDF)](docs/idea.pdf)
- [Design Document](docs/plans/2026-01-12-stem-explorers-design.md)

---

## License | רישיון

Private - All rights reserved

---

*חוקרי STEM - מרחב למידה לעבודה שוטפת לבית ספר*
