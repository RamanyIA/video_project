import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import captions from '../data/captions.json';
import {C, FONT, SPEAKER} from '../theme';

type Page = (typeof captions.pages)[number];

const pageAt = (t: number): Page | undefined => {
  let found: Page | undefined;
  for (const p of captions.pages) {
    if (p.start > t) break;
    found = p;
  }
  // Keep a page on screen through short pauses, but not longer than 0.6 s.
  return found && t <= found.end + 0.6 ? found : undefined;
};

// Karaoke-style captions: words pop in as spoken, current word boxed.
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const page = pageAt(t);
  if (!page) return null;
  const accent = SPEAKER[page.speaker];

  return (
    <div
      style={{
        position: 'absolute',
        top: 1440,
        left: 60,
        right: 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'flex-start',
        gap: '6px 18px',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 84,
        lineHeight: 1.15,
        textTransform: 'uppercase',
      }}
    >
      {page.words.map((w, i) => {
        const startF = Math.round(w.s * fps);
        if (f < startF) return null;
        const pop = spring({frame: f - startF, fps, config: {damping: 11, stiffness: 220}});
        const active = t >= w.s && (t < w.e || i === page.words.length - 1 || t < page.words[i + 1].s);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `scale(${interpolate(pop, [0, 1], [0.4, active ? 1.08 : 1])}) translateY(${interpolate(pop, [0, 1], [30, 0])}px)`,
              color: active ? C.bg : w.k ? accent : C.white,
              background: active ? accent : 'transparent',
              borderRadius: 18,
              padding: '0 14px',
              textShadow: active ? 'none' : '0 6px 0 #000, 0 0 30px #000c',
              WebkitTextStroke: active ? undefined : '3px #000',
              paintOrder: 'stroke fill',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
