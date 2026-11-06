import React from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {beatPulse} from '../music';
import {C, DISPLAY, MARKER, SANS, STENCIL} from '../theme';
import {cardboardBg, tornClip} from './Cardboard';

type Line = (typeof lyrics.lines)[number];
const LINES = lyrics.lines as Line[];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const isChorus = (p: string) => p.startsWith('refrain');
const LEAD_IN = 0.25; // strip arrives slightly before the first sung word
const HOLD = 0.6; // and stays a little after the last one

// Lines visible at t (a line stays until the next one arrives, max HOLD after its end).
const activeLine = (t: number) => {
  let cur: Line | undefined;
  let idx = -1;
  LINES.forEach((l, i) => {
    if (l.start - LEAD_IN <= t) {
      cur = l;
      idx = i;
    }
  });
  if (!cur) return null;
  const next = LINES[idx + 1];
  const until = Math.min(cur.end + HOLD, next ? next.start - LEAD_IN : Infinity);
  if (t > until + 0.25) return null;
  return {line: cur, idx, until};
};

// Karaoke on a torn cardboard strip: every word is stamped in ink exactly when it is sung,
// the current word gets a mango marker swipe; Creole lines carry their French translation.
export const Lyrics: React.FC<{hidden?: boolean}> = ({hidden}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const a = activeLine(t);
  if (!a || hidden) return null;
  const {line, idx, until} = a;
  const chorus = isChorus(line.part);
  const inK = spring({frame: f - Math.round((line.start - LEAD_IN) * fps), fps, config: {damping: 14, stiffness: 170}});
  const out = interpolate(t, [until, until + 0.25], [1, 0], clamp);
  const len = line.text.length;
  const size = chorus ? (len > 34 ? 66 : 78) : len > 40 ? 54 : len > 28 ? 62 : 72;
  const tilt = (random(`tilt${idx}`) - 0.5) * 2.2;
  const b = beatPulse(t);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: out, transform: `translateY(${(1 - inK) * 160}px) rotate(${tilt}deg)`}}>
      <div style={{position: 'relative', padding: `${size * 0.32}px ${size * 0.7}px`, maxWidth: 1650}}>
        <div style={{position: 'absolute', inset: 0, ...cardboardBg(chorus ? C.cartonLight : C.carton), clipPath: tornClip(`l${idx}`, 5),
          filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.6))'}} />
        <div style={{position: 'absolute', inset: 0, clipPath: tornClip(`l${idx}`, 5), boxShadow: 'inset 0 0 50px rgba(70,35,8,0.6)'}} />
        {chorus && <Tape side="left" seed={idx} />}
        {chorus && <Tape side="right" seed={idx + 7} />}
        <div style={{position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.34}px`,
          fontFamily: chorus ? STENCIL : DISPLAY, fontSize: size, lineHeight: 1.12, textTransform: 'uppercase', letterSpacing: chorus ? 1 : 2}}>
          {line.words.map((w, i) => {
            const sung = t >= w.s - 0.04;
            const current = sung && t < w.e + 0.08;
            const k = spring({frame: f - Math.round((w.s - 0.04) * fps), fps, config: {damping: 10, stiffness: 320}});
            const swipe = interpolate(t, [w.s - 0.04, Math.min(w.e, w.s + 0.25)], [0, 100], clamp);
            return (
              <span key={i} style={{position: 'relative', display: 'inline-block',
                transform: sung ? `scale(${interpolate(k, [0, 1], [1.15, 1]) + (current ? b * 0.03 : 0)}) rotate(${current ? -2 : 0}deg)` : undefined, transformOrigin: '50% 60%'}}>
                {sung && (
                  <span style={{position: 'absolute', left: -5, right: -5, top: '18%', bottom: '8%',
                    background: chorus ? C.hibiscus : C.mango, opacity: current ? 0.9 : 0.0,
                    clipPath: `inset(0 ${100 - swipe}% 0 0)`, borderRadius: 6, transform: 'skewX(-8deg)'}} />
                )}
                <span style={{position: 'relative', color: sung ? (current && chorus ? C.cream : C.ink) : 'rgba(40,22,8,0.30)',
                  textShadow: sung ? '0 1px 0 rgba(255,230,190,0.35)' : 'none'}}>{w.w}</span>
              </span>
            );
          })}
        </div>
      </div>
      {line.tr && (
        <div style={{marginTop: 14, fontFamily: SANS, fontStyle: 'italic', fontWeight: 600, fontSize: 30, color: C.cream,
          textShadow: '0 2px 6px #000, 0 0 18px #000', opacity: interpolate(t, [line.start, line.start + 0.4], [0, 0.95], clamp)}}>
          « {line.tr} »
        </div>
      )}
    </div>
  );
};

const Tape: React.FC<{side: 'left' | 'right'; seed: number}> = ({side, seed}) => (
  <div style={{position: 'absolute', top: -16, [side]: -26, width: 120, height: 40, transform: `rotate(${side === 'left' ? -28 : 24}deg)`,
    background: `repeating-linear-gradient(90deg, ${C.hibiscus} 0 14px, ${C.mango} 14px 22px, ${C.madrasGreen} 22px 30px, ${C.mango} 30px 34px)`,
    opacity: 0.88, boxShadow: '0 3px 6px rgba(0,0,0,0.35)', clipPath: tornClip(`tape${seed}`, 3, 10)}} />
);

// Choir answers "(Tonton !)", "(Sé nou !)", "(BOUM !)": red rubber stamps slammed onto the frame.
export const Responses: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const items: React.ReactNode[] = [];
  LINES.forEach((l, li) => l.resp.forEach((r, ri) => {
    const dur = Math.max(0.9, r.end - r.start + 0.6);
    if (t < r.start - 0.05 || t > r.start + dur) return;
    const k = spring({frame: f - Math.round((r.start - 0.05) * fps), fps, config: {damping: 9, stiffness: 400}});
    const op = interpolate(t, [r.start + dur - 0.25, r.start + dur], [1, 0], clamp);
    const big = /BOUM|HÉ/.test(r.text);
    const side = (li + ri) % 2 === 0;
    const rot = (random(`r${li}${ri}`) - 0.5) * 22;
    items.push(
      <div key={`${li}-${ri}`} style={{position: 'absolute', top: big ? 300 : 120 + (ri % 2) * 40, [side ? 'right' : 'left']: big ? 760 - (side ? 0 : 0) : 110,
        transform: `scale(${interpolate(k, [0, 1], [2.6, 1])}) rotate(${rot}deg)`, opacity: Math.min(1, k * 3) * op, textAlign: 'center'}}>
        <div style={{fontFamily: big ? DISPLAY : MARKER, fontSize: big ? 190 : 84, color: C.red, padding: big ? '0 40px' : '6px 30px',
          border: big ? 'none' : `8px solid ${C.red}`, borderRadius: 18, textTransform: 'uppercase', letterSpacing: big ? 8 : 2,
          background: big ? 'transparent' : 'rgba(255,243,220,0.86)', boxShadow: big ? 'none' : '0 8px 24px rgba(0,0,0,0.45)',
          textShadow: big ? `0 0 40px ${C.mango}, 0 10px 0 #000` : 'none', WebkitTextStroke: big ? `4px ${C.cream}` : undefined}}>
          {r.text}
        </div>
        {r.tr && <div style={{fontFamily: SANS, fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: C.cream, marginTop: 8, textShadow: '0 2px 6px #000'}}>« {r.tr} »</div>}
      </div>,
    );
  }));
  return <>{items}</>;
};

// Chapter card in the top-left corner at each new section of the song.
export const Chapter: React.FC<{title: string; sub?: string; start: number}> = ({title, sub, start}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  if (t < start || t > start + 5) return null;
  const k = spring({frame: f - Math.round(start * fps), fps, config: {damping: 15}});
  const out = interpolate(t, [start + 4.2, start + 5], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 60, left: 70, opacity: out, transform: `translateX(${(1 - k) * -500}px) rotate(-2deg)`}}>
      <div style={{...cardboardBg(C.carton), clipPath: tornClip(title, 6, 14), padding: '14px 34px 12px'}}>
        <div style={{fontFamily: STENCIL, fontSize: 44, color: C.ink, letterSpacing: 3, textTransform: 'uppercase'}}>{title}</div>
        {sub && <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.hibiscus, letterSpacing: 4, textTransform: 'uppercase'}}>{sub}</div>}
      </div>
    </div>
  );
};
