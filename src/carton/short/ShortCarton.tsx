import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cardboardBg} from '../components/Cardboard';
import {Placard} from '../components/Gfx';
import {Lyrics} from '../components/Lyrics';
import {FilmLook} from '../components/Shot';
import {downbeatPulse} from '../music';
import {QUADS} from '../storyboard';
import {C, DISPLAY, MARKER, SANS, STENCIL} from '../theme';

// Sober vertical teaser, built for the scroll:
//   A  0-8.7 s   song 159.684 -> 168.414  magic trick on "La poudre de perlimpinpin", then "18 avril 2027"
//   B  8.7 s ->  song 122.044 -> 146.6    "Éh Tonton ! Pa pran nou pou kouyon !" + chorus 2, end card
// Both cuts sit on beats (same tempo), so the splice is seamless. Visuals run in SONG time.
export const A0 = 159.684;
export const A1 = 168.414;
export const B0 = 122.044;
export const B1 = 146.6;
export const shortDuration = (fps: number) => Math.round((A1 - A0) * fps) + Math.round((B1 - B0) * fps);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSongT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
const sp = (f: number, fps: number, at: number, cfg = {damping: 12, stiffness: 200}) => spring({frame: f - Math.round(at * fps), fps, config: cfg});
const ease = (p: number) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, p))) / 2;

type VShot = {t: number; img?: string; gfx?: 'magic' | 'date' | 'end'; fx?: number; s0?: number; s1?: number; placard?: 'p22'; slogan?: string[]; caption?: string};
const SHOTS: VShot[] = [
  // part B (earlier in the song)
  {t: 122.044, img: '22', fx: 0.49, s0: 0.98, s1: 1.04, placard: 'p22', slogan: ['PA PRAN NOU', 'POU KOUYON !']},
  {t: 125.48, img: '24', fx: 0.5},
  {t: 127.68, img: '23', fx: 0.62},
  {t: 129.88, img: '28', fx: 0.55},
  {t: 131.4, img: '26', fx: 0.45},
  {t: 133.72, img: '65', fx: 0.4},
  {t: 135.78, img: '68', fx: 0.45},
  {t: 138.14, img: '39', fx: 0.5},
  {t: 140.3, img: '67', fx: 0.5},
  {t: 142.5, gfx: 'end'},
  // part A (the hook)
  {t: A0, gfx: 'magic'},
  {t: 164.12, gfx: 'date'},
  {t: 166.42, img: '36', fx: 0.55, s0: 1.0, s1: 1.12, caption: 'Les promesses reviennent.'},
];
const POOF = 161.4; // "...pin" of perlimpinpin

const VPhoto: React.FC<{shot: VShot; end: number}> = ({shot, end}) => {
  const {t} = useSongT();
  const k = ease((t - shot.t) / (end - shot.t));
  const s = interpolate(k, [0, 1], [shot.s0 ?? 1.0, shot.s1 ?? 1.08]);
  const W = 3413; // 1920x1080 still at 1920 px high
  const left = -(W - 1080) * (shot.fx ?? 0.5);
  const slogan = shot.placard && shot.slogan;
  const maxLen = slogan ? Math.max(...slogan.map((x) => x.length)) : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left, top: 0, width: W, height: 1920, transform: `scale(${s})`, transformOrigin: `${-left + 540}px 50%`}}>
        <Img src={staticFile(`carton/${shot.img}.jpg`)} style={{width: '100%', height: '100%'}} />
        {slogan && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(1.7778)', transformOrigin: '0 0'}}>
            <Placard quad={QUADS[shot.placard!]} lines={slogan} at={shot.t + 0.1} size={Math.min(150, 1000 / (maxLen * 0.6))} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the hook: a magic trick
const Hat: React.FC = () => (
  <svg width={520} height={480} viewBox="0 0 520 480">
    <defs>
      <linearGradient id="hatbody" x1="0" x2="1">
        <stop offset="0" stopColor="#7a532b" />
        <stop offset="0.45" stopColor="#c9975c" />
        <stop offset="1" stopColor="#6d4824" />
      </linearGradient>
      <pattern id="flute" width="12" height="10" patternUnits="userSpaceOnUse">
        <rect width="2" height="10" fill="rgba(70,40,10,0.18)" />
      </pattern>
    </defs>
    <ellipse cx={260} cy={410} rx={250} ry={60} fill="#8a5f33" />
    <ellipse cx={260} cy={400} rx={250} ry={58} fill="#b9874f" />
    <path d="M90 120 L90 400 Q260 450 430 400 L430 120 Z" fill="url(#hatbody)" />
    <path d="M90 120 L90 400 Q260 450 430 400 L430 120 Z" fill="url(#flute)" />
    <rect x={90} y={330} width={340} height={44} fill={C.hibiscus} />
    <ellipse cx={260} cy={120} rx={170} ry={46} fill="#140c05" />
    <ellipse cx={260} cy={120} rx={170} ry={46} fill="none" stroke="#e2bc86" strokeWidth={6} />
  </svg>
);

const Magic: React.FC<{at: number}> = ({at}) => {
  const {f, fps, t} = useSongT();
  const lt = t - at;
  const tap = Math.max(0, 1 - Math.abs(lt - 0.12) / 0.12);
  const rise = ease((t - 160.0) / 1.0);
  const poofK = t >= POOF ? sp(f, fps, POOF, {damping: 10, stiffness: 220}) : 0;
  const card = t < POOF ? 1 : Math.max(0, 1 - (t - POOF) * 9);
  const wandIn = sp(f, fps, at - 0.25, {damping: 14, stiffness: 160});
  const spot = 0.85 + Math.sin(lt * 3) * 0.05;
  const cols = [C.hibiscus, C.mango, C.turquoise, '#b44cff', C.madrasGreen, '#ff7ac8'];
  const sinceP = t - POOF;
  return (
    <AbsoluteFill style={{background: '#08060a'}}>
      {/* curtains */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, #3a0910 0 70px, #5c0f19 70px 120px, #2a060b 120px 160px)', opacity: 0.55}} />
      {/* spotlight */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 520px 1100px at 50% 18%, rgba(255,238,200,${0.33 * spot}), transparent 70%)`}} />
      <div style={{position: 'absolute', left: 140, right: 140, top: 1160, height: 120, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,230,180,0.35), transparent 70%)'}} />
      {/* rising promise card */}
      {card > 0 && (
        <div style={{position: 'absolute', left: 540 - 210, top: interpolate(rise, [0, 1], [900, 330]) + Math.sin(lt * 4) * 10 * rise, width: 420, height: 270,
          transform: `rotate(${interpolate(rise, [0, 1], [0, -4])}deg) scale(${card * interpolate(rise, [0, 1], [0.6, 1])})`, opacity: rise > 0 ? 1 : 0,
          background: 'linear-gradient(135deg, #fff1b8, #f2c14e 45%, #c98a1a)', borderRadius: 18, boxShadow: `0 0 ${60 + rise * 60}px rgba(255,200,80,0.8)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '6px solid #fff6d0'}}>
          <div style={{fontFamily: STENCIL, fontSize: 82, color: '#5a3a08', letterSpacing: 3}}>PROMESSE</div>
          <div style={{fontFamily: MARKER, fontSize: 40, color: '#8a1520'}}>garantie à vie</div>
        </div>
      )}
      {/* hat */}
      <div style={{position: 'absolute', left: 540 - 260, top: 800, transform: `scale(${1 + tap * 0.04 + poofK * 0.03 * Math.max(0, 1 - sinceP * 2)})`, transformOrigin: '50% 90%'}}>
        <Hat />
      </div>
      {/* wand + gloved hand */}
      <div style={{position: 'absolute', left: 640, top: 620, transformOrigin: '90% 90%', transform: `translate(${(1 - wandIn) * 500}px, ${(1 - wandIn) * 200}px) rotate(${-28 - tap * 18 + (t > POOF ? -10 : 0)}deg)`}}>
        <div style={{position: 'absolute', left: 0, top: 120, width: 330, height: 18, background: '#111', borderRadius: 9, transform: 'rotate(-10deg)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 40, height: 18, background: '#f5f5f5', borderRadius: 9}} />
        </div>
        <div style={{position: 'absolute', left: 300, top: 100, width: 110, height: 90, background: '#fafafa', borderRadius: '45% 45% 40% 40%', boxShadow: 'inset -10px -8px 0 #dcdcdc'}} />
      </div>
      {/* sparkles while the card rises */}
      {new Array(26).fill(0).map((_, i) => {
        const life = ((lt * 1.4 + random(`sp${i}`)) % 1);
        const show = t > 159.8 && t < POOF + 0.2;
        const x = 540 + (random(`sx${i}`) - 0.5) * 520;
        const y = 870 - life * 600 - random(`sy${i}`) * 100;
        return show ? <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 14, transform: `rotate(45deg) scale(${1 - life})`,
          background: '#fff6c8', boxShadow: '0 0 16px #ffd36b', opacity: 1 - life}} /> : null;
      })}
      {/* powder poof */}
      {sinceP > 0 && sinceP < 3 && (
        <AbsoluteFill style={{mixBlendMode: 'screen'}}>
          {new Array(60).fill(0).map((_, i) => {
            const a = random(`pa${i}`) * Math.PI * 2;
            const v = 180 + random(`pv${i}`) * 560;
            const d = (1 - Math.exp(-sinceP * 3)) * v;
            const s = 50 + random(`ps${i}`) * 150 + sinceP * 90;
            return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * d - s / 2, top: 450 + Math.sin(a) * d - s / 2 - sinceP * 60, width: s, height: s, borderRadius: '50%',
              background: cols[i % cols.length], filter: `blur(${14 + sinceP * 12}px)`, opacity: Math.max(0, 0.8 - sinceP * 0.3)}} />;
          })}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: sinceP > 0 ? Math.max(0, 0.6 - sinceP * 3) : 0}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the switch: the real subject
const DateCard: React.FC<{at: number}> = ({at}) => {
  const {f, fps} = useSongT();
  const a = sp(f, fps, at + 0.05, {damping: 16, stiffness: 140});
  const b = sp(f, fps, at + 0.75, {damping: 16, stiffness: 140});
  return (
    <AbsoluteFill style={{background: '#0b0907', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', marginTop: -300}}>
        <div style={{fontFamily: STENCIL, fontSize: 150, lineHeight: 1, color: C.cream, opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>18 AVRIL</div>
        <div style={{fontFamily: STENCIL, fontSize: 210, lineHeight: 1, color: C.cream, opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>2027</div>
        <div style={{width: 140, height: 6, background: C.hibiscus, margin: '40px auto', opacity: b}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: 6, color: C.mango, opacity: b}}>PRÉSIDENTIELLE</div>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{text: string; at: number}> = ({text, at}) => {
  const {f, fps} = useSongT();
  const k = sp(f, fps, at + 0.15, {damping: 16, stiffness: 140});
  return (
    <div style={{position: 'absolute', top: 330, left: 70, right: 70, textAlign: 'center', fontFamily: DISPLAY, fontSize: 104, lineHeight: 1.05, color: C.cream,
      textTransform: 'uppercase', textShadow: '0 6px 0 #000, 0 0 40px rgba(0,0,0,0.9)', opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{text}</div>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{at: number}> = ({at}) => {
  const {f, fps, t} = useSongT();
  const k = sp(f, fps, at, {damping: 14, stiffness: 120});
  const k2 = sp(f, fps, at + 0.7, {damping: 14, stiffness: 120});
  return (
    <AbsoluteFill style={{background: '#0b0907', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 420, width: 860, padding: '50px 40px', ...cardboardBg(C.carton, 18), boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 70px rgba(60,30,8,0.6)',
        transform: `scale(${k}) rotate(-2deg)`, textAlign: 'center'}}>
        <div style={{fontFamily: STENCIL, fontSize: 200, lineHeight: 0.9, color: C.ink}}>1000</div>
        <div style={{fontFamily: STENCIL, fontSize: 92, color: C.ink, letterSpacing: 4}}>PROMESSES</div>
        <div style={{fontFamily: MARKER, fontSize: 92, color: C.hibiscus, transform: 'rotate(-6deg)'}}>en carton</div>
      </div>
      <div style={{position: 'absolute', top: 1110, width: '100%', textAlign: 'center', opacity: k2, transform: `translateY(${(1 - k2) * 30}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: C.cream, letterSpacing: 4}}>LE CLIP COMPLET</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.mango, marginTop: 14, letterSpacing: 3}}>sur la chaîne ▶</div>
      </div>
    </AbsoluteFill>
  );
};

const Stage: React.FC<{rangeEnd: number}> = ({rangeEnd}) => {
  const {t} = useSongT();
  let i = 0;
  SHOTS.forEach((s, k) => {
    if (s.t <= t) i = k;
  });
  const shot = SHOTS[i];
  const end = shot.t < A0 ? (SHOTS[i + 1]?.t ?? rangeEnd) : (SHOTS[i + 1]?.t ?? A1);
  const d = downbeatPulse(t);
  const chorus = t >= 125.48 && t < 142.5;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${chorus ? 1 + d * 0.015 : 1})`}}>
        {shot.gfx === 'magic' && <Magic at={shot.t} />}
        {shot.gfx === 'date' && <DateCard at={shot.t} />}
        {shot.gfx === 'end' && <EndCard at={shot.t} />}
        {shot.img && <VPhoto shot={shot} end={end} />}
      </AbsoluteFill>
      {shot.img && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)'}} />}
      {shot.caption && <Caption text={shot.caption} at={shot.t} />}
      <FilmLook vignette={0.45} />
      <Lyrics hidden={shot.gfx === 'end'} bottom={440} maxWidth={1000} scale={0.95} />
    </AbsoluteFill>
  );
};

export const ShortCarton: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const fA = Math.round((A1 - A0) * fps);
  const a0 = Math.round(A0 * fps);
  const b0 = Math.round(B0 * fps);
  const X = 3; // crossfade frames at the splice
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={fA}>
        <Sequence from={-a0} layout="none">
          <Stage rangeEnd={A1} />
        </Sequence>
      </Sequence>
      <Sequence from={fA}>
        <Sequence from={-b0} layout="none">
          <Stage rangeEnd={B1} />
        </Sequence>
      </Sequence>
      <Sequence durationInFrames={fA + X}>
        <Audio src={staticFile('audio/promesses-carton.mp3')} startFrom={a0}
          volume={(fr) => interpolate(fr, [0, 4, fA - 1, fA + X], [0, 1, 1, 0], clamp)} />
      </Sequence>
      <Sequence from={fA - 1}>
        <Audio src={staticFile('audio/promesses-carton.mp3')} startFrom={b0 - 1}
          volume={(fr) => interpolate(fr, [0, X, durationInFrames - fA - 50, durationInFrames - fA + 1], [0, 1, 1, 0], clamp)} />
      </Sequence>
      <Audio src={staticFile('audio/sfx-magic.wav')} volume={0.55} />
    </AbsoluteFill>
  );
};
