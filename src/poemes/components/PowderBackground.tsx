import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {energyAt} from '../music';
import {P} from '../theme';

const CLOUDS = [
  {c: P.pink, x: 200, y: 380, r: 520, sp: 0.7},
  {c: P.mint, x: 900, y: 650, r: 460, sp: 0.9},
  {c: P.peach, x: 760, y: 1250, r: 500, sp: 0.6},
  {c: P.lilac, x: 180, y: 1500, r: 480, sp: 0.8},
  {c: P.pink, x: 600, y: 1850, r: 420, sp: 1.1},
];

// Misty pastel backdrop with slowly drifting powder clouds; they swell with the music.
export const PowderBackground: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = energyAt(f / fps);
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${P.mist} 0%, ${P.mist2} 100%)`}}>
      {CLOUDS.map((cl, i) => {
        const dx = Math.sin(f / (120 / cl.sp) + i * 1.7) * 140;
        const dy = Math.cos(f / (150 / cl.sp) + i) * 160;
        const r = cl.r * (0.85 + e * 0.4);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cl.x + dx - r,
              top: cl.y + dy - r,
              width: r * 2,
              height: r * 2,
              background: `radial-gradient(circle, ${cl.c}cc 0%, ${cl.c}55 35%, transparent 68%)`,
            }}
          />
        );
      })}
      <Dust />
      {/* paper grain */}
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.6%27/></svg>")',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};

const DUST = new Array(70).fill(0).map((_, i) => ({
  x: random(`x${i}`) * 1080,
  y: random(`y${i}`) * 1920,
  s: 3 + random(`s${i}`) * 9,
  v: 0.3 + random(`v${i}`) * 1.2,
  c: [P.rose, P.coral, P.mint, P.peach, '#ffffff'][i % 5],
}));

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = energyAt(f / fps);
  return (
    <>
      {DUST.map((d, i) => {
        const y = (d.y - f * d.v * (0.6 + e)) % 1920;
        const x = d.x + Math.sin(f / 50 + i) * 30;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y < 0 ? y + 1920 : y,
              width: d.s,
              height: d.s,
              borderRadius: '50%',
              background: d.c,
              opacity: 0.35 + e * 0.5,
            }}
          />
        );
      })}
    </>
  );
};
