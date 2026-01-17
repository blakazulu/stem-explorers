# Sidenav Structure Documentation

This document describes the sidebar navigation links across all user roles and how admin can configure visibility.

## Navigation Links by Role

| Link (Hebrew) | Path | Student | Teacher | Parent | Admin |
|---------------|------|:-------:|:-------:|:------:|:-----:|
| מודל פדגוגי ומו"פ | /pedagogical | ✓ | ✓ | ✓ | ✓ |
| משאבי הוראה | /teaching-resources | | ✓ | | ✓ |
| תיעודים | /documentation | ✓ | ✓ | ✓ | ✓ |
| יומן חוקר | /journal | ✓ | | | |
| דוחות | /reports | | ✓ | ✓ | ✓ |
| תגובות תלמידים | /responses | | ✓ | | ✓ |
| במה אישית | /forum | | ✓ | | ✓ |
| שאל את המומחה | /experts | ✓ | ✓ | ✓ | ✓ |
| פעילויות קהילתיות | /community-activities | | | ✓ | |
| STEM במשפחה | /stem-family | | | ✓ | |
| שותפים לדרך | /partners | | | ✓ | |
| שאלות | /questions | | | | ✓ |
| סיסמאות | /passwords | | | | ✓ |
| הגדרות | /settings | | | | ✓ |
| תצוגה | /display | | | | ✓ |

## Links Summary by Role

### Student (4 links)
- מודל פדגוגי ומו"פ (pedagogical)
- תיעודים (documentation)
- יומן חוקר (journal) - **exclusive to students**
- שאל את המומחה (experts)

### Teacher (7 links)
- מודל פדגוגי ומו"פ (pedagogical)
- משאבי הוראה (teaching-resources)
- תיעודים (documentation)
- דוחות (reports)
- תגובות תלמידים (responses)
- במה אישית (forum)
- שאל את המומחה (experts)

### Parent (7 links)
- מודל פדגוגי ומו"פ (pedagogical)
- תיעודים (documentation)
- דוחות (reports)
- שאל את המומחה (experts)
- פעילויות קהילתיות (community-activities) - **exclusive to parents**
- STEM במשפחה (stem-family) - **exclusive to parents**
- שותפים לדרך (partners) - **exclusive to parents**

### Admin (15 links total)
All links available, organized into:

**Main section (11 links):**
- All teacher links plus experts

**Admin section (4 links):**
- שאלות (questions)
- סיסמאות (passwords)
- הגדרות (settings)
- תצוגה (display)

## Admin Display Settings

Location: `/admin/display`

Admin can configure visibility for **configurable roles** (teacher, parent, student). Admin's own sidebar is **fixed** and not configurable.

### What Admin Can Configure

1. **תפריט צד (Sidebar)**
   - Toggle each navlink visible/hidden (checkbox)
   - Edit the display label of each link
   - Hidden links show "(מוסתר)" indicator

2. **לוח בקרה (Dashboard)**
   - Opening text
   - Dashboard cards

3. **אלמנטים בדפים (Page Elements)**
   - Page-specific UI elements

### How It Works

1. Configuration stored in Firestore via `VisibilityConfig` type
2. `VisibilityContext` provides access to config throughout the app
3. `Sidebar.tsx` filters links based on:
   - Role-based access (hardcoded in `navItems`)
   - Visibility config (for non-admin roles)
4. Custom labels are applied via `getCustomLabel()` function

### Key Files

- `src/components/dashboard/Sidebar.tsx` - Main sidebar component with `navItems` definition
- `src/app/(dashboard)/[role]/display/page.tsx` - Admin display settings page
- `src/components/display/SidebarSection.tsx` - Sidebar config UI component
- `src/contexts/VisibilityContext.tsx` - Visibility config context provider
- `src/types/index.ts` - `VisibilityConfig`, `SidebarConfig`, `ConfigurableRole` types

## Grade-Aware Sections

Some sections include grade in the URL path. These are defined in `GRADE_SECTIONS`:

- teaching-resources
- questions
- documentation
- pedagogical
- reports
- responses

For these sections, the sidebar automatically appends the user's grade (or stored grade for admins/teachers) to the URL.
