import React from 'react';
import {Composition} from 'remotion';
import captions from './data/captions.json';
import {MillePoemes} from './poemes/MillePoemes';
import music from './poemes/data/music.json';
import {OUTRO_TAIL} from './scenes';
import {Short} from './Short';

export const FPS = 30;

export const Root: React.FC = () => (
  <>
    <Composition
      id="Short"
      component={Short}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((captions.duration + OUTRO_TAIL) * FPS)}
    />
    <Composition
      id="MillePoemes"
      component={MillePoemes}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.floor(music.duration * FPS)}
    />
  </>
);
