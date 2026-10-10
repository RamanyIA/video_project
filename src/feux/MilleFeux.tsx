import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, BikerPack, Embers, Flames, GreenRain, Headlight, Lightning, Road} from './components/Scene';
import {Brand, ChorusTitle, Lyrics, TitleCard} from './components/Text';
import {beatIndexAt, downbeatPulse, energyAt, music} from './music';

// Song map (seconds): the cold robot world melts into fire on the choruses.
const COLD = [[0, 78], [130, 178]]; // green rain + code
const FIRE = [[101.7, 130], [192.6, 268], [283, 321]]; // choruses, solo, last blast
const SOLO = [220.5, 268];
const RUSHES = [28.7, 101.7, 116, 192.6, 206.5, 220.5, 236, 252, 283, 300]; // headlight rushes on big hits
const OUTRO = 322;

const windowAmount = (t: number, wins: number[][], fade = 1.5) =>
  Math.max(0, ...wins.map(([a, b]) => interpolate(t, [a - fade, a, b, b + fade], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));

export const MilleFeux: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;
  const e = energyAt(t);
  const d = downbeatPulse(t);
  const fire = windowAmount(t, FIRE, 0.4);
  const cold = windowAmount(t, COLD, 3);
  const solo = t >= SOLO[0] && t < SOLO[1];

  // strobe + shake on downbeats when it's burning
  const shake = (fire > 0.5 ? 12 : e > 0.5 ? 5 : 0) * d;
  const sx = Math.sin(f * 2.7) * shake;
  const sy = Math.cos(f * 1.9) * shake;
  const strobe = fire > 0.5 && d > 0.85 ? 0.35 : 0;

  const rush = RUSHES.map((r) => (t - r) / 1.8).find((p) => p > 0 && p < 1) ?? 0;
  const bi = beatIndexAt(t);
  const lightning = solo ? Math.max(0, d - 0.3) * (Math.floor(bi / 4) % 2 === 0 ? 1 : 0.6) : 0;
  const bikers = interpolate(t, [28.7, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (t < OUTRO ? 1 : 0);
  const intro = interpolate(t, [1, 2.5, 26, 28.7], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outro = interpolate(t, [OUTRO, OUTRO + 1.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const light = interpolate(t, [278.9, 280.5, 283, 284], [0, 0.6, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}); // "Je deviens lumière"
  const fadeAll = interpolate(t, [0, 1, end - 1.5, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#060508'}}>
      <AbsoluteFill style={{opacity: fadeAll, transform: `translate(${sx}px, ${sy}px) scale(${1 + d * fire * 0.02})`}}>
        <Backdrop />
        <Road />
        <Headlight progress={rush} />
        <BikerPack active={bikers} />
        <GreenRain amount={cold * (1 - fire)} />
        <AbsoluteFill style={{opacity: 0.35 + fire * 0.65}}>
          <Flames />
        </AbsoluteFill>
        <Embers />
        <ChorusTitle opacity={fire * (solo ? 0.5 : 0.9) * (t < OUTRO ? 1 : 0)} />
        <Lightning seed={Math.floor(bi / 2)} strength={lightning} />
        <Brand opacity={1 - outro} />
        <Lyrics />
        <TitleCard opacity={Math.max(intro, outro)} />
        <AbsoluteFill style={{background: '#fff6e0', opacity: strobe + light}} />
      </AbsoluteFill>
      <Audio src={staticFile('audio/mille-feux.mp3')} />
    </AbsoluteFill>
  );
};

export {music};
