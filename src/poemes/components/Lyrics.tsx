import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {P, SERIF} from '../theme';

type Line = (typeof lyrics.lines)[number];

const lineIndexAt = (t: number) => {
  let idx = -1;
  for (let i = 0; i < lyrics.lines.length; i++) if (lyrics.lines[i].start - 0.25 <= t) idx = i;
  return idx;
};

const LineView: React.FC<{line: Line; t: number; role: 'current' | 'previous' | 'next'; chorus: boolean}> = ({line, t, role, chorus}) => {
  const appear = interpolate(t, [line.start - 0.5, line.start], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leave = interpolate(t, [line.end + 0.3, line.end + 1.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const size = chorus ? 74 : 64;
  const base: React.CSSProperties = {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontWeight: chorus ? 600 : 500,
    fontSize: role === 'current' ? size : size * 0.62,
    lineHeight: 1.18,
    textAlign: 'center',
    color: P.ink,
    padding: '0 70px',
    transition: 'none',
  };
  if (role === 'next') {
    return <div style={{...base, opacity: 0.35 * appear, marginTop: 26}}>{line.words.map((w) => w.w).join(' ')}</div>;
  }
  if (role === 'previous') {
    return <div style={{...base, opacity: 0.4 * leave, marginBottom: 26}}>{line.words.map((w) => w.w).join(' ')}</div>;
  }
  return (
    <div style={{...base, transform: `translateY(${(1 - appear) * 30}px)`, opacity: Math.max(0.15, appear) * leave}}>
      {line.words.map((w, i) => {
        const lit = interpolate(t, [w.s - 0.08, w.s + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              opacity: 0.28 + lit * 0.72,
              transform: `translateY(${(1 - lit) * 10}px)`,
              color: w.k ? P.rose : P.ink,
              textShadow: lit > 0.5 ? `0 0 26px ${P.pink}, 0 2px 0 #ffffff99` : 'none',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// Karaoke lyrics: current line lights up word by word, neighbours faint above/below.
export const Lyrics: React.FC<{top: number}> = ({top}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const i = lineIndexAt(t);
  if (i < 0) return null;
  const cur = lyrics.lines[i];
  // hide during long instrumental gaps
  if (t > cur.end + 1.6 && (i + 1 >= lyrics.lines.length || lyrics.lines[i + 1].start - t > 0.6)) return null;
  const chorus = cur.section === 'chorus';
  const prev = i > 0 && cur.start - lyrics.lines[i - 1].end < 1.5 ? lyrics.lines[i - 1] : null;
  const next = i + 1 < lyrics.lines.length && lyrics.lines[i + 1].start - cur.end < 2 ? lyrics.lines[i + 1] : null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {prev ? <LineView line={prev} t={t} role="previous" chorus={chorus} /> : <div style={{height: 70}} />}
      <LineView line={cur} t={t} role="current" chorus={chorus} />
      {next && <LineView line={next} t={t} role="next" chorus={chorus} />}
    </div>
  );
};
