import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from './data/captions.json';
import track from './data/track.json';
import {Admiral, General} from './components/Characters';
import {loadPodcastFonts, PC, SANS, SERIF} from './theme';

loadPodcastFonts();

export const INTRO = 4; // seconds of music before the voices start
export const OUTRO = 5;

const at = (arr: number[], i: number) => arr[Math.max(0, Math.min(arr.length - 1, i))] ?? 0;

// Blink every few seconds, different rhythm per character.
const blinkAt = (f: number, seed: number) => {
  const period = 95 + seed * 37;
  const p = (f + seed * 53) % period;
  return p < 4 ? Math.sin((p / 4) * Math.PI) : 0;
};

const Header: React.FC = () => (
  <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center'}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, padding: '10px 28px', borderRadius: 40, border: `3px solid ${PC.gold}`,
      fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: PC.gold}}>
      ⚓ PODCAST · DÉFENSE & IA ✈
    </div>
    <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 82, lineHeight: 1.02, color: PC.white, marginTop: 22,
      textShadow: `0 4px 0 #000, 0 0 40px ${PC.cyan}55`}}>
      La Dissuasion<br /><span style={{color: PC.cyan}}>Numérique</span>
    </div>
  </div>
);

// Studio: navy backdrop, radar sweep, digital grid, hermine pattern, desk with microphones.
const Studio: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = (f * 1.5) % 360;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${PC.navy2} 0%, ${PC.navy} 70%)`}}>
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${PC.cyan}14 2px, transparent 2px), linear-gradient(90deg, ${PC.cyan}14 2px, transparent 2px)`,
        backgroundSize: '90px 90px', backgroundPosition: `0 ${(f * 0.5) % 90}px`}} />
      {/* radar */}
      <div style={{position: 'absolute', left: 540 - 380, top: 760 - 380, width: 760, height: 760, borderRadius: '50%',
        border: `3px solid ${PC.cyan}44`, boxShadow: `inset 0 0 0 120px ${PC.navy}00`}} />
      <div style={{position: 'absolute', left: 540 - 250, top: 760 - 250, width: 500, height: 500, borderRadius: '50%', border: `2px solid ${PC.cyan}33`}} />
      <div style={{position: 'absolute', left: 540 - 380, top: 760 - 380, width: 760, height: 760, borderRadius: '50%',
        background: `conic-gradient(from ${sweep}deg, ${PC.cyan}55 0deg, transparent 50deg, transparent 360deg)`, opacity: 0.6}} />
      {/* hermine pattern (Brittany) */}
      {new Array(12).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 4) * 300 + ((Math.floor(i / 4) % 2) * 150) + 40, top: 330 + Math.floor(i / 4) * 330,
          fontSize: 54, color: PC.white, opacity: 0.06}}>⚜</div>
      ))}
      {/* desk */}
      <div style={{position: 'absolute', left: -40, right: -40, top: 1200, height: 120, background: `linear-gradient(180deg, #3a2a20, #24180f)`,
        borderTop: `6px solid ${PC.gold}`, boxShadow: '0 -20px 60px #000a'}} />
    </AbsoluteFill>
  );
};

const Mic: React.FC<{x: number; flip: boolean; live: number}> = ({x, flip, live}) => (
  <div style={{position: 'absolute', left: x, top: 1035, transform: flip ? 'scaleX(-1)' : undefined}}>
    <svg width={140} height={210} viewBox="0 0 140 210">
      <path d="M70 200 L70 120 L30 80" stroke="#222" strokeWidth={10} fill="none" strokeLinecap="round" />
      <rect x={4} y={20} width={50} height={90} rx={24} fill="#1b1b1f" transform="rotate(-40 30 65)" />
      <rect x={10} y={30} width={38} height={60} rx={18} fill="#333" transform="rotate(-40 30 65)" />
      <circle cx={30} cy={30} r={8} fill={live > 0.1 ? '#ff3b3b' : '#552222'} />
    </svg>
  </div>
);

const NamePlate: React.FC<{x: number; title: string; sub: string; active: number; color: string}> = ({x, title, sub, active, color}) => (
  <div style={{position: 'absolute', left: x, top: 1225, width: 400, textAlign: 'center', transform: `scale(${1 + active * 0.05})`}}>
    <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, letterSpacing: 4, color: active > 0.5 ? PC.navy : PC.white,
      background: active > 0.5 ? color : '#0008', border: `3px solid ${color}`, borderRadius: 14, padding: '8px 0'}}>{title}</div>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: PC.white, opacity: 0.8, marginTop: 6}}>{sub}</div>
  </div>
);

const Captions: React.FC<{t: number}> = ({t}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let page: (typeof captions.pages)[number] | undefined;
  for (const p of captions.pages) {
    if (p.start > t) break;
    page = p;
  }
  if (!page || t > page.end + 0.5) return null;
  const color = page.speaker === 0 ? PC.gold : PC.cyan;
  return (
    <div style={{position: 'absolute', top: 1420, left: 50, right: 50, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 18px',
      fontFamily: SANS, fontWeight: 900, fontSize: 72, lineHeight: 1.15, textTransform: 'uppercase'}}>
      {page.words.map((w, i) => {
        const startF = Math.round((w.s + INTRO) * fps);
        if (f < startF) return null;
        const pop = spring({frame: f - startF, fps, config: {damping: 12, stiffness: 220}});
        const active = t >= w.s && (i === page!.words.length - 1 || t < page!.words[i + 1].s);
        return (
          <span key={i} style={{display: 'inline-block', transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})`, padding: '0 12px', borderRadius: 14,
            color: active ? PC.navy : PC.white, background: active ? color : 'transparent',
            textShadow: active ? 'none' : '0 5px 0 #000, 0 0 24px #000c'}}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

export const Podcast: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const vf = f - INTRO * fps; // frame in the voice track
  const t = vf / fps;
  const spk = at(track.speaker, vf);
  const m0 = vf >= 0 ? at(track.mouth0, vf) : 0;
  const m1 = vf >= 0 ? at(track.mouth1, vf) : 0;
  // smooth "who is talking" focus for camera + plates
  const focus0 = interpolate(spk === 0 ? 1 : spk === 1 ? 0 : 0.5, [0, 1], [0, 1]);
  const camX = interpolate(focus0, [0, 1], [-30, 30]);
  const head = (m: number, seed: number) => ({tilt: Math.sin(f / (22 + seed * 5)) * 2 + m * 3, nod: m * 6 + Math.sin(f / 9 + seed) * m * 4});
  const listenNod = (seed: number) => Math.max(0, Math.sin(f / 40 + seed)) * 3;
  const h0 = head(m0, 0);
  const h1 = head(m1, 1);
  const end = durationInFrames / fps;
  const outroOp = interpolate(f / fps, [end - OUTRO, end - OUTRO + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: PC.navy}}>
      <Studio />
      <Header />
      <AbsoluteFill style={{transform: `translateX(${camX}px)`}}>
        <div style={{position: 'absolute', left: 30, top: 592, transform: `scale(${1.35 + (spk === 0 ? 0.04 : 0)})`, transformOrigin: 'center bottom'}}>
          <Admiral open={m0} blink={blinkAt(f, 0)} tilt={h0.tilt} nod={h0.nod + (spk === 1 ? listenNod(0) : 0)} brow={m0 * 0.8} />
        </div>
        <div style={{position: 'absolute', left: 590, top: 592, transform: `scale(${1.35 + (spk === 1 ? 0.04 : 0)})`, transformOrigin: 'center bottom'}}>
          <General open={m1} blink={blinkAt(f, 1)} tilt={h1.tilt} nod={h1.nod + (spk === 0 ? listenNod(1) : 0)} brow={m1 * 0.8} />
        </div>
        <Mic x={330} flip={false} live={m0} />
        <Mic x={610} flip live={m1} />
      </AbsoluteFill>
      <NamePlate x={40} title="L'AMIRALE" sub="Marine nationale" active={spk === 0 ? 1 : 0} color={PC.gold} />
      <NamePlate x={640} title="LE GÉNÉRAL" sub="Armée de l'air et de l'espace" active={spk === 1 ? 1 : 0} color={PC.cyan} />
      {vf >= 0 && <Captions t={t} />}
      {outroOp > 0 && (
        <AbsoluteFill style={{background: `${PC.navy}ee`, opacity: outroOp, justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
          <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 110, color: PC.white, lineHeight: 1.05}}>
            La Dissuasion<br /><span style={{color: PC.cyan}}>Numérique</span>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: PC.gold, marginTop: 40}}>⚓ À BIENTÔT ✈</div>
        </AbsoluteFill>
      )}
      <Sequence from={INTRO * fps}>
        <Audio src={staticFile('audio/mistral.m4a')} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const podcastDuration = (fps: number) => Math.ceil((track.duration + INTRO + OUTRO) * fps);
