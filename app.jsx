/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Design tokens ----------
const T = {
  ink: '#15202b',
  inkSoft: '#3d4b5c',
  inkMute: '#6b7889',
  line: '#e6e2d8',
  lineSoft: '#efece4',
  paper: '#faf8f3',
  paperWarm: '#f3efe4',
  card: '#ffffff',
  primary: '#0f2847',      // deep navy
  accent: '#2563eb',       // interactive blue
  // phase accents (original, distinct hues)
  p1: '#0f2847',           // navy
  p2: '#2563eb',           // blue
  p3: '#c2582a',           // burnt orange
  p4: '#6b5cc7',           // muted violet
  p5: '#2d6a4f',           // deep green
  // status
  s0Bg: '#f1ede2', s0Fg: '#6b7889',
  s1Bg: '#e6edff', s1Fg: '#2563eb',
  s2Bg: '#fbf1d6', s2Fg: '#8a6a12',
  s3Bg: '#e6ecf5', s3Fg: '#0f2847',
  s4Bg: '#e1efe4', s4Fg: '#2d6a4f',
};

const PHASE_COLORS = { orientation: T.p1, product: T.p2, process: T.p3, mentor: T.p4, practical: T.p5 };

// ---------- Status system ----------
const STATUSES = [
  { id: 'not_started', label: 'Not Started', dot: '○', weight: 0.00, bg: T.s0Bg, fg: T.s0Fg },
  { id: 'in_progress', label: 'In Progress', dot: '◔', weight: 0.15, bg: T.s1Bg, fg: T.s1Fg },
  { id: 'training',    label: 'Training Complete', dot: '◑', weight: 0.33, bg: T.s2Bg, fg: T.s2Fg },
  { id: 'practice',    label: 'Practice Complete', dot: '◕', weight: 0.67, bg: T.s3Bg, fg: T.s3Fg },
  { id: 'assessment',  label: 'Assessment Complete', dot: '●', weight: 1.00, bg: T.s4Bg, fg: T.s4Fg },
];
const STATUS_BY_ID = Object.fromEntries(STATUSES.map(s => [s.id, s]));

Object.assign(window, { T, PHASE_COLORS, STATUSES, STATUS_BY_ID });
