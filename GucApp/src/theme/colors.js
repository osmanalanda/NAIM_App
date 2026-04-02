/**
 * NAIM Diet Planner — Design System
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// NAIM Iteration 1 — Glassmorphism dark design system — 10kg

export const C = {
  // ── Backgrounds ──────────────────────────────────────────────
  bg:        '#07071A',   // midnight canvas
  bgDeep:    '#040411',   // true black-blue
  bgCard:    'rgba(255, 255, 255, 0.055)',
  bgCardHi:  'rgba(255, 255, 255, 0.10)',
  bgOverlay: 'rgba(7, 7, 26, 0.85)',

  // ── Glass borders ─────────────────────────────────────────────
  border:    'rgba(255, 255, 255, 0.10)',
  borderHi:  'rgba(255, 255, 255, 0.20)',

  // ── Accents (vibrant) ─────────────────────────────────────────
  mint:      '#4FFFB0',   // primary — health/vitality
  mintDim:   'rgba(79, 255, 176, 0.18)',
  mintGlow:  'rgba(79, 255, 176, 0.35)',

  coral:     '#FF6B9D',   // energy / calories
  coralDim:  'rgba(255, 107, 157, 0.18)',

  purple:    '#8B5CF6',   // NAIM brand / iteration
  purpleDim: 'rgba(139, 92, 246, 0.18)',
  purpleGlow:'rgba(139, 92, 246, 0.40)',

  amber:     '#FFC857',   // warnings / macros
  amberDim:  'rgba(255, 200, 87, 0.18)',

  sky:       '#38BDF8',   // water / info
  skyDim:    'rgba(56, 189, 248, 0.18)',

  // ── Text ──────────────────────────────────────────────────────
  text:      '#F1F5F9',
  textSub:   'rgba(241, 245, 249, 0.65)',
  textFaint: 'rgba(241, 245, 249, 0.35)',
  textInv:   '#07071A',

  // ── Semantic ──────────────────────────────────────────────────
  success:   '#34D399',
  error:     '#F87171',
  warn:      '#FCD34D',
};

export const FONT = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 26,
  hero:34,
  mega:48,
};

export const RADIUS = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
};

export const SPACE = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  36,
  xxl: 56,
};

// Glassmorphism card preset
export const glassCard = {
  backgroundColor: C.bgCard,
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: RADIUS.lg,
};

// Vibrant shadow preset
export const mintShadow = {
  shadowColor: C.mint,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
};

export const purpleShadow = {
  shadowColor: C.purple,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 16,
  elevation: 10,
};
