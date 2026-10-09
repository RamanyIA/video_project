import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {P, SERIF, TAMIL} from '../theme';

const isTamil = (s: string) => /[஀-௿]/.test(s);

type Token = {w: string; backing: boolean; hl: boolean};

// Split a line into words, flagging backing vocals "(…)" and the title words.
const tokenize = (text: string): Token[] => {
  const out: Token[] = [];
  let backing = false;
  for (const raw of text.split(' ')) {
    if (raw.startsWith('(')) backing = true;
    const w = raw;
    out.push({w, backing, hl: /^(mille|poèmes)/i.test(w.replace(/[^\p{L}]/gu, '') ) && /mille poèmes/i.test(text)});
    if (raw.endsWith(')')) backing = false;
  }
  return out;
};

const sizeFor = (text: string, big: boolean, tamil: boolean) => {
  if (big) return 124;
  const n = text.length;
  if (tamil) return n > 45 ? 50 : n > 30 ? 56 : 64;
  return n > 46 ? 58 : n > 32 ? 66 : n > 20 ? 76 : 88;
};

// One lyric line at a time: words drift up and fade in one after another,
// the line dissolves upwards when the next one starts or it ends.
export const Lyrics: React.FC<{top: number}> = ({top}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let line: (typeof lyrics.lines)[number] | undefined;
  for (const l of lyrics.lines) if (l.start - 0.3 <= t) line = l;
  if (!line || t > line.end + 0.6) return null;

  const tamil = isTamil(line.text);
  const tokens = tokenize(line.text);
  const span = Math.min(1.8, (line.end - line.start) * 0.55);
  const out = interpolate(t, [line.end, line.end + 0.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const size = sizeFor(line.text, line.big, tamil);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        height: 330,
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
        justifyContent: 'center',
        gap: `0 ${size * 0.26}px`,
        fontFamily: tamil ? TAMIL : SERIF,
        fontStyle: 'italic',
        fontWeight: line.big ? 700 : 500,
        fontSize: size,
        lineHeight: tamil ? 1.45 : 1.2,
        opacity: out,
        transform: `translateY(${(1 - out) * -40}px)`,
        textAlign: 'center',
      }}
    >
      {tokens.map((tk, i) => {
        const at = line!.start - 0.3 + (i / tokens.length) * span;
        const k = interpolate(t, [at, at + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const color = line!.big || tk.hl ? P.rose : tk.backing ? P.inkSoft : P.ink;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: k * (tk.backing ? 0.75 : 1),
              transform: `translateY(${(1 - k) * 24}px)`,
              fontSize: tk.backing ? '0.72em' : undefined,
              fontWeight: tk.hl ? 700 : undefined,
              color,
              textShadow: `0 0 30px ${P.mist}, 0 0 60px ${line!.big || tk.hl ? P.pink : '#ffffff'}`,
            }}
          >
            {tk.w}
          </span>
        );
      })}
    </div>
  );
};
