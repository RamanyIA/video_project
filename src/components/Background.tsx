import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';

const Blob: React.FC<{color: string; x: number; y: number; r: number; phase: number}> = ({color, x, y, r, phase}) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 90 + phase) * 120;
  const dy = Math.cos(f / 110 + phase) * 140;
  return (
    <div
      style={{
        position: 'absolute',
        left: x + dx - r,
        top: y + dy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: color,
        filter: 'blur(140px)',
        opacity: 0.55,
      }}
    />
  );
};

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const gridShift = (f * 1.2) % 80;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, ${C.bg2} 0%, ${C.bg} 70%)`}}>
      <Blob color={C.blue} x={150} y={400} r={380} phase={0} />
      <Blob color={C.red} x={950} y={1300} r={320} phase={2} />
      <Blob color={C.cyan} x={900} y={250} r={220} phase={4} />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.blue}22 2px, transparent 2px), linear-gradient(90deg, ${C.blue}22 2px, transparent 2px)`,
          backgroundSize: '80px 80px',
          backgroundPosition: `0 ${gridShift}px`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 60%, black 100%)',
          opacity: interpolate(Math.sin(f / 40), [-1, 1], [0.5, 0.9]),
        }}
      />
    </AbsoluteFill>
  );
};
