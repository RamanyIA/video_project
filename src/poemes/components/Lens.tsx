import React from 'react';
import {Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, downbeatPulse, energyAt} from '../music';
import type {Shot} from '../storyboard';
import {P} from '../theme';

const SRC = {w: 1536, h: 1024};
const FADE = 0.9; // seconds of cross-fade between shots

const ShotImg: React.FC<{shot: Shot; size: number; t: number; seed: number}> = ({shot, size, t, seed}) => {
  const {box} = shot;
  const s = size / Math.min(box.w, box.h);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const local = t - shot.start;
  const zoom = 1.05 + local * 0.012;
  const pan = Math.sin(local / 4 + seed) * 18;
  return (
    <Img
      src={staticFile(shot.src)}
      style={{
        position: 'absolute',
        left: size / 2 - cx * s + pan,
        top: size / 2 - cy * s,
        width: SRC.w * s,
        height: SRC.h * s,
        maxWidth: 'none',
        transform: `scale(${zoom})`,
        transformOrigin: `${cx * s}px ${cy * s}px`,
        // soft pastel grade so studio photos sit in the cover's palette
        filter: 'saturate(0.8) sepia(0.12) brightness(1.06) contrast(0.95)',
      }}
    />
  );
};

// Spiky powder splash drawn behind the porthole, like the cover art.
const Splash: React.FC<{r: number; color: string; seed: string; rot: number; scale: number; opacity: number}> = ({
  r, color, seed, rot, scale, opacity,
}) => {
  const n = 46;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const spike = i % 2 === 0 ? 1 + random(`${seed}${i}`) * 0.55 : 0.78 + random(`${seed}b${i}`) * 0.1;
    pts.push(`${Math.cos(a) * r * spike},${Math.sin(a) * r * spike}`);
  }
  const id = `g${seed}`;
  return (
    <svg
      width={r * 3.4}
      height={r * 3.4}
      viewBox={`${-r * 1.7} ${-r * 1.7} ${r * 3.4} ${r * 3.4}`}
      style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`, opacity}}
    >
      <defs>
        <radialGradient id={id}>
          <stop offset="45%" stopColor={color} stopOpacity={0.95} />
          <stop offset="80%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon points={pts.join(' ')} fill={`url(#${id})`} />
    </svg>
  );
};

export const Lens: React.FC<{shots: Shot[]; cx: number; cy: number; size: number; bloom: number}> = ({shots, cx, cy, size, bloom}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const e = energyAt(t);
  const beat = beatPulse(t);
  const down = downbeatPulse(t);

  let cur = 0;
  for (let i = 0; i < shots.length; i++) if (shots[i].start <= t) cur = i;
  const prev = cur > 0 ? shots[cur - 1] : null;
  const fadeIn = interpolate(t - shots[cur].start, [0, FADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const ring = size * 0.075;
  const pulse = 1 + beat * 0.015 * (0.4 + e) + down * 0.02 * bloom;
  const splashScale = 0.9 + bloom * (0.25 + e * 0.35) + down * 0.08 * bloom;

  return (
    <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size}}>
      <Splash r={size * 0.62} color={P.coral} seed="a" rot={f * 0.05} scale={splashScale} opacity={0.55 + bloom * 0.35} />
      <Splash r={size * 0.56} color={P.peach} seed="b" rot={-f * 0.04 + 20} scale={splashScale * 0.97} opacity={0.5 + bloom * 0.3} />
      <Splash r={size * 0.5} color={P.mint} seed="c" rot={f * 0.03 + 40} scale={splashScale * 0.95} opacity={0.35 + bloom * 0.35} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pulse})`}}>
        {/* metal ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from ${f * 0.3}deg, #9a98a2, #e9e7ee, #6b6973, #c9c7d0, #55535c, #dedce4, #9a98a2)`,
            boxShadow: '0 30px 60px #3d334666, inset 0 0 20px #0006',
          }}
        />
        {/* bolts */}
        {[0, 90, 180, 270].map((a) => (
          <div
            key={a}
            style={{
              position: 'absolute',
              left: size / 2 + Math.cos((a * Math.PI) / 180) * (size / 2 - ring / 2) - 7,
              top: size / 2 + Math.sin((a * Math.PI) / 180) * (size / 2 - ring / 2) - 7,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #fff, #555)',
            }}
          />
        ))}
        {/* glass with photos */}
        <div
          style={{
            position: 'absolute',
            inset: ring,
            borderRadius: '50%',
            overflow: 'hidden',
            background: P.mist,
            boxShadow: 'inset 0 0 40px #0008',
          }}
        >
          {prev && fadeIn < 1 && <ShotImg shot={prev} size={size - ring * 2} t={t} seed={cur - 1} />}
          <div style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
            <ShotImg shot={shots[cur]} size={size - ring * 2} t={t} seed={cur} />
          </div>
          {/* pastel tint + glass highlight */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${P.pink}40, transparent 45%, ${P.mint}40)`}} />
          <div
            style={{
              position: 'absolute',
              left: '12%',
              top: '6%',
              width: '55%',
              height: '30%',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #ffffff88, #ffffff00)',
              transform: 'rotate(-25deg)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
