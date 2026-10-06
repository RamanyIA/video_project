import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {Graphic} from './components/Graphics';
import {PhotoCard} from './components/PhotoCard';
import {TopBar} from './components/TopBar';
import {SCENES} from './scenes';

export const Short: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#050816'}}>
      <Background />
      {SCENES.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const to = i + 1 < SCENES.length ? Math.round(SCENES[i + 1].start * fps) : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} name={`${i} ${scene.graphic} ${scene.title ?? ''}`}>
            <PhotoCard photo={scene.photo} durationInFrames={to - from} index={i} />
            <Graphic scene={scene} />
          </Sequence>
        );
      })}
      <TopBar />
      <Captions />
      <Audio src={staticFile('audio/jev.m4a')} />
    </AbsoluteFill>
  );
};
