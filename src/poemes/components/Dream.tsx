import React from 'react';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatIndexAt, beatPulse, music} from '../music';
import {DREAMS} from '../storyboard';
import {P, SERIF} from '../theme';

type Dancer =
  | {kind: 'woman'; color: string; hair: string}
  | {kind: 'man'; color: string}
  | {kind: 'animal'; emoji: string};

// The dream crowd: lots of women, a few men, animals — everyone dancing with him.
const CROWD: Dancer[] = [
  {kind: 'woman', color: P.rose, hair: '#5a3a3a'},
  {kind: 'animal', emoji: '🦒'},
  {kind: 'woman', color: P.lilac, hair: '#2f2433'},
  {kind: 'man', color: P.steel},
  {kind: 'woman', color: P.coral, hair: '#8a5a2b'},
  {kind: 'animal', emoji: '🐘'},
  {kind: 'woman', color: '#7fc8b4', hair: '#2f2433'},
  {kind: 'animal', emoji: '🦩'},
  {kind: 'woman', color: P.peach, hair: '#4a3020'},
  {kind: 'man', color: '#8b7fb0'},
  {kind: 'woman', color: '#d97aa6', hair: '#1f1a24'},
  {kind: 'animal', emoji: '🐼'},
  {kind: 'woman', color: '#b9a3e3', hair: '#6b4226'},
  {kind: 'animal', emoji: '🦊'},
  {kind: 'woman', color: P.rose, hair: '#2a1d1d'},
  {kind: 'animal', emoji: '🐧'},
];

// Simple vector dancers; arms/legs swing on the beat phase.
const Woman: React.FC<{color: string; hair: string; ph: number; h: number}> = ({color, hair, ph, h}) => {
  const a1 = -40 + Math.sin(ph) * 50;
  const a2 = 220 + Math.cos(ph) * 50;
  const sway = Math.sin(ph) * 10;
  return (
    <svg width={h * 0.6} height={h} viewBox="0 0 60 100" style={{overflow: 'visible'}}>
      <g transform={`rotate(${sway} 30 60)`}>
        <path d="M30 4 C 18 4 16 22 22 26 L 38 26 C 44 22 42 4 30 4 Z" fill={hair} />
        <circle cx={30} cy={13} r={8} fill="#c98f6b" />
        <line x1={30} y1={30} x2={30 + 22 * Math.cos((a1 * Math.PI) / 180)} y2={30 + 22 * Math.sin((a1 * Math.PI) / 180)}
          stroke="#c98f6b" strokeWidth={4} strokeLinecap="round" />
        <line x1={30} y1={30} x2={30 + 22 * Math.cos((a2 * Math.PI) / 180)} y2={30 + 22 * Math.sin((a2 * Math.PI) / 180)}
          stroke="#c98f6b" strokeWidth={4} strokeLinecap="round" />
        <path d={`M24 24 L36 24 L${50 + sway} 74 L${10 + sway} 74 Z`} fill={color} />
        <line x1={24} y1={74} x2={22 - sway / 2} y2={96} stroke="#c98f6b" strokeWidth={4} strokeLinecap="round" />
        <line x1={36} y1={74} x2={38 - sway / 2} y2={96} stroke="#c98f6b" strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  );
};

const Man: React.FC<{color: string; ph: number; h: number}> = ({color, ph, h}) => {
  const a1 = -60 + Math.sin(ph + 1) * 45;
  const a2 = 240 + Math.cos(ph + 1) * 45;
  const k = Math.sin(ph) * 14;
  return (
    <svg width={h * 0.6} height={h} viewBox="0 0 60 100" style={{overflow: 'visible'}}>
      <circle cx={30} cy={12} r={9} fill="#a8775a" />
      <line x1={30} y1={30} x2={30 + 24 * Math.cos((a1 * Math.PI) / 180)} y2={30 + 24 * Math.sin((a1 * Math.PI) / 180)}
        stroke={color} strokeWidth={6} strokeLinecap="round" />
      <line x1={30} y1={30} x2={30 + 24 * Math.cos((a2 * Math.PI) / 180)} y2={30 + 24 * Math.sin((a2 * Math.PI) / 180)}
        stroke={color} strokeWidth={6} strokeLinecap="round" />
      <rect x={20} y={23} width={20} height={34} rx={8} fill={color} />
      <line x1={25} y1={56} x2={18 + k} y2={96} stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
      <line x1={35} y1={56} x2={42 - k} y2={96} stroke={P.ink} strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
};

const dreamAt = (t: number) => DREAMS.find((d) => t >= d.start - 0.1 && t < d.end + 2);

// Ring of dancers circling the porthole like a dance floor, on the beat.
export const DreamDancers: React.FC<{cx: number; cy: number; layer: 'back' | 'front'}> = ({cx, cy, layer}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const d = dreamAt(t);
  if (!d) return null;
  const enter = interpolate(t, [d.start, d.start + 2.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vanish = interpolate(t, [d.end - 0.2, d.end + 1.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bi = beatIndexAt(t);
  const b0 = music.beats[Math.max(0, bi)] ?? 0;
  const b1 = music.beats[bi + 1] ?? b0 + 0.65;
  const phase = (bi + Math.min(1, (t - b0) / (b1 - b0))) * Math.PI; // half a swing per beat
  const pulse = beatPulse(t);
  const rot = (t - d.start) * 0.35;
  const n = CROWD.length;
  return (
    <>
      {CROWD.map((c, i) => {
        const ang = (i / n) * Math.PI * 2 + rot;
        const depth = Math.sin(ang); // >0 = in front of the porthole
        if ((layer === 'front') !== depth > 0) return null;
        const x = cx + Math.cos(ang) * 490;
        const y = cy + 300 + depth * 150;
        const scale = (0.7 + (depth + 1) * 0.25) * enter;
        const h = 290;
        const hop = Math.abs(Math.sin(phase + i)) * 22 + pulse * 10;
        const dust = 1 - vanish;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - (h * 0.6) / 2,
              top: y - h - hop - dust * 160 - random(`d${i}`) * dust * 120,
              transform: `scale(${scale * (1 - dust * 0.5)}) rotate(${c.kind === 'animal' ? Math.sin(phase + i) * 12 : 0}deg)`,
              opacity: enter * vanish * (0.75 + depth * 0.25),
              filter: depth < 0 ? 'saturate(0.7)' : undefined,
            }}
          >
            {c.kind === 'woman' && <Woman color={c.color} hair={c.hair} ph={phase + i * 0.7} h={h} />}
            {c.kind === 'man' && <Man color={c.color} ph={phase + i * 0.7} h={h} />}
            {c.kind === 'animal' && <div style={{fontSize: 160, lineHeight: 1, marginTop: 90}}>{c.emoji}</div>}
          </div>
        );
      })}
    </>
  );
};

// Dreamy overlay while dreaming (stars, moon), cold "alone" tint on waking + caption.
export const DreamMood: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const d = DREAMS.find((x) => t >= x.start - 0.1 && t < x.end + 8);
  if (!d) return null;
  const dreaming = interpolate(t, [d.start, d.start + 2, d.end - 0.3, d.end + 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const alone = interpolate(t, [d.end, d.end + 1, d.end + 5.5, d.end + 8], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      {dreaming > 0 &&
        new Array(26).fill(0).map((_, i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / 12 + i * 1.9));
          return (
            <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1040, top: 180 + random(`sy${i}`) * 1100,
              fontSize: 18 + random(`ss${i}`) * 26, color: '#fff', opacity: dreaming * tw, textShadow: `0 0 14px ${P.pink}`}}>
              ✦
            </div>
          );
        })}
      {dreaming > 0 && (
        <div style={{position: 'absolute', right: 80, top: 190, fontSize: 90, opacity: dreaming * 0.85, color: '#fff7e0',
          textShadow: '0 0 40px #fff3c4'}}>
          ☾
        </div>
      )}
      {alone > 0 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: '#5d6b8a', mixBlendMode: 'multiply', opacity: alone * 0.28}} />
          <div style={{position: 'absolute', top: 205, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 50, color: P.ink, opacity: alone, letterSpacing: interpolate(alone, [0, 1], [8, 1])}}>
            … ce n'était qu'un rêve
          </div>
        </>
      )}
    </>
  );
};
