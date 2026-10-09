import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Particles, Postcard} from './components/Stage';
import {Chant, Lyrics, Title, TourBar} from './components/Text';
import {downbeatPulse, energyAt} from './music';
import {INTRO_END, OUTRO_START} from './storyboard';

export const CaRecommence: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = f / fps;
  const end = durationInFrames / fps;
  const e = energyAt(t);
  const down = downbeatPulse(t);
  // camera shake on downbeats when the track is hot
  const shake = e > 0.6 ? down * 8 : 0;
  const sx = Math.sin(f * 2.3) * shake;
  const sy = Math.cos(f * 1.7) * shake;
  const intro = interpolate(t, [0.5, 1.5, INTRO_END - 6.5, INTRO_END - 6], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outro = interpolate(t, [OUTRO_START + 0.5, OUTRO_START + 1.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeAll = interpolate(t, [0, 0.6, end - 1.2, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#1a0620'}}>
      <AbsoluteFill style={{opacity: fadeAll, transform: `translate(${sx}px, ${sy}px)`}}>
        <Backdrop />
        <Particles />
        <Postcard />
        <TourBar opacity={1 - outro} />
        <Lyrics />
        <Chant />
        <Title opacity={Math.max(intro, outro)} />
      </AbsoluteFill>
      <Audio src={staticFile('audio/ca-recommence.mp3')} />
    </AbsoluteFill>
  );
};
