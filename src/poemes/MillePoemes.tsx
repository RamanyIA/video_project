import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DreamDancers, DreamMood} from './components/Dream';
import {Lens} from './components/Lens';
import {Lyrics} from './components/Lyrics';
import {PowderBackground} from './components/PowderBackground';
import {Spectrum} from './components/Spectrum';
import {energyAt} from './music';
import {INTRO_END, OUTRO_START, SHOTS} from './storyboard';
import {P, SANS, SERIF} from './theme';

const fade = (t: number, a: number, b: number, c: number, d: number) =>
  interpolate(t, [a, b, c, d], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const TitleCard: React.FC<{opacity: number; t: number}> = ({opacity, t}) => (
  <div style={{position: 'absolute', top: 1330, left: 0, right: 0, textAlign: 'center', opacity}}>
    <div
      style={{
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: 150,
        color: P.ink,
        letterSpacing: interpolate(t % 1000, [0, 6], [12, 0], {extrapolateRight: 'clamp'}),
        textShadow: `0 0 50px ${P.pink}, 0 4px 0 #ffffff99`,
      }}
    >
      Mille poèmes
    </div>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: 12, color: P.inkSoft, marginTop: 10}}>
      DJ RAMZY-AI
    </div>
  </div>
);

export const MillePoemes: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;
  const e = energyAt(t);

  const intro = fade(t, 1.5, 4, INTRO_END - 3, INTRO_END - 0.5);
  const outro = fade(t, OUTRO_START + 0.5, OUTRO_START + 2.5, end + 10, end + 11);
  const header = fade(t, INTRO_END, INTRO_END + 2, OUTRO_START - 1, OUTRO_START);
  const bloom = Math.min(1, Math.max(0.2, (e - 0.25) * 2));
  const fadeAll = interpolate(t, [0, 1.2, end - 1.2, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: P.mist}}>
      <AbsoluteFill style={{opacity: fadeAll}}>
        <PowderBackground />
        <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', opacity: header}}>
          <span style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: P.ink}}>Mille poèmes</span>
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 10, color: P.inkSoft, marginLeft: 22}}>
            DJ RAMZY-AI
          </span>
        </div>
        <DreamDancers cx={540} cy={790} layer="back" />
        <Lens shots={SHOTS} cx={540} cy={790} size={interpolate(intro, [0, 1], [780, 820])} bloom={bloom} />
        <DreamDancers cx={540} cy={790} layer="front" />
        <DreamMood />
        <TitleCard opacity={Math.max(intro, outro)} t={t} />
        <Lyrics top={1300} />
        <Spectrum top={1690} />
      </AbsoluteFill>
      <Audio src={staticFile('audio/mille-poemes.mp3')} />
    </AbsoluteFill>
  );
};
