import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// "1000 CHAÎNES" — cinematic title sequence (16:9, rendered at 2x for 4K).
// Original illustrated character: a chained bluesman playing an acoustic guitar,
// lit in chiaroscuro by a single dusty shaft of light.

const C = {
  black: '#0a0705',
  umber: '#2a1a10',
  amber: '#e8a14a',
  gold: '#f3c77a',
  rust: '#8a4b26',
  skinLit: '#9b5d3c',
  skinDark: '#3a2116',
  iron: '#4a4744',
};

const DISPLAY = 'Anton, Impact, sans-serif';
const SANS = 'Montserrat, Inter, sans-serif';

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  Promise.all(
    [
      {family: 'Anton', file: 'fonts/anton-latin.woff2', weight: '400'},
      {family: 'Montserrat', file: 'fonts/montserrat-latin.woff2', weight: '400 900'},
    ].map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(h));
}

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Chain made of alternating oval links along a quadratic curve.
const Chain: React.FC<{x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; n: number; lit?: boolean}> = ({x1, y1, cx, cy, x2, y2, n, lit}) => {
  const links = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    const dx = 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx);
    const dy = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    links.push(
      <ellipse key={i} cx={x} cy={y} rx={i % 2 ? 9 : 11} ry={i % 2 ? 3.5 : 6.5} transform={`rotate(${a + (i % 2 ? 0 : 0)} ${x} ${y})`}
        fill="none" stroke={lit ? C.gold : C.iron} strokeWidth={i % 2 ? 4 : 3.2} opacity={lit ? 0.95 : 0.85} />,
    );
  }
  return <g>{links}</g>;
};

// The bluesman, seated on a crate, guitar on his knee, singing with his head tilted back.
const Bluesman: React.FC<{f: number}> = ({f}) => {
  const strum = Math.sin(f / 4.2) * 9; // strumming hand
  const breathe = Math.sin(f / 30) * 3;
  const sing = 0.5 + 0.5 * Math.sin(f / 7); // mouth
  const sway = Math.sin(f / 45) * 1.6;
  const chainSway = Math.sin(f / 22) * 12;
  return (
    <svg width={900} height={900} viewBox="0 0 900 900" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor={C.skinLit} />
          <stop offset="45%" stopColor={C.skinDark} />
          <stop offset="100%" stopColor="#1a0f0a" />
        </linearGradient>
        <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#8e7a5c" />
          <stop offset="50%" stopColor="#3d3226" />
          <stop offset="100%" stopColor="#15100b" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c98a4a" />
          <stop offset="55%" stopColor="#6b3d1d" />
          <stop offset="100%" stopColor="#241309" />
        </linearGradient>
      </defs>
      {/* floor shadow */}
      <ellipse cx={450} cy={845} rx={330} ry={34} fill="#000" opacity={0.6} />
      {/* crate */}
      <path d="M300 640 L600 640 L600 830 L300 830 Z" fill="#2b1a0f" />
      <path d="M300 640 L600 640 L600 660 L300 660 Z" fill="#5a3a20" />
      <path d="M300 700 L600 700 M300 765 L600 765" stroke="#1a0f08" strokeWidth={5} />
      <g transform={`rotate(${sway} 450 640)`}>
        {/* legs */}
        <path d="M380 640 C 360 700, 330 760, 330 830" stroke="url(#shirt)" strokeWidth={56} fill="none" strokeLinecap="round" />
        <path d="M500 640 C 560 690, 600 750, 610 830" stroke="url(#shirt)" strokeWidth={56} fill="none" strokeLinecap="round" />
        <ellipse cx={318} cy={842} rx={44} ry={15} fill="#120b07" />
        <ellipse cx={624} cy={842} rx={44} ry={15} fill="#120b07" />
        {/* ankle shackles + chain to the floor ring */}
        <rect x={304} y={796} width={52} height={20} rx={6} fill={C.iron} stroke={C.gold} strokeWidth={2} opacity={0.95} />
        <rect x={586} y={796} width={52} height={20} rx={6} fill={C.iron} stroke={C.gold} strokeWidth={2} opacity={0.95} />
        <Chain x1={330} y1={810} cx={470} cy={870 + chainSway * 0.3} x2={612} y2={810} n={18} />
        {/* torso */}
        <path d={`M372 ${420 + breathe} C 360 520, 370 600, 390 650 L 520 650 C 545 590, 545 510, 522 ${420 + breathe} Z`} fill="url(#shirt)" />
        {/* neck + head (tilted back, singing) */}
        <path d="M430 400 L470 400 L475 440 L428 440 Z" fill="url(#rim)" />
        <g transform={`rotate(${-12 + Math.sin(f / 20) * 3} 450 395)`}>
          <ellipse cx={452} cy={330} rx={56} ry={70} fill="url(#rim)" />
          <path d="M398 300 C 400 255, 500 250, 508 300 C 490 280, 420 280, 398 300 Z" fill="#100906" />
          {/* closed eyes */}
          <path d="M418 322 Q 430 328 442 322" stroke="#120a06" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M466 322 Q 478 328 490 322" stroke="#120a06" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M412 306 Q 428 298 444 306" stroke="#120a06" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          {/* singing mouth */}
          <ellipse cx={456} cy={366} rx={12} ry={4 + sing * 9} fill="#1a0a06" />
          {/* beard shadow */}
          <path d="M408 352 C 420 400, 492 402, 500 352 C 490 384, 420 384, 408 352 Z" fill="#140c08" opacity={0.75} />
          {/* rim light on the face */}
          <path d="M398 300 C 392 340, 400 380, 430 398" stroke={C.gold} strokeWidth={4} fill="none" opacity={0.7} />
        </g>
        {/* guitar body */}
        <g transform="rotate(-24 450 560)">
          <ellipse cx={400} cy={580} rx={100} ry={92} fill="url(#wood)" stroke="#1a0d06" strokeWidth={4} />
          <ellipse cx={478} cy={548} rx={70} ry={66} fill="url(#wood)" stroke="#1a0d06" strokeWidth={4} />
          <ellipse cx={440} cy={566} rx={60} ry={58} fill="url(#wood)" />
          <path d="M310 560 C 320 500, 380 480, 420 500" stroke={C.gold} strokeWidth={4} fill="none" opacity={0.85} />
          <circle cx={440} cy={562} r={28} fill="#120904" stroke="#3a2414" strokeWidth={5} />
          <rect x={500} y={520} width={300} height={34} rx={6} fill="#3a2414" />
          <rect x={790} y={510} width={56} height={54} rx={8} fill="#2a1a0e" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <line key={k} x1={380} y1={527 + k * 6} x2={800} y2={527 + k * 6} stroke={C.gold} strokeWidth={1.2}
              opacity={0.55 + 0.4 * Math.abs(Math.sin(f / 3 + k))} />
          ))}
                  </g>
        {/* fretting arm (left) reaching the neck */}
        <path d="M390 440 C 330 470, 310 520, 300 470" stroke="url(#shirt)" strokeWidth={44} fill="none" strokeLinecap="round" opacity={0} />
        <path d="M520 450 C 610 470, 660 430, 700 410" stroke="url(#shirt)" strokeWidth={42} fill="none" strokeLinecap="round" />
        <circle cx={708} cy={404} r={24} fill="url(#rim)" />
        {/* strumming arm (right) */}
        <path d={`M380 450 C 330 500, 360 560, ${420 + strum} ${560 + strum * 0.6}`} stroke="url(#shirt)" strokeWidth={46} fill="none" strokeLinecap="round" />
        <circle cx={425 + strum} cy={565 + strum * 0.6} r={25} fill="url(#rim)" />
        {/* wrist shackles and the chain between the hands */}
        <rect x={400 + strum} y={540 + strum * 0.6} width={46} height={22} rx={6} fill={C.iron} stroke={C.gold} strokeWidth={2}
          transform={`rotate(-30 ${423 + strum} ${551 + strum * 0.6})`} />
        <rect x={680} y={392} width={44} height={22} rx={6} fill={C.iron} stroke={C.gold} strokeWidth={2} transform="rotate(20 702 403)" />
        <Chain x1={430 + strum} y1={560 + strum * 0.6} cx={560 + chainSway} cy={640 + chainSway * 0.4} x2={700} y2={410} n={22} lit />
      </g>
    </svg>
  );
};

const Dust: React.FC<{f: number}> = ({f}) => (
  <>
    {new Array(90).fill(0).map((_, i) => {
      const x = 560 + random(`x${i}`) * 700 + Math.sin(f / 40 + i) * 30;
      const y = ((random(`y${i}`) * 1200 - f * (0.2 + random(`v${i}`) * 0.6)) % 1200 + 1200) % 1200 - 60;
      const inBeam = 1 - Math.min(1, Math.abs(x - (760 + (y / 1080) * 260)) / 320);
      const s = 1.5 + random(`s${i}`) * 4;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: C.gold,
        opacity: 0.15 + inBeam * 0.7 * (0.5 + 0.5 * Math.sin(f / 10 + i))}} />;
    })}
  </>
);

// Metallic, textured title text (gradient + turbulence-based grain + specular sheen).
const MetalText: React.FC<{text: string; size: number; sweep: number; id: string}> = ({text, size, sweep, id}) => (
  <svg width={1900} height={size * 1.25} viewBox={`0 0 1900 ${size * 1.25}`} style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6efe2" />
        <stop offset="35%" stopColor="#b9a88f" />
        <stop offset="52%" stopColor="#5d5146" />
        <stop offset="60%" stopColor="#a7957b" />
        <stop offset="100%" stopColor="#3b3129" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
        <stop offset={`${Math.max(0, sweep - 0.08)}`} stopColor="#fff" stopOpacity={0} />
        <stop offset={`${sweep}`} stopColor="#fff8e0" stopOpacity={0.85} />
        <stop offset={`${Math.min(1, sweep + 0.08)}`} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
      <filter id={`${id}t`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves={2} seed={4} result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComposite in="g" in2="SourceGraphic" operator="in" result="grain" />
        <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
      </filter>
    </defs>
    <text x={950} y={size} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} letterSpacing={size * 0.04}
      fill="#000" opacity={0.8} transform={`translate(6 10)`}>{text}</text>
    <text x={950} y={size} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} letterSpacing={size * 0.04}
      fill={`url(#${id}g)`} stroke="#1a1410" strokeWidth={3} filter={`url(#${id}t)`}>{text}</text>
    <text x={950} y={size} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} letterSpacing={size * 0.04}
      fill={`url(#${id}s)`} style={{mixBlendMode: 'screen'}}>{text}</text>
  </svg>
);

export const TitleSequence: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;

  const light = interpolate(t, [0.3, 2.5], [0, 1], clamp) * (0.93 + 0.07 * Math.sin(f / 3) * Math.sin(f / 7)); // flicker
  const figure = interpolate(t, [1.2, 4], [0, 1], clamp);
  const camZoom = interpolate(t, [0, end], [1.12, 1.0]);
  const camX = interpolate(t, [0, end], [40, -20]);

  // kinetic typography: "NOUVEAU SINGLE DE" then "DJ MILLE"
  const pre = ['NOUVEAU', 'SINGLE', 'DE'];
  const djIn = spring({frame: f - Math.round(7.4 * fps), fps, config: {damping: 14, stiffness: 120}});
  const preOut = interpolate(t, [10.6, 11.4], [1, 0], clamp);
  // main title slam
  const titleIn = spring({frame: f - Math.round(12 * fps), fps, config: {damping: 9, stiffness: 160}});
  const flash = interpolate(t, [12.05, 12.12, 12.45], [0, 0.6, 0], clamp);
  const shake = t > 12 && t < 12.7 ? Math.sin(f * 3.1) * (12.7 - t) * 18 : 0;
  const sweep = interpolate(t, [13, 16.5], [-0.1, 1.1], clamp);
  const fadeOut = interpolate(t, [end - 1.5, end], [1, 0], clamp);

  return (
    <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: fadeOut, transform: `translate(${shake}px, ${shake * 0.4}px)`}}>
        {/* warm room tone + light shaft */}
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 52% 70%, ${C.umber} 0%, ${C.black} 62%)`, opacity: light}} />
        <div style={{position: 'absolute', left: 520, top: -200, width: 640, height: 1500,
          background: `linear-gradient(180deg, ${C.gold}55 0%, ${C.amber}22 55%, transparent 100%)`,
          transform: 'skewX(-14deg)', opacity: 0.75 * light, mixBlendMode: 'screen'}} />
        {/* back wall planks */}
        <AbsoluteFill style={{opacity: 0.18 * light, backgroundImage: `repeating-linear-gradient(90deg, ${C.rust} 0 6px, transparent 6px 140px)`}} />
        {/* the bluesman */}
        <div style={{position: 'absolute', left: 960 - 450 + camX, top: 150, transform: `scale(${camZoom})`, transformOrigin: '50% 90%', opacity: figure,
          filter: `brightness(${interpolate(t, [11.5, 12.5], [0.85, 0.55], clamp)}) contrast(1.15) drop-shadow(-6px -4px 0 ${C.amber}55) drop-shadow(0 0 50px ${C.amber}33)`}}>
          <Bluesman f={f} />
        </div>
        <Dust f={f} />

        {/* pre-title */}
        <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', opacity: preOut}}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 34}}>
            {pre.map((w, i) => {
              const k = spring({frame: f - Math.round((4.6 + i * 0.6) * fps), fps, config: {damping: 16, stiffness: 90}});
              return (
                <span key={w} style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.gold,
                  letterSpacing: interpolate(k, [0, 1], [40, 14]), opacity: k, transform: `translateY(${(1 - k) * 30}px)`,
                  textShadow: '0 4px 20px #000'}}>{w}</span>
              );
            })}
          </div>
          <div style={{fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.05, marginTop: 10, color: '#f4ead8', letterSpacing: interpolate(djIn, [0, 1], [60, 10]),
            opacity: djIn, transform: `scale(${interpolate(djIn, [0, 1], [1.4, 1])})`, textShadow: `0 8px 30px #000, 0 0 40px ${C.amber}55`}}>
            DJ MILLE
          </div>
        </div>

        {/* main title */}
        {t > 11.9 && (
          <div style={{position: 'absolute', left: 10, right: 10, top: 690, transform: `scale(${interpolate(titleIn, [0, 1], [2.6, 1])})`,
            opacity: Math.min(1, titleIn * 1.5), transformOrigin: 'center'}}>
            <MetalText text="1000 CHAÎNES" size={230} sweep={sweep} id="title" />
          </div>
        )}
        {/* film look: vignette, grain, letterbox */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, transparent 40%, #000c 100%)'}} />
        <AbsoluteFill style={{opacity: 0.12, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' seed='${f % 12}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
        <AbsoluteFill style={{background: '#fff3d6', opacity: flash, mixBlendMode: 'screen'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, background: '#000'}} />
      {/* warm vintage grade */}
      <AbsoluteFill style={{background: '#8a5a2a', mixBlendMode: 'soft-light', opacity: 0.35, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
