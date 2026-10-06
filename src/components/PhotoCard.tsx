import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {PhotoRef} from '../scenes';
import {C} from '../theme';

const SRC_W = 1536;
const SRC_H = 1024;

export const CARD = {x: 50, y: 210, w: 980, h: 1000};

// Photo cropped to `box`, punched in on entry, slow Ken Burns drift afterwards.
export const PhotoCard: React.FC<{photo: PhotoRef; durationInFrames: number; index: number}> = ({photo, durationInFrames, index}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {box} = photo;
  const s = Math.max(CARD.w / box.w, CARD.h / box.h);
  const left = CARD.w / 2 - (box.x + box.w / 2) * s;
  const top = CARD.h / 2 - (box.y + box.h / 2) * s;

  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 120}});
  const punch = interpolate(enter, [0, 1], [1.25, 1]);
  const drift = interpolate(f, [0, durationInFrames], [1, 1.12]);
  const pan = (index % 2 === 0 ? 1 : -1) * interpolate(f, [0, durationInFrames], [0, 30]);
  const tilt = interpolate(enter, [0, 1], [index % 2 === 0 ? -4 : 4, 0]);
  const flash = interpolate(f, [0, 4], [0.7, 0], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: 56,
        overflow: 'hidden',
        transform: `rotate(${tilt}deg) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
        boxShadow: `0 0 0 5px ${index % 2 === 0 ? C.blue : C.red}, 0 0 80px ${index % 2 === 0 ? C.blue : C.red}aa, 0 40px 80px #000a`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `scale(${punch * drift}) translateX(${pan}px)`}}>
        <Img
          src={staticFile(photo.src)}
          style={{position: 'absolute', left, top, width: SRC_W * s, height: SRC_H * s, maxWidth: 'none'}}
        />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0000 55%, #050816ee 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'white', opacity: flash}} />
    </div>
  );
};
