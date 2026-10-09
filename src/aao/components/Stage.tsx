import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, downbeatPulse, energyAt} from '../music';
import {SHOTS, shotAt, type Shot} from '../storyboard';
import {A, DISPLAY, SANS} from '../theme';

const prevShot = (s: Shot) => SHOTS[Math.max(0, SHOTS.indexOf(s) - 1)];

// Blurred, darkened copy of the current image fills the 9:16 frame behind the postcard.
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const s = shotAt(t);
  const p = prevShot(s);
  const k = interpolate(t - s.start, [0, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = 1.1 + Math.sin(t / 6) * 0.05;
  const down = downbeatPulse(t);
  return (
    <AbsoluteFill style={{background: A.night}}>
      {k < 1 && <Img src={staticFile(`aao/bg/${p.img}.jpg`)} style={{width: '100%', height: '100%', transform: `scale(${zoom})`}} />}
      <AbsoluteFill style={{opacity: k}}>
        <Img src={staticFile(`aao/bg/${s.img}.jpg`)} style={{width: '100%', height: '100%', transform: `scale(${zoom})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${A.night}cc 0%, ${A.plum}55 35%, ${A.night}dd 70%, ${A.night} 100%)`}} />
      {/* warm light leak sweeping on downbeats */}
      <div
        style={{
          position: 'absolute',
          left: -300 + ((t * 80) % 1600),
          top: 200,
          width: 900,
          height: 900,
          background: `radial-gradient(circle, ${A.orange}66 0%, transparent 65%)`,
          opacity: 0.4 + down * 0.5 * energyAt(t),
        }}
      />
    </AbsoluteFill>
  );
};

const CARD = {w: 1000, h: 834, x: 40, top: 300};

// Polaroid-style postcard with the current stop, slammed in on each cut.
export const Postcard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const s = shotAt(t);
  const localF = f - Math.round(s.start * fps);
  const side = s.index % 2 === 0 ? 1 : -1;
  const enter = spring({frame: localF, fps, config: {damping: 13, stiffness: 140}});
  const beat = beatPulse(t);
  const e = energyAt(t);
  const tilt = side * 2.5 + interpolate(enter, [0, 1], [side * 14, 0]);
  const x = interpolate(enter, [0, 1], [side * 700, 0]);
  const local = t - s.start;
  const zoom = 1.04 + local * 0.02;
  const flash = interpolate(localF, [0, 5], [0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.x,
        top: CARD.top,
        width: CARD.w,
        height: CARD.h,
        transform: `translateX(${x}px) rotate(${tilt}deg) scale(${1 + beat * 0.025 * (0.3 + e)})`,
        background: A.cream,
        padding: 16,
        borderRadius: 18,
        boxShadow: `0 40px 90px #000c, 0 0 60px ${A.orange}55`,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 8}}>
        <Img
          src={staticFile(`aao/${s.img}.jpg`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            transformOrigin: `${s.focus * 100}% 45%`,
            filter: 'saturate(1.12) contrast(1.05)',
          }}
        />
        <div style={{position: 'absolute', inset: 0, background: 'white', opacity: flash}} />
      </div>
      {s.img !== 'cover' && <Stamp key={s.index} label={s.label} flag={s.flag} localF={localF} n={s.index} />}
    </div>
  );
};

// Passport stamp with the country name, thumped onto the card corner.
const Stamp: React.FC<{label: string; flag: string; localF: number; n: number}> = ({label, flag, localF, n}) => {
  const {fps} = useVideoConfig();
  const k = spring({frame: localF - 7, fps, config: {damping: 9, stiffness: 260}});
  const rot = -10 + random(`r${n}`) * 8;
  return (
    <div
      style={{
        position: 'absolute',
        right: -20,
        bottom: -50,
        transform: `rotate(${rot}deg) scale(${interpolate(k, [0, 1], [2.4, 1])})`,
        opacity: Math.min(1, k * 1.5),
        border: `7px solid ${A.red}`,
        outline: `3px solid ${A.red}`,
        outlineOffset: 6,
        borderRadius: 18,
        padding: '10px 26px 6px',
        background: '#fff6e8ee',
        color: A.red,
        textAlign: 'center',
        fontFamily: DISPLAY,
        boxShadow: '0 10px 30px #0007',
      }}
    >
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: 6}}>WORLD TOUR · ESCALE {((n - 1) % 11) + 1}/11</div>
      <div style={{fontSize: 64, lineHeight: 1.05, letterSpacing: 2}}>
        {flag} {label}
      </div>
    </div>
  );
};

// Floating hibiscus and sparkles, faster when the song heats up.
export const Particles: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = energyAt(f / fps);
  const items = ['🌺', '✨', '🌴', '✨', '🌺', '💃', '✨', '🔥'];
  return (
    <>
      {new Array(16).fill(0).map((_, i) => {
        const sp = 1.5 + random(`v${i}`) * 3;
        const y = 1920 - ((f * sp * (0.6 + e) + random(`y${i}`) * 1920) % 2100);
        const x = random(`x${i}`) * 1000 + Math.sin(f / 30 + i) * 40;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, fontSize: 40 + random(`s${i}`) * 40, opacity: 0.55,
            transform: `rotate(${f * (i % 2 ? 1 : -1)}deg)`}}>
            {items[i % items.length]}
          </div>
        );
      })}
    </>
  );
};
