import React from 'react';
import {random} from 'remotion';
import {C} from '../theme';

// Corrugated cardboard surface (CSS only): base tone, flute stripes, fibre noise, edge burn.
export const cardboardBg = (tone = C.carton, flutes = 14): React.CSSProperties => ({
  backgroundColor: tone,
  backgroundImage: [
    `radial-gradient(ellipse at 30% 20%, rgba(255,235,200,0.35), transparent 60%)`,
    `radial-gradient(ellipse at 80% 90%, rgba(60,30,10,0.35), transparent 55%)`,
    `repeating-linear-gradient(90deg, rgba(90,55,20,0.10) 0px, rgba(90,55,20,0.10) 2px, transparent 2px, transparent ${flutes}px)`,
    `repeating-linear-gradient(90deg, rgba(255,230,190,0.08) 0px, transparent 1px, transparent ${flutes * 0.5}px)`,
  ].join(','),
});

// Torn / cut edge polygon for a strip, deterministic per seed.
export const tornClip = (seed: string, jag = 1.6, steps = 28) => {
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    top.push(`${x}% ${random(`${seed}t${i}`) * jag * 2}%`);
    bot.push(`${100 - x}% ${100 - random(`${seed}b${i}`) * jag * 2}%`);
  }
  return `polygon(${[...top, ...bot].join(',')})`;
};

// A torn cardboard strip used under the lyrics.
export const CardStrip: React.FC<{seed: string; tone?: string; style?: React.CSSProperties; children?: React.ReactNode}> = ({seed, tone, style, children}) => (
  <div style={{position: 'relative', ...style}}>
    <div style={{position: 'absolute', inset: 0, ...cardboardBg(tone), clipPath: tornClip(seed, 4), filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.55))'}} />
    <div style={{position: 'absolute', inset: 0, clipPath: tornClip(seed, 4), boxShadow: 'inset 0 0 40px rgba(60,30,8,0.55)'}} />
    <div style={{position: 'relative'}}>{children}</div>
  </div>
);

// --- perspective mapping of a w×h box onto any 4-point quad (for writing on the blank placards) ---
type M3 = number[];
const adj = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];
const mul = (a: M3, b: M3): M3 => {
  const c: M3 = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let s = 0;
    for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
    c[3 * i + j] = s;
  }
  return c;
};
const mulV = (m: M3, v: number[]) => [0, 1, 2].map((i) => m[3 * i] * v[0] + m[3 * i + 1] * v[1] + m[3 * i + 2] * v[2]);
const basis = (p: number[][]): M3 => {
  const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1];
  const v = mulV(adj(m), [p[3][0], p[3][1], 1]);
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};
export const quadMatrix = (w: number, h: number, dst: number[][]) => {
  // dst order: TL, TR, BL, BR
  const src = [[0, 0], [w, 0], [0, h], [w, h]];
  const t = mul(basis(dst), adj(basis(src)));
  const n = t.map((x) => x / t[8]);
  return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, n[8]].join(',')})`;
};
