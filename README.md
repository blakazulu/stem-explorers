# STEM Explorers (חוקרי STEM)

A learning management platform for elementary schools (grades 1-6) implementing STEM education.

## Overview

STEM Explorers provides role-based access to pedagogical content, documentation, research journals, and AI-generated reports for teachers, parents, and students.

## Key Features

- **Pedagogical Model Tree** - Structured curriculum organized by grade and unit
- **Research Journal (יומן חוקר)** - Student wizard for answering structured questions
- **AI Reports** - Gemini-powered analysis of student responses
- **Teacher Forum** - Requests and consultations rooms with email notifications
- **Documentation Gallery** - Image uploads with automatic optimization
- **Chatbot** - Botpress-powered assistant with full knowledge base access
- **PWA Support** - Installable on mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Netlify Functions |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Chatbot | Botpress |
| AI | Google Gemini API |
| Email | Resend/SendGrid |
| Hosting | Netlify |

## User Roles

| Role | Access |
|------|--------|
| Admin | Full access - manage content, settings, users |
| Teacher | View content, add documentation, forum, chatbot, reports |
| Parent | View-only access to content and reports |
| Student | View content + Research Journal wizard |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Documentation

See [Design Document](docs/plans/2026-01-12-stem-explorers-design.md) for detailed specifications.

## License

Private - All rights reserved
