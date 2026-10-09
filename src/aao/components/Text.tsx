import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {beatIndexAt, beatPulse, music} from '../music';
import {SHOTS} from '../storyboard';
import {A, DISPLAY, SANS, SCRIPT} from '../theme';

// Title + "world tour" route: a plane flies along the dotted line, one dot per stop.
export const TourBar: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = f / durationInFrames;
  const t = f / fps;
  const stops = SHOTS.filter((s) => s.img !== 'cover');
  return (
    <div style={{position: 'absolute', top: 70, left: 60, right: 60, opacity}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
        <div style={{fontFamily: SCRIPT, fontSize: 64, color: A.gold, textShadow: `0 4px 0 ${A.red}, 0 0 30px ${A.orange}`}}>
          Et ça recommence
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: A.cream}}>DJ RAMZY-AI</div>
      </div>
      <div style={{position: 'relative', height: 60, marginTop: 14}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 28, borderTop: `4px dashed ${A.cream}66`}} />
        <div style={{position: 'absolute', left: 0, width: `${p * 100}%`, top: 28, borderTop: `4px solid ${A.gold}`}} />
        {stops.map((s, i) => {
          const x = s.start / (durationInFrames / fps);
          const on = t >= s.start;
          return (
            <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: 22, width: 16, height: 16, marginLeft: -8, borderRadius: 8,
              background: on ? A.red : '#ffffff44', boxShadow: on ? `0 0 12px ${A.red}` : 'none'}} />
          );
        })}
        <div style={{position: 'absolute', left: `${p * 100}%`, top: -4, marginLeft: -28, fontSize: 52, transform: 'rotate(45deg)'}}>✈️</div>
      </div>
    </div>
  );
};

const sizeFor = (n: number) => (n > 40 ? 70 : n > 28 ? 82 : n > 16 ? 100 : 130);

// Lyric lines: Anton caps, words slam in one by one; backing vocals in gold.
export const Lyrics: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let line: (typeof lyrics.lines)[number] | undefined;
  for (const l of lyrics.lines) if (l.start - 0.15 <= t) line = l;
  if (!line || t > line.end + 0.3) return null;
  const words = line.text.split(' ');
  const span = Math.min(1.4, (line.end - line.start) * 0.6);
  const hot = 'hot' in line && line.hot;
  const size = sizeFor(line.text.length);
  const out = interpolate(t, [line.end, line.end + 0.3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  let backing = false;
  return (
    <div style={{position: 'absolute', top: 1230, left: 50, right: 50, height: 420, display: 'flex', flexWrap: 'wrap',
      alignContent: 'center', justifyContent: 'center', gap: `0 ${size * 0.22}px`, fontFamily: DISPLAY, fontSize: size,
      lineHeight: 1.08, textTransform: 'uppercase', opacity: out, textAlign: 'center'}}>
      {words.map((w, i) => {
        if (w.startsWith('(')) backing = true;
        const isBacking = backing;
        if (w.endsWith(')')) backing = false;
        const at = line!.start - 0.15 + (i / words.length) * span;
        const k = spring({frame: f - Math.round(at * fps), fps, config: {damping: 10, stiffness: 240}});
        const aao = /A-A-O|oh-oh-oh-A/i.test(w);
        const color = isBacking ? A.gold : aao ? A.gold : hot && i % 3 === 1 ? A.red : A.cream;
        return (
          <span key={i} style={{display: 'inline-block', transform: `scale(${k}) rotate(${(1 - k) * -8}deg)`, opacity: Math.min(1, k * 2),
            fontSize: isBacking ? '0.6em' : undefined, alignSelf: 'center', color,
            textShadow: `0 6px 0 ${A.night}, 0 0 30px ${hot ? A.red : A.orange}aa`, WebkitTextStroke: `2px ${A.night}`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

const PATTERNS = [['A', '-', 'A', '-', 'O'], ['AH', ' ', 'OH'], ['O', 'H', 'H', 'H', 'H'], ['OH', ' ', 'AH']];

// Chant sections: giant letters light up one per beat, pattern changes every 8 beats.
export const Chant: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const w = lyrics.chants.find((c) => t >= c.start && t < c.end);
  const busy = lyrics.lines.some((l) => t >= l.start - 0.15 && t < l.end + 0.3);
  if (!w || busy) return null;
  const bi = beatIndexAt(t);
  const pat = PATTERNS[Math.floor(bi / 8) % PATTERNS.length];
  const letters = pat.map((x, i) => ({x, i})).filter((l) => l.x.trim() && l.x !== '-');
  const lit = bi % letters.length;
  const pulse = beatPulse(t);
  const fade = interpolate(t, [w.start, w.start + 0.4, w.end - 0.3, w.end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 1250, left: 0, right: 0, height: 400, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 18, opacity: fade, fontFamily: DISPLAY}}>
      {pat.map((x, i) => {
        const li = letters.findIndex((l) => l.i === i);
        const on = li === lit;
        const sep = x === '-' || !x.trim();
        return (
          <span key={i} style={{fontSize: sep ? 120 : on ? 250 + pulse * 30 : 210, lineHeight: 1, width: sep && !x.trim() ? 40 : undefined,
            color: sep ? A.cream : on ? A.gold : A.cream, opacity: sep ? 0.6 : on ? 1 : 0.55,
            transform: `translateY(${on ? -pulse * 30 : 0}px) rotate(${on ? (i % 2 ? 6 : -6) : 0}deg)`,
            textShadow: on ? `0 10px 0 ${A.red}, 0 0 60px ${A.orange}` : `0 6px 0 ${A.night}`}}>
            {x}
          </span>
        );
      })}
    </div>
  );
};

export const Title: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center', opacity}}>
      <div style={{fontFamily: SCRIPT, fontSize: 130, color: A.gold, transform: `rotate(-4deg) scale(${1 + Math.sin(f / 8) * 0.02})`,
        textShadow: `0 8px 0 ${A.red}, 0 0 50px ${A.orange}`}}>
        Et ça recommence
      </div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 14, color: A.cream, marginTop: 30}}>DJ RAMZY-AI</div>
    </div>
  );
};

export {music};
