# Design Brief: Kursverwaltungssystem

## 1. App Analysis
- **What this app does:** A comprehensive course management system for educational institutions to manage courses, instructors, participants, rooms, and enrollments - essentially an admin dashboard for course operations.
- **Who uses this:** Administrative staff at educational institutions, training centers, or academies.
- **The ONE thing users care about most:** Quick overview of all active courses with their enrollment status and easy access to all data management.
- **Primary actions:** Create/edit courses, manage enrollments, add instructors/participants, assign rooms.

## 2. What Makes This Design Distinctive
- **Visual identity:** Academic elegance with a refined deep teal accent, subtle paper-like textures, and generous whitespace. Inspired by modern university portals like Coursera's admin backend.
- **Layout strategy:** Left sidebar navigation with icon+text labels, main content area with a hero stats row, followed by tabbed data tables.
- **Unique element:** A "pulse" indicator on active courses showing real-time enrollment status (spots remaining) with a subtle gradient bar.

## 3. Theme & Colors
- **Font:** Plus Jakarta Sans - geometric, modern, highly readable for data-heavy interfaces
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap
- **Why this font:** Clean geometric forms with subtle personality, excellent for admin dashboards requiring long reading sessions

### Color Palette (HSL)
- **Background:** hsl(210 20% 98%) - warm off-white with slight cool undertone
- **Card Background:** hsl(0 0% 100%) - pure white for cards
- **Primary (Deep Teal):** hsl(175 55% 35%) - sophisticated, educational feel
- **Primary Foreground:** hsl(0 0% 100%) - white text on primary
- **Secondary:** hsl(210 15% 94%) - subtle gray for secondary elements
- **Accent (Warm Amber):** hsl(40 90% 55%) - for highlights and CTAs
- **Muted Text:** hsl(210 10% 50%) - for secondary text
- **Success:** hsl(150 60% 40%) - for "paid" status
- **Danger:** hsl(0 70% 55%) - for unpaid/warnings

## 4. Mobile Layout
- **Layout approach:** Full-width stacked sections, bottom navigation bar with icons
- **What users see:**
  1. Header with app title and quick-add button
  2. Hero stat cards (swipeable horizontally)
  3. Tab bar for entity switching
  4. Scrollable data list with expandable items
  5. Floating action button for primary actions
- **Touch targets:** Minimum 48px height for all interactive elements

## 5. Desktop Layout
- **Overall structure:** 240px sidebar + fluid main content (max 1400px)
- **Section layout:**
  - Top row: 4 stat cards (equal width)
  - Main area: Tabbed interface with data tables
  - Each tab has search/filter bar + action buttons
- **Hover states:** Cards lift with shadow, table rows highlight, buttons have subtle scale

## 6. Components

### Hero KPIs (4 cards, top row)
1. **Aktive Kurse** - Total active courses (primary color icon)
2. **Anmeldungen** - Total enrollments this month
3. **Dozenten** - Total instructors
4. **Einnahmen** - Total revenue from paid enrollments (accent color)

### Secondary Stats (within tables)
- Enrollment capacity progress bar per course
- Payment status badges per enrollment

### Lists/Tables (Tabbed interface)
- **Kurse:** Title, Instructor, Dates, Room, Capacity bar, Actions
- **Dozenten:** Name, Email, Phone, Specialty, Course count
- **Teilnehmer:** Name, Email, Phone, Birth date, Enrollment count
- **Räume:** Name, Building, Capacity, Usage indicator
- **Anmeldungen:** Participant, Course, Date, Payment status, Actions

### Primary Action Buttons
- "+ Neuer Kurs" (hero button in courses tab)
- "+ Neuer Dozent", "+ Neuer Teilnehmer", etc. per tab
- Inline edit/delete actions per row

## 7. Visual Details
- **Border radius:** 12px for cards, 8px for buttons/inputs, 6px for badges
- **Shadows:**
  - Cards: `0 1px 3px hsl(210 20% 50% / 0.08), 0 4px 12px hsl(210 20% 50% / 0.04)`
  - Hover: `0 4px 12px hsl(210 20% 50% / 0.12), 0 8px 24px hsl(210 20% 50% / 0.06)`
- **Spacing:** 8px base unit (8, 16, 24, 32, 48, 64)
- **Animations:**
  - Transitions: 200ms ease-out for hovers
  - Dialogs: slide-in from bottom on mobile, fade+scale on desktop

## 8. CSS Variables

```css
:root {
  /* Typography */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;

  /* Base radius */
  --radius: 0.75rem;

  /* Colors */
  --background: 210 20% 98%;
  --foreground: 210 25% 15%;

  --card: 0 0% 100%;
  --card-foreground: 210 25% 15%;

  --popover: 0 0% 100%;
  --popover-foreground: 210 25% 15%;

  --primary: 175 55% 35%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 15% 94%;
  --secondary-foreground: 210 25% 25%;

  --muted: 210 15% 94%;
  --muted-foreground: 210 10% 50%;

  --accent: 40 90% 55%;
  --accent-foreground: 40 90% 15%;

  --destructive: 0 70% 55%;
  --destructive-foreground: 0 0% 100%;

  --success: 150 60% 40%;
  --success-foreground: 0 0% 100%;

  --border: 210 15% 90%;
  --input: 210 15% 90%;
  --ring: 175 55% 35%;

  /* Shadows */
  --shadow-sm: 0 1px 3px hsl(210 20% 50% / 0.08);
  --shadow-md: 0 1px 3px hsl(210 20% 50% / 0.08), 0 4px 12px hsl(210 20% 50% / 0.04);
  --shadow-lg: 0 4px 12px hsl(210 20% 50% / 0.12), 0 8px 24px hsl(210 20% 50% / 0.06);
}
```
