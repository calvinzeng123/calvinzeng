// 00_core.js — math, easing, deterministic randomness, song timing. Everything here is pure.
// Canvas: 1920×1080 logical px, y down. Every frame is a pure function of song time t (frames render out of order).
'use strict';
const W = 1920, H = 1080, CX = W / 2, CY = H / 2, TAU = Math.PI * 2, DUR = 156.6, FPS = 24;

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));           // 0..1 progress of v through [a, b]
const seg = (t, a, b) => clamp((t - a) / (b - a));             // alias used in scenes
const frac = v => v - Math.floor(v);
const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

// ---------- easing (all take 0..1, clamp inside) ----------
const E = {
  lin: k => clamp(k),
  io: k => { k = clamp(k); return k * k * (3 - 2 * k); },                           // smoothstep
  io3: k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
  io5: k => { k = clamp(k); return k < .5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2; },
  out: k => { k = clamp(k); return 1 - (1 - k) ** 3; },
  out5: k => { k = clamp(k); return 1 - (1 - k) ** 5; },
  outExpo: k => { k = clamp(k); return k >= 1 ? 1 : 1 - Math.pow(2, -10 * k); },
  in: k => { k = clamp(k); return k * k * k; },
  inExpo: k => { k = clamp(k); return k <= 0 ? 0 : Math.pow(2, 10 * k - 10); },
  back: (k, s = 1.70158) => { k = clamp(k); const c = s + 1; return 1 + c * (k - 1) ** 3 + s * (k - 1) ** 2; },
  elastic: k => { k = clamp(k); if (k <= 0 || k >= 1) return k; return Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * TAU / 3) + 1; },
  // The product's signature motion: a soft-close drawer. Fast travel, then a long damped glide into place, no bounce.
  // Critically damped response: quick pull, peak speed at ~12% of the move, then a long glide into place with no bounce.
  soft: k => { k = clamp(k); return (1 - (1 + 8 * k) * Math.exp(-8 * k)) / (1 - 9 * Math.exp(-8)); },
};
// Damped spring response to a step at time 0 (value 0→1), for "settle" wobbles. z = damping ratio, f = Hz.
function spring(lt, f = 3, z = .35) {
  if (lt <= 0) return 0;
  const w = TAU * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * lt) * (Math.cos(wd * lt) + z * w / wd * Math.sin(wd * lt));
}

// ---------- deterministic randomness ----------
function hash(i) { let x = Math.sin(i * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
function hash2(i, j) { return hash(i * 57.13 + j * 131.7 + 7.3); }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash2(i, j), hash2(i + 1, j), ux), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), ux), uy) * 2 - 1;
}
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let k = 0; k < o; k++) { s += a * noise2(x * f, y * f); f *= 2.03; a *= .5; } return s; }

// ---------- global frame state ----------
// T = current song time; BOIL = hand-drawn "boil" frame (12 fps) used for all line jitter so linework shimmers like cel animation.
let T = 0, BOIL = 0;
function jit(seed, amp = 1) { return (hash(seed * 13.37 + BOIL * 7.77) * 2 - 1) * amp; }

// ---------- song timing (88 BPM; grid verified against the audio's onset flux) ----------
const BPM = 88, BEAT = 60 / BPM, BAR = BEAT * 4, OFFSET = 0.19;
const bp = t => (t - OFFSET) / BEAT;                  // beat position (float)
const beatN = t => Math.floor(bp(t));
const beatT = n => OFFSET + n * BEAT;                 // time of beat n
const barN = t => Math.floor(bp(t) / 4);
const snapBeat = t => beatT(Math.round(bp(t)));       // nearest beat time
// 1 on each beat, decaying; k = decay per beat (bigger = snappier)
const pulse = (t, k = 6) => Math.exp(-frac(bp(t)) * k);
const pulse8 = (t, k = 6) => Math.exp(-frac(bp(t) * 2) * k);
const pulseBar = (t, k = 4) => Math.exp(-frac(bp(t) / 4) * k * 4);
// age (s) since the most recent beat at or before t
const sinceBeat = t => frac(bp(t)) * BEAT;

// ---------- keyframes ----------
// kf(t, [[t0, v0], [t1, v1], …], ease?) → value (numbers or arrays). Holds ends.
function kf(t, keys, ez = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, va] = keys[i], [b, vb] = keys[i + 1];
    if (t < b) { const k = ez((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); }
  }
  return keys[keys.length - 1][1];
}

// ---------- colour ----------
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function mixCol(a, b, k) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)); }
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${clamp(a)})`; }
