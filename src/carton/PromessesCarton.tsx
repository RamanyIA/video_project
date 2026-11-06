import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Calculator, Crossing, Jupiter, NoAI, PizzaBox, Placard, Poker, Powder, PromiseCounter, Receipt, RedCard, RicePrice, Shockwave, Stamp493, TitleBox} from './components/Gfx';
import {Chapter, Lyrics, Responses} from './components/Lyrics';
import {FilmLook, Photo} from './components/Shot';
import lyrics from './data/lyrics.json';
import {beatPulse, downbeatPulse, energyAt} from './music';
import {CHAPTERS, HOT, QUADS, SHOTS, Shot} from './storyboard';
import {C} from './theme';

import './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BOUMS = lyrics.lines.flatMap((l) => l.resp.filter((r) => /BOUM/.test(r.text)).map((r) => r.start));
const inHot = (t: number) => HOT.some(([a, b]) => t >= a && t < b);
const shotIndex = (t: number) => {
  let i = 0;
  SHOTS.forEach((s, k) => {
    if (s.t <= t) i = k;
  });
  return i;
};

const ShotView: React.FC<{shot: Shot; end: number; t: number}> = ({shot, end, t}) => {
  const dur = end - shot.t;
  const p = (t - shot.t) / dur;
  if (shot.gfx) {
    switch (shot.gfx) {
      case 'crossing': return <Crossing at={shot.t} dur={dur} />;
      case 'pizza': return <PizzaBox at={shot.t} dur={dur} />;
      case 'poker': return <Poker at={shot.t} dur={dur} />;
      case 'jupiter': return <Jupiter at={shot.t} dur={dur} />;
      case 'calculator':
        return <Calculator at={shot.t} dur={dur} lines={[
          {at: shot.t + 0.4, text: 'CALCULS MAISON...'},
          {at: 287.6, text: '1000 x PROMESSE'},
          {at: 290.26, text: '= 0 SOLUTION'},
        ]} />;
      case 'redcard':
        return (
          <AbsoluteFill>
            <Photo img="71" p={1} move={{s0: 1.45, s1: 1.45, y0: 6, y1: 6}} />
            <RedCard at={shot.t} dur={dur + 0.8} />
          </AbsoluteFill>
        );
      case 'title':
        return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, #2b1a0c, ${C.night} 75%)`}}><TitleBox at={shot.t} out={999} /></AbsoluteFill>;
      default: return <AbsoluteFill style={{background: '#000'}} />;
    }
  }
  const slogan = shot.placard && shot.slogan;
  const maxLen = slogan ? Math.max(...slogan.map((s) => s.length)) : 1;
  return (
    <AbsoluteFill>
      <Photo img={shot.img!} p={p} move={shot.move}>
        {slogan && <Placard quad={QUADS[shot.placard!]} lines={slogan} at={shot.t + 0.15} size={Math.min(150, 1000 / (maxLen * 0.6))} />}
      </Photo>
      {shot.over === 'counter' && <PromiseCounter at={shot.t} dur={dur} />}
      {shot.over === 'rice' && <RicePrice at={shot.t} dur={dur} />}
      {shot.over === 'receipt' && <Receipt at={shot.t} dur={dur} />}
      {shot.over === 'powder' && <Powder at={shot.t + 0.3} dur={dur} cx={900} cy={560} />}
      {shot.over === 'noai' && <NoAI at={shot.t} dur={dur} />}
      {shot.over === 'stamp493' && <Stamp493 at={shot.t + 0.05} dur={dur} />}
    </AbsoluteFill>
  );
};

// Confetti for the grand carnival.
const Confetti: React.FC<{amount: number}> = ({amount}) => {
  const f = useCurrentFrame();
  if (amount <= 0) return null;
  const cols = [C.hibiscus, C.mango, C.turquoise, C.madrasGreen, C.cream];
  return (
    <AbsoluteFill style={{opacity: amount}}>
      {new Array(80).fill(0).map((_, i) => {
        const speed = 3 + random(`cs${i}`) * 5;
        const y = ((random(`cy${i}`) * 1200 + f * speed) % 1250) - 100;
        const x = random(`cx${i}`) * 1920 + Math.sin(f / 12 + i) * 40;
        const r = f * (4 + random(`cr${i}`) * 8) + i * 30;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 24, background: cols[i % cols.length],
          transform: `rotate(${r}deg) scaleX(${Math.cos(r / 20)})`, borderRadius: 2}} />;
      })}
    </AbsoluteFill>
  );
};

export const PromessesCarton: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;
  const i = shotIndex(t);
  const shot = SHOTS[i];
  const next = SHOTS[i + 1]?.t ?? end;
  const prev = SHOTS[i - 1];
  const xf = shot.xf ?? 0;
  const fadeIn = xf > 0 ? interpolate(t, [shot.t, shot.t + xf], [0, 1], clamp) : 1;

  const hot = inHot(t);
  const d = downbeatPulse(t);
  const b = beatPulse(t);
  const boum = Math.max(0, ...BOUMS.map((x) => (t >= x && t < x + 0.5 ? Math.exp(-(t - x) * 7) : 0)));
  const punch = hot ? 1 + d * 0.035 + b * 0.01 : 1;
  const shake = boum * 26 + (hot ? d * 5 : 0);
  const sx = Math.sin(f * 2.3) * shake;
  const sy = Math.cos(f * 1.7) * shake;
  // white flash on the first beat of each hot section, on BOUMs, and a small cut flash on hot cuts
  const cutFlash = hot && xf === 0 ? interpolate(t, [shot.t, shot.t + 0.12], [0.22, 0], clamp) : 0;
  const sectionFlash = Math.max(0, ...HOT.map(([a]) => (t >= a && t < a + 0.4 ? 0.8 * (1 - (t - a) / 0.4) : 0)));
  const flash = Math.max(cutFlash, sectionFlash, boum * 0.45);
  const carnival = interpolate(t, [312.6, 313.2, 331, 332.4], [0, 1, 1, 0], clamp);
  const fadeAll = interpolate(t, [0, 1.5, end - 2.5, end], [0, 1, 1, 0], clamp);
  const titleIntro = t < 14.14;
  const titleOutro = t >= 376.6;
  const e = energyAt(t);

  return (
    <AbsoluteFill style={{background: C.night}}>
      <AbsoluteFill style={{opacity: fadeAll}}>
        <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${punch})`}}>
          {prev && fadeIn < 1 && <ShotView shot={prev} end={shot.t + xf} t={t} />}
          <AbsoluteFill style={{opacity: fadeIn}}>
            <ShotView shot={shot} end={next} t={t} />
          </AbsoluteFill>
        </AbsoluteFill>
        {titleIntro && (
          <>
            <AbsoluteFill style={{background: `rgba(13,10,8,${interpolate(t, [0, 2, 11.5, 14.1], [0.2, 0.55, 0.55, 0], clamp)})`}} />
            <TitleBox at={1.4} out={13.9} />
          </>
        )}
        <Shockwave times={BOUMS} />
        <Confetti amount={carnival} />
        <FilmLook vignette={0.45 + (1 - e) * 0.2} />
        {CHAPTERS.map((c) => <Chapter key={c.start} {...c} />)}
        <Responses />
        <Lyrics hidden={titleIntro || titleOutro} />
        <AbsoluteFill style={{background: C.cream, opacity: flash, mixBlendMode: 'screen'}} />
      </AbsoluteFill>
      <Audio src={staticFile('audio/promesses-carton.mp3')} />
    </AbsoluteFill>
  );
};
