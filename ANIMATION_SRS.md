# 🎬 GigHive — Framer Motion Animation SRS

**Software Requirements Specification**  
Smooth, production-grade animations across all GigHive components using **Framer Motion v11**.

---

## 1. Goals

- Make every screen transition, card reveal, and interaction feel **premium and alive**
- Follow a single shared **animation token system** — consistent timing, easing, delay stagger
- **Respect `prefers-reduced-motion`** — all animations are skipped for accessibility
- Zero jank — all animations use GPU-accelerated properties (`opacity`, `transform`)
- Keep bundle impact minimal — use tree-shaking from `framer-motion`

---

## 2. Animation Token System

All components import from a shared `src/lib/animations.js` file:

```js
// src/lib/animations.js

export const EASING = {
  smooth:   [0.25, 0.1, 0.25, 1],    // standard ease
  spring:   { type: 'spring', stiffness: 300, damping: 30 },
  bounce:   { type: 'spring', stiffness: 400, damping: 20 },
  snappy:   [0.4, 0, 0.2, 1],        // material design standard
};

export const DURATION = {
  fast:   0.15,
  normal: 0.3,
  slow:   0.5,
};

// Page/route transition
export const pageVariants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASING.smooth } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// Card reveal (used in lists)
export const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASING.smooth }
  }),
};

// Slide in from left (sidebars)
export const slideInLeft = {
  initial:  { x: -40, opacity: 0 },
  animate:  { x: 0,   opacity: 1, transition: { duration: 0.3, ease: EASING.snappy } },
};

// Fade up (sections, headings)
export const fadeUp = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: DURATION.normal } },
};

// Fade in (simple, no movement)
export const fadeIn = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: DURATION.fast } },
};

// Modal/dialog overlay
export const overlayVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1,  transition: { duration: 0.2 } },
  exit:     { opacity: 0,  transition: { duration: 0.15 } },
};

// Modal/dialog panel
export const modalVariants = {
  initial:  { opacity: 0, scale: 0.95, y: 20 },
  animate:  { opacity: 1, scale: 1,    y: 0, transition: EASING.spring },
  exit:     { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

// Badge/chip pop-in
export const popIn = {
  initial:  { scale: 0, opacity: 0 },
  animate:  { scale: 1, opacity: 1, transition: EASING.bounce },
};

// List stagger container
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};
```

---

## 3. Component Animation Map

### 3.1 Public Pages

| Component | Animation Applied |
|-----------|------------------|
| `Home.jsx` | Hero: `fadeUp` on headline + button; Stats: staggered `cardVariants`; Sections: `fadeUp` on scroll (`whileInView`) |
| `HowItWorks.jsx` | Steps: staggered slide-in; Number badges: `popIn` |
| `ForStudents.jsx` | Section headings: `fadeUp`; feature cards: staggered `cardVariants` |
| `ForEmployers.jsx` | Same pattern as ForStudents |
| `AboutUs.jsx` | Hero: `fadeUp`; team cards: staggered grid |
| `PopularGigs.jsx` | Grid cards: staggered `cardVariants`; hover: `whileHover` lift |

### 3.2 Auth

| Component | Animation Applied |
|-----------|------------------|
| `Login.jsx` | Container: `fadeUp`; fields: staggered `fadeIn`; error message: `fadeIn` with shake on error |
| `Signup.jsx` | Same; step transition: horizontal slide (`x: 0 → -30 → 0`) between steps |

### 3.3 Dashboards & Sidebars

| Component | Animation Applied |
|-----------|------------------|
| `StudentSidebar.jsx` | `slideInLeft` on mount; nav items: staggered `fadeIn`; collapse: `width` spring animation |
| `EmployerSidebar.jsx` | Same as StudentSidebar |
| `student/Dashboard.jsx` | Stat cards: staggered `cardVariants`; chart area: `fadeUp` |
| `employer/Dashboard.jsx` | Same pattern |

### 3.4 Student Features

| Component | Animation Applied |
|-----------|------------------|
| `FindGigs.jsx` | Gig cards: staggered `cardVariants` on load; modal: `modalVariants` + backdrop `overlayVariants`; filter pills: `popIn` staggered |
| `Messages.jsx` | Conversation list items: staggered `fadeIn`; message bubbles: `fadeIn` + slight `y` slide-in from bottom; typing indicator: bouncing dots |
| `Credits.jsx` | Credit bar: animated width progress; number: animated count-up |
| `Profile.jsx` | Avatar: `popIn`; sections: `fadeUp` |
| `Collaboration.jsx` | Cards: staggered `cardVariants` |
| `CollegeGigs.jsx` | Cards: staggered `cardVariants` |
| `Settings.jsx` | Sections: staggered `fadeUp` |
| `GigReels.jsx` | Reel card: `slideInLeft` |

### 3.5 Employer Features

| Component | Animation Applied |
|-----------|------------------|
| `Applications.jsx` | Application cards: staggered `cardVariants`; status badge: `popIn` on status change |
| `employer/Messages.jsx` | Same as student Messages |
| `PostGig.jsx` | Form steps: horizontal slide; success state: `popIn` |
| `Plans.jsx` | Pricing cards: staggered `cardVariants`; recommended badge: `popIn` |

---

## 4. Route Transition (Global)

Wrap `<Routes>` in `<AnimatePresence mode="wait">` in `App.jsx`.  
Each page/dashboard route component wraps its root element in `<motion.div>` with `pageVariants`.

```jsx
// App.jsx pattern
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    ...
  </Routes>
</AnimatePresence>
```

---

## 5. Interaction Animations (Hover / Tap)

All interactive card elements get:

```jsx
<motion.div
  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
  whileTap={{ scale: 0.98 }}
  transition={EASING.spring}
>
```

All primary buttons get:

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
>
```

---

## 6. Scroll-Triggered Animations

Used on all public pages (Home, ForStudents, ForEmployers, etc.):

```jsx
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={cardVariants}
>
```

`once: true` ensures the animation only fires on first appearance (standard UX pattern).

---

## 7. Specific Special Effects

| Effect | Where | Detail |
|--------|-------|--------|
| **Count-up numbers** | Home stats, Credits page | `animate={{ count: targetValue }}` with number display |
| **Shake on error** | Login, Signup forms | `x: [0, -8, 8, -6, 6, 0]` keyframe animation |
| **Typing dots bounce** | Messages typing indicator | Already in CSS; enhance with Framer `animate` loop |
| **Sidebar collapse** | Student/EmployerSidebar | `motion.div` with `animate={{ width: collapsed ? 64 : 240 }}` spring |
| **Unread badge pop** | Sidebar Messages badge | `popIn` when count changes from 0 → N |
| **New message slide-in** | Chat window | `slideInLeft` variant on new message bubbles |
| **Modal open/close** | FindGigs, all dialogs | `modalVariants` + `overlayVariants` with `AnimatePresence` |

---

## 8. Accessibility

```js
// All animations respect reduced-motion preference
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In animation tokens:
export const cardVariants = {
  hidden:  { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
  visible: { opacity: 1, y: 0 },
};
```

Framer Motion also has built-in `useReducedMotion()` hook — used in shared animation utilities.

---

## 9. Implementation Order

| Phase | Components | Priority |
|-------|-----------|---------|
| **P0 — Core infrastructure** | `src/lib/animations.js`, `App.jsx` route transitions | Install + baseline |
| **P1 — Public pages** | `Home`, `HowItWorks`, `ForStudents`, `ForEmployers`, `AboutUs`, `PopularGigs` | Visual WOW on first visit |
| **P2 — Auth** | `Login`, `Signup` | Smooth entry feel |
| **P3 — Sidebars** | `StudentSidebar`, `EmployerSidebar` | Sidebar collapse spring |
| **P4 — Dashboards** | `student/Dashboard`, `employer/Dashboard` | Stat card reveals |
| **P5 — Find Gigs** | `FindGigs` — cards + modal | High-traffic screen |
| **P6 — Messaging** | `student/Messages`, `employer/Messages` | Bubble animations |
| **P7 — Remaining** | `Applications`, `PostGig`, `Plans`, `Credits`, `Profile`, `Settings` | Complete coverage |

---

## 10. Files to Create / Modify

### New Files

| File | Purpose |
|------|---------|
| `src/lib/animations.js` | Shared animation variant tokens |

### Modified Files (26 total)

| File | Change |
|------|--------|
| `src/App.jsx` | Add `AnimatePresence` + `useLocation` for route transitions |
| `src/components/pages/Home.jsx` | `fadeUp` hero, `whileInView` stagger on all sections |
| `src/components/pages/HowItWorks.jsx` | Step stagger, number badge `popIn` |
| `src/components/pages/ForStudents.jsx` | Feature cards stagger |
| `src/components/pages/ForEmployers.jsx` | Feature cards stagger |
| `src/components/pages/AboutUs.jsx` | Hero `fadeUp`, team stagger |
| `src/components/pages/PopularGigs.jsx` | Card grid stagger + hover lift |
| `src/components/auth/Login.jsx` | Container `fadeUp`, error shake |
| `src/components/auth/Signup.jsx` | Container `fadeUp`, step slide |
| `src/components/student/StudentSidebar.jsx` | `slideInLeft`, collapse spring |
| `src/components/employer/EmployerSidebar.jsx` | Same |
| `src/components/dashboards/StudentDashboard.jsx` | `pageVariants` |
| `src/components/dashboards/EmployerDashboard.jsx` | `pageVariants` |
| `src/components/student/Dashboard.jsx` | Stat card stagger |
| `src/components/employer/Dashboard.jsx` | Stat card stagger |
| `src/components/student/FindGigs.jsx` | Card stagger, modal variants |
| `src/components/student/Messages.jsx` | Message bubble `fadeIn` |
| `src/components/employer/Messages.jsx` | Same |
| `src/components/employer/Applications.jsx` | Card stagger, badge `popIn` |
| `src/components/employer/PostGig.jsx` | Form step slide |
| `src/components/employer/Plans.jsx` | Pricing card stagger |
| `src/components/student/Credits.jsx` | Progress bar animate |
| `src/components/student/Profile.jsx` | Avatar `popIn`, sections `fadeUp` |
| `src/components/student/Settings.jsx` | Section stagger |
| `src/components/student/Collaboration.jsx` | Card stagger |
| `src/components/student/CollegeGigs.jsx` | Card stagger |
