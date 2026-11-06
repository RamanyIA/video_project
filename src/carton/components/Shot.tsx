import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type Move = {s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number; r0?: number; r1?: number};

const ease = (p: number) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, p))) / 2;

// One storyboard photo with a slow camera move (Ken Burns), optional colour grade.
export const Photo: React.FC<{img: string; p: number; move?: Move; grade?: string; children?: React.ReactNode}> = ({img, p, move = {}, grade, children}) => {
  const k = ease(p);
  const s = interpolate(k, [0, 1], [move.s0 ?? 1.06, move.s1 ?? 1.16]);
  const x = interpolate(k, [0, 1], [move.x0 ?? 0, move.x1 ?? 0]);
  const y = interpolate(k, [0, 1], [move.y0 ?? 0, move.y1 ?? 0]);
  const r = interpolate(k, [0, 1], [move.r0 ?? 0, move.r1 ?? 0]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${s}) translate(${x}%, ${y}%) rotate(${r}deg)`}}>
        <Img src={staticFile(`carton/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: grade}} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 35mm grain + warm vignette + gate weave, drawn on top of everything.
export const FilmLook: React.FC<{vignette?: number}> = ({vignette = 0.55}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const seed = f % 8;
  const ox = Math.round(random(`gx${f}`) * 200);
  const oy = Math.round(random(`gy${f}`) * 200);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(25,10,0,${vignette}) 100%)`}} />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: 0.13, mixBlendMode: 'overlay'}}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect x={-ox} y={-oy} width={width + 200} height={height + 200} filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
