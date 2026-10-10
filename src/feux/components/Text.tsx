import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import lyrics from '../data/lyrics.json';
import {beatPulse, downbeatPulse} from '../music';
import {DISPLAY, F, SANS} from '../theme';

const fireText = (size: number): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${F.white} 0%, ${F.fire} 45%, ${F.molten} 75%, ${F.red} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  filter: `drop-shadow(0 ${size * 0.06}px 0 #000) drop-shadow(0 0 ${size * 0.25}px ${F.molten})`,
});

// Channel brand: DJ MILLE + track title.
export const Brand: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = beatPulse(f / fps);
  return (
    <div style={{position: 'absolute', top: 80, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity}}>
      <div style={{fontFamily: DISPLAY, fontSize: 64, letterSpacing: 4, transform: `scale(${1 + b * 0.04})`, transformOrigin: 'left center', ...fireText(64)}}>
        🔥 DJ MILLE
      </div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: F.chrome, border: `3px solid ${F.molten}`,
        padding: '8px 20px', borderRadius: 8, boxShadow: `0 0 20px ${F.molten}88`}}>
        MILLE FEUX
      </div>
    </div>
  );
};

type Line = (typeof lyrics.lines)[number];

const sizeFor = (n: number, chorus: boolean) => (chorus ? (n > 30 ? 92 : 112) : n > 44 ? 64 : n > 32 ? 74 : n > 20 ? 88 : 110);

// Lyrics: heavy caps, words slam in, RGB glitch split on beats, fire gradient on the chorus.
export const Lyrics: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let line: Line | undefined;
  for (const l of lyrics.lines) if (l.start - 0.12 <= t) line = l;
  if (!line || t > line.end + 0.35) return null;
  const chorus = line.part === 'chorus' || line.part === 'outro';
  const words = line.text.split(' ');
  const span = Math.min(1.3, (line.end - line.start) * 0.55);
  const size = sizeFor(line.text.length, chorus);
  const out = interpolate(t, [line.end, line.end + 0.35], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const g = beatPulse(t) * (chorus ? 14 : 6);
  return (
    <div style={{position: 'absolute', top: 1330, left: 40, right: 40, height: 400, display: 'flex', flexWrap: 'wrap', alignContent: 'center',
      justifyContent: 'center', gap: `0 ${size * 0.22}px`, fontFamily: DISPLAY, fontSize: size, lineHeight: 1.05, textTransform: 'uppercase',
      textAlign: 'center', opacity: out}}>
      {words.map((w, i) => {
        const at = line!.start - 0.12 + (i / words.length) * span;
        const k = spring({frame: f - Math.round(at * fps), fps, config: {damping: 9, stiffness: 260}});
        const style: React.CSSProperties = chorus ? fireText(size) : {color: F.white, textShadow: `0 6px 0 #000, 0 0 24px ${F.molten}aa`};
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', transform: `scale(${interpolate(k, [0, 1], [2.2, 1])})`, opacity: Math.min(1, k * 2)}}>
            {g > 1 && (
              <>
                <span style={{position: 'absolute', left: -g, top: 0, color: '#ff0040', opacity: 0.6, mixBlendMode: 'screen'}}>{w}</span>
                <span style={{position: 'absolute', left: g, top: 0, color: '#00e5ff', opacity: 0.6, mixBlendMode: 'screen'}}>{w}</span>
              </>
            )}
            <span style={{position: 'relative', ...style}}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

// Giant flaming MILLE FEUX slammed on the chorus downbeats.
export const ChorusTitle: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = downbeatPulse(f / fps);
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', opacity, transform: `scale(${1 + d * 0.08}) rotate(-3deg)`}}>
      <div style={{fontFamily: DISPLAY, fontSize: 230, lineHeight: 0.95, letterSpacing: 6, ...fireText(230)}}>MILLE</div>
      <div style={{fontFamily: DISPLAY, fontSize: 230, lineHeight: 0.95, letterSpacing: 6, ...fireText(230)}}>FEUX</div>
    </div>
  );
};

// Opening / closing card.
export const TitleCard: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', opacity}}>
      <div style={{fontFamily: DISPLAY, fontSize: 190, lineHeight: 1, letterSpacing: 8, transform: `scale(${1 + Math.sin(f / 6) * 0.02})`, ...fireText(190)}}>
        MILLE FEUX
      </div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 48, letterSpacing: 18, color: F.chrome, marginTop: 20}}>DJ MILLE</div>
    </div>
  );
};
