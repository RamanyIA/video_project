import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {P, SERIF} from '../theme';

// One lyric line at a time: words drift up and fade in one after another,
// the line dissolves upwards when it ends. "big" lines are chorus titles.
export const Lyrics: React.FC<{top: number}> = ({top}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const line = lyrics.lines.find((l) => t >= l.start - 0.4 && t < l.end + 0.5);
  if (!line) return null;
  const big = 'big' in line && line.big;
  const words = line.text.split(' ');
  const span = Math.min(1.6, (line.end - line.start) * 0.5);
  const out = interpolate(t, [line.end - 0.1, line.end + 0.5], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: big ? '0 28px' : '0 18px',
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontWeight: big ? 700 : 500,
        fontSize: big ? 118 : line.text.length > 34 ? 62 : 72,
        lineHeight: 1.2,
        color: P.ink,
        opacity: out,
        transform: `translateY(${(1 - out) * -40}px)`,
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => {
        const at = line.start - 0.4 + (i / words.length) * span;
        const k = interpolate(t, [at, at + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: k,
              transform: `translateY(${(1 - k) * 24}px)`,
              color: big ? P.rose : P.ink,
              textShadow: `0 0 30px ${P.mist}, 0 0 60px ${big ? P.pink : '#ffffff'}`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
