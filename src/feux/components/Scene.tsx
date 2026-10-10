import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, downbeatPulse, energyAt} from '../music';
import {F} from '../theme';

const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, t: f / fps, fps};
};

export const HORIZON = 660;
const VP = 540; // vanishing point x

// Dark foundry backdrop: blurred cover + molten horizon glow that breathes with the music.
export const Backdrop: React.FC = () => {
  const {t} = useT();
  const e = energyAt(t);
  const d = downbeatPulse(t);
  return (
    <AbsoluteFill style={{background: F.black}}>
      <Img src={staticFile('feux/bg.jpg')} style={{width: '100%', height: '100%', opacity: 0.55, transform: `scale(${1.05 + e * 0.05})`}} />
      <div style={{position: 'absolute', left: -200, right: -200, top: HORIZON - 420, height: 700,
        background: `radial-gradient(ellipse at 50% 60%, ${F.molten}${Math.round((0.35 + e * 0.4 + d * 0.2) * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${F.black}ee 0%, transparent 25%, transparent 60%, ${F.black}f0 100%)`}} />
    </AbsoluteFill>
  );
};

// Perspective road with dashes rushing towards the camera; speed follows the energy.
export const Road: React.FC = () => {
  const {f, t} = useT();
  const e = energyAt(t);
  const H = 1920 - HORIZON;
  const speed = 0.02 + e * 0.05;
  const dashes = new Array(9).fill(0).map((_, i) => {
    const z = ((i / 9 + f * speed) % 1); // 0 far .. 1 near
    const p = z * z;
    const y = HORIZON + p * H;
    const w = 4 + p * 26;
    const h = 6 + p * 90;
    return <div key={i} style={{position: 'absolute', left: VP - w / 2, top: y, width: w, height: h, background: F.fire, opacity: 0.85,
      boxShadow: `0 0 ${10 + p * 20}px ${F.molten}`}} />;
  });
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15161b" />
            <stop offset="100%" stopColor="#2a2b31" />
          </linearGradient>
        </defs>
        <rect x={0} y={HORIZON} width={1080} height={1920 - HORIZON} fill="url(#road)" />
        {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={VP + k * 12} y1={HORIZON} x2={VP + k * 420} y2={1920} stroke={Math.abs(k) === 2 ? F.molten : '#ffffff18'}
            strokeWidth={Math.abs(k) === 2 ? 7 : 2} />
        ))}
        {new Array(8).fill(0).map((_, i) => {
          const z = (i / 8 + f * speed * 0.5) % 1;
          const y = HORIZON + z * z * (1920 - HORIZON);
          return <line key={`h${i}`} x1={0} y1={y} x2={1080} y2={y} stroke="#ffffff14" strokeWidth={1 + z * 3} />;
        })}
      </svg>
      {dashes}
    </>
  );
};

// Original side-view chopper + rider, spinning wheels, exhaust flame.
export const Bike: React.FC<{color: string; spin: number; flame: number; lean: number}> = ({color, spin, flame, lean}) => (
  <svg width={420} height={260} viewBox="0 0 420 260" style={{overflow: 'visible', transform: `rotate(${lean}deg)`, transformOrigin: '80% 90%'}}>
    {/* exhaust flame */}
    <path d={`M70 190 L${10 - flame * 90} ${175 + Math.sin(spin) * 6} L${20 - flame * 60} 190 L${-flame * 110} ${205 - Math.cos(spin) * 6} Z`}
      fill={F.fire} opacity={0.9} style={{filter: `drop-shadow(0 0 12px ${F.molten})`}} />
    {[90, 330].map((cx) => (
      <g key={cx} transform={`translate(${cx} 200)`}>
        <circle r={56} fill="#0c0c10" stroke="#3a3c44" strokeWidth={12} />
        <circle r={36} fill="none" stroke={F.chrome} strokeWidth={3} opacity={0.7} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={0} y1={0} x2={Math.cos(spin + (k * Math.PI) / 3) * 36} y2={Math.sin(spin + (k * Math.PI) / 3) * 36}
            stroke={F.chrome} strokeWidth={3} />
        ))}
        <circle r={8} fill={F.chrome} />
      </g>
    ))}
    {/* frame, tank, exhaust, fork */}
    <path d="M90 200 L170 150 L280 150 L330 200" stroke={F.chrome} strokeWidth={9} fill="none" strokeLinejoin="round" />
    <line x1={300} y1={95} x2={335} y2={200} stroke={F.chrome} strokeWidth={9} />
    <path d="M70 188 L200 188" stroke="#8a8f99" strokeWidth={14} strokeLinecap="round" />
    <path d="M190 150 C 200 115, 270 110, 290 140 L 280 152 Z" fill={color} stroke="#000" strokeWidth={3} />
    <rect x={130} y={138} width={70} height={18} rx={8} fill="#111" />
    <line x1={290} y1={92} x2={318} y2={84} stroke={F.chrome} strokeWidth={7} strokeLinecap="round" />
    <circle cx={330} cy={118} r={11} fill={F.white} style={{filter: `drop-shadow(0 0 16px ${F.fire})`}} />
    {/* rider */}
    <path d="M150 140 L175 80 L235 70 L262 90 L250 104 L215 98 L200 140 Z" fill="#141418" />
    <path d="M200 140 L240 180 L262 180" stroke="#141418" strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M235 80 L292 92" stroke="#141418" strokeWidth={16} strokeLinecap="round" />
    <circle cx={205} cy={52} r={26} fill={color} stroke="#000" strokeWidth={3} />
    <path d="M210 44 L232 46 L230 60 L212 58 Z" fill="#0a0a0d" />
  </svg>
);

const PACK = [
  {color: '#2d6bff', y: 880, scale: 0.8, speed: 0.7, delay: 0.75},
  {color: '#e8e8ec', y: 980, scale: 1.2, speed: 0.85, delay: 0.25},
  {color: F.red, y: 1110, scale: 1.75, speed: 1.0, delay: 0},
  {color: F.molten, y: 1260, scale: 2.3, speed: 1.2, delay: 0.55},
];

// A pack of bikers blasting across the road; wheelie on downbeats when it's hot.
export const BikerPack: React.FC<{active: number}> = ({active}) => {
  const {f, t} = useT();
  if (active <= 0) return null;
  const e = energyAt(t);
  const d = downbeatPulse(t);
  return (
    <>
      {PACK.map((b, i) => {
        const period = 5.5 / (b.speed * (0.7 + e * 0.6));
        const p = (((t / period) + b.delay) % 1);
        const x = -420 * b.scale - 100 + p * (1300 + 420 * b.scale);
        const wheelie = e > 0.65 ? -d * 14 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: b.y - 260 * b.scale, transform: `scale(${b.scale})`, transformOrigin: 'left top',
            opacity: active}}>
            <Bike color={b.color} spin={f * 0.9 * b.speed} flame={0.5 + e * 0.8 + d * 0.4} lean={wheelie} />
          </div>
        );
      })}
    </>
  );
};

// Front view rider rushing out of the vanishing point (drops / chorus hits).
export const Headlight: React.FC<{progress: number}> = ({progress}) => {
  if (progress <= 0 || progress >= 1) return null;
  const s = 0.2 + Math.pow(progress, 2.4) * 5.5;
  const y = HORIZON + 40 + progress * 520;
  return (
    <div style={{position: 'absolute', left: VP, top: y, transform: `translate(-50%, -60%) scale(${s})`, opacity: progress < 0.9 ? 1 : (1 - progress) * 10}}>
      <svg width={300} height={340} viewBox="0 0 300 340" style={{overflow: 'visible'}}>
        <ellipse cx={150} cy={200} rx={600} ry={200} fill={`${F.fire}22`} />
        <path d="M95 120 L60 60 M205 120 L240 60" stroke={F.chrome} strokeWidth={10} strokeLinecap="round" />
        <circle cx={150} cy={52} r={34} fill="#141418" stroke={F.red} strokeWidth={6} />
        <path d="M120 48 L180 48 L176 66 L124 66 Z" fill="#000" />
        <path d="M95 95 L205 95 L225 220 L75 220 Z" fill="#141418" />
        <rect x={130} y={220} width={40} height={110} rx={18} fill="#0c0c10" />
        <circle cx={150} cy={170} r={34} fill={F.white} style={{filter: `drop-shadow(0 0 40px ${F.fire}) drop-shadow(0 0 80px ${F.white})`}} />
      </svg>
    </div>
  );
};

// Flame wall rising from the bottom; height and flicker follow the energy.
export const Flames: React.FC = () => {
  const {f, t} = useT();
  const e = energyAt(t);
  const b = beatPulse(t);
  const tongues = new Array(14).fill(0).map((_, i) => {
    const x = (i / 13) * 1180 - 50;
    const h = 220 + e * 380 + Math.sin(f / 3 + i * 1.7) * 60 + b * 90 * random(`b${i}`);
    const w = 150 + random(`w${i}`) * 90;
    const sway = Math.sin(f / 5 + i) * 30;
    return (
      <path key={i} d={`M${x - w / 2} 1920 C ${x - w / 3} ${1920 - h * 0.5}, ${x + sway - 20} ${1920 - h * 0.8}, ${x + sway} ${1920 - h}
        C ${x + sway + 25} ${1920 - h * 0.75}, ${x + w / 3} ${1920 - h * 0.45}, ${x + w / 2} 1920 Z`}
        fill={`url(#flame${i % 2})`} opacity={0.85} />
    );
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id="flame0" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={F.red} />
          <stop offset="55%" stopColor={F.molten} />
          <stop offset="100%" stopColor={F.fire} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="flame1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={F.molten} />
          <stop offset="60%" stopColor={F.fire} />
          <stop offset="100%" stopColor="#fff3b0" stopOpacity={0} />
        </linearGradient>
      </defs>
      {tongues}
    </svg>
  );
};

// Sparks / embers rising.
export const Embers: React.FC = () => {
  const {f, t} = useT();
  const e = energyAt(t);
  return (
    <>
      {new Array(60).fill(0).map((_, i) => {
        const sp = 3 + random(`s${i}`) * 9;
        const y = 1920 - ((f * sp * (0.5 + e) + random(`y${i}`) * 1920) % 2000);
        const x = random(`x${i}`) * 1080 + Math.sin(f / 15 + i) * 40;
        const sz = 3 + random(`z${i}`) * 7;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%',
          background: i % 3 ? F.fire : F.white, boxShadow: `0 0 ${sz * 2}px ${F.molten}`, opacity: 0.5 + e * 0.5}} />;
      })}
    </>
  );
};

// Green rain + falling code (the cold robot world of the verses).
export const GreenRain: React.FC<{amount: number}> = ({amount}) => {
  const {f} = useT();
  if (amount <= 0) return null;
  return (
    <AbsoluteFill style={{opacity: amount}}>
      {new Array(40).fill(0).map((_, i) => {
        const x = random(`rx${i}`) * 1300 - 100;
        const y = ((f * (25 + random(`rv${i}`) * 20) + random(`ry${i}`) * 2200) % 2200) - 200;
        return <div key={i} style={{position: 'absolute', left: x - y * 0.25, top: y, width: 3, height: 120 + random(`rl${i}`) * 80,
          background: `linear-gradient(180deg, transparent, ${F.green})`, transform: 'rotate(14deg)', opacity: 0.55}} />;
      })}
      {new Array(10).fill(0).map((_, i) => {
        const x = 40 + i * 105;
        const y = ((f * (6 + random(`cv${i}`) * 6) + random(`cy${i}`) * 1900) % 1900) - 300;
        const chars = new Array(12).fill(0).map((__, k) => (random(`c${i}-${k}-${Math.floor(f / 6)}`) > 0.5 ? '1' : '0')).join('\n');
        return <div key={`c${i}`} style={{position: 'absolute', left: x, top: y, whiteSpace: 'pre', fontFamily: 'monospace', fontSize: 30,
          lineHeight: 1.05, color: F.green, opacity: 0.45, textShadow: `0 0 10px ${F.green}`}}>{chars}</div>;
      })}
    </AbsoluteFill>
  );
};

// Lightning strike for the guitar solo / big hits.
export const Lightning: React.FC<{seed: number; strength: number}> = ({seed, strength}) => {
  if (strength <= 0.05) return null;
  let x = 200 + random(`lx${seed}`) * 680;
  let y = 0;
  const pts = [`${x},${y}`];
  while (y < HORIZON + 100) {
    y += 60 + random(`ly${seed}-${y}`) * 60;
    x += (random(`lj${seed}-${y}`) - 0.5) * 160;
    pts.push(`${x},${y}`);
  }
  return (
    <>
      <AbsoluteFill style={{background: '#e9f3ff', opacity: strength * 0.35}} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: strength}}>
        <polyline points={pts.join(' ')} fill="none" stroke="#fff" strokeWidth={8} style={{filter: 'drop-shadow(0 0 18px #9fd0ff)'}} />
      </svg>
    </>
  );
};

export {interpolate};
