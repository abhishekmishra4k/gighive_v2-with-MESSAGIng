/**
 * 🎬 GigHive — Shared Animation Tokens
 * All Framer Motion variants used across the app live here.
 * Components import from this file to keep animations consistent.
 */

// ─── Easing presets ───────────────────────────────────────────
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 20 },
  gentle: { type: 'spring', stiffness: 180, damping: 28 },
};

// ─── Duration presets ─────────────────────────────────────────
export const DURATION = {
  fast:   0.15,
  normal: 0.3,
  slow:   0.5,
};

// ─── Page / Route transition ──────────────────────────────────
export const pageVariants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASING.smooth } },
  exit:     { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

// ─── Stagger list container ───────────────────────────────────
export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ─── Card / item reveal (stagger child) ──────────────────────
export const cardVariants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: EASING.smooth },
  },
};

// ─── Fade up (section headings, hero text) ────────────────────
export const fadeUp = {
  hidden:   { opacity: 0, y: 22 },
  visible:  { opacity: 1, y: 0,  transition: { duration: DURATION.normal, ease: EASING.smooth } },
  // aliases for whileInView usage
  initial:  { opacity: 0, y: 22 },
  animate:  { opacity: 1, y: 0,  transition: { duration: DURATION.normal, ease: EASING.smooth } },
};

// ─── Fade in (no movement) ────────────────────────────────────
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.fast } },
};

// ─── Slide in from left (sidebars, drawers) ──────────────────
export const slideInLeft = {
  initial:  { x: -48, opacity: 0 },
  animate:  { x: 0,    opacity: 1, transition: { duration: 0.32, ease: EASING.snappy } },
};

// ─── Slide in from right ─────────────────────────────────────
export const slideInRight = {
  initial:  { x: 48,  opacity: 0 },
  animate:  { x: 0,   opacity: 1, transition: { duration: 0.32, ease: EASING.snappy } },
};

// ─── Slide in from bottom (message bubbles, toasts) ──────────
export const slideUp = {
  initial:  { y: 16,  opacity: 0 },
  animate:  { y: 0,   opacity: 1, transition: { duration: 0.22, ease: EASING.smooth } },
};

// ─── Pop in (badges, avatars, notifications) ─────────────────
export const popIn = {
  initial:  { scale: 0, opacity: 0 },
  animate:  { scale: 1, opacity: 1, transition: EASING.bounce },
  exit:     { scale: 0, opacity: 0, transition: { duration: 0.12 } },
};

// ─── Modal / dialog panel ────────────────────────────────────
export const modalVariants = {
  initial:  { opacity: 0, scale: 0.94, y: 24 },
  animate:  { opacity: 1, scale: 1,    y: 0,  transition: EASING.spring },
  exit:     { opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.18 } },
};

// ─── Modal backdrop / overlay ────────────────────────────────
export const overlayVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.2 } },
  exit:     { opacity: 0, transition: { duration: 0.18 } },
};

// ─── Error shake (form validation) ───────────────────────────
export const shakeVariants = {
  initial:  { x: 0 },
  shake:    {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

// ─── Hover / tap micro-interactions ──────────────────────────
export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' },
  whileTap:   { scale: 0.98 },
  transition: EASING.spring,
};

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap:   { scale: 0.97 },
  transition: EASING.bounce,
};

// ─── Viewport defaults (used with whileInView) ───────────────
export const viewport = { once: true, amount: 0.15 };
