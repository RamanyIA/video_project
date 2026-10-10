import React from 'react';
import {Composition} from 'remotion';
import captions from './data/captions.json';
import {CaRecommence} from './aao/CaRecommence';
import aaoMusic from './aao/data/music.json';
import feuxMusic from './feux/data/music.json';
import {MilleFeux} from './feux/MilleFeux';
import {MillePoemes} from './poemes/MillePoemes';
import {Podcast, podcastDuration} from './podcast/Podcast';
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
    <Composition
      id="CaRecommence"
      component={CaRecommence}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.floor(aaoMusic.duration * FPS)}
    />
    <Composition
      id="MilleFeux"
      component={MilleFeux}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.floor(feuxMusic.duration * FPS)}
    />
    <Composition id="Podcast" component={Podcast} width={1080} height={1920} fps={FPS} durationInFrames={podcastDuration(FPS)} />
  </>
);
