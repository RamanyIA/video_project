import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {cardboardBg, quadMatrix, tornClip} from '../components/Cardboard';
import {Placard} from '../components/Gfx';
import {Lyrics, Responses} from '../components/Lyrics';
import {FilmLook} from '../components/Shot';
import {beatPulse, downbeatPulse} from '../music';
import {QUADS} from '../storyboard';
import {C, DISPLAY, MARKER, SANS, STENCIL} from '../theme';

// Vertical teaser for the main clip: song excerpt 109.2 s -> 147.5 s ("Qui fait les lois ?" + chorus 2),
// each sung line re-headlined with the 2027 presidential campaign, then an end card pointing to the clip.
// Everything below runs in SONG time (the Sequence is shifted), so lyrics/beat data are reused as-is.
export const SHORT_FROM = 109.2;
export const SHORT_TO = 147.5;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSongT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
const sp = (f: number, fps: number, at: number, cfg = {damping: 12, stiffness: 200}) => spring({frame: f - Math.round(at * fps), fps, config: cfg});

type VShot = {t: number; img?: string; gfx?: 'ballot' | 'boxes' | 'end'; fx?: number; s0?: number; s1?: number; placard?: 'p22' | 'p29'; slogan?: string[]};
const SHOTS: VShot[] = [
  {t: 109.2, gfx: 'ballot'},
  {t: 112.28, img: '21', fx: 0.45, s0: 1.0, s1: 1.12},
  {t: 114.42, img: '23', fx: 0.62, s0: 1.12, s1: 1.0},
  {t: 116.22, img: '34', fx: 0.5, s0: 1.0, s1: 1.15},
  {t: 118.4, img: '61', fx: 0.3, s0: 1.1, s1: 1.0},
  {t: 122.1, img: '31', fx: 0.36, s0: 1.15, s1: 1.0},
  {t: 125.48, gfx: 'boxes'},
  {t: 129.88, img: '28', fx: 0.55, s0: 1.0, s1: 1.12},
  {t: 131.4, img: '09', fx: 0.4, s0: 1.1, s1: 1.0},
  {t: 133.72, img: '36', fx: 0.55, s0: 1.0, s1: 1.15},
  {t: 135.78, img: '41', fx: 0.5, s0: 1.12, s1: 1.0},
  {t: 138.14, img: '39', fx: 0.5, s0: 1.0, s1: 1.12},
  {t: 140.3, img: '22', fx: 0.49, s0: 0.98, s1: 1.04, placard: 'p22', slogan: ['18 AVRIL :', 'PAS EN CARTON !']},
  {t: 142.5, gfx: 'end'},
];

// "Version 2027": every sung line gets its campaign headline.
const HEADLINES: {at: number; kicker: string; text: string}[] = [
  {at: 112.28, kicker: 'VERSION 2027', text: 'Qui fera les lois après le 2 mai ?'},
  {at: 114.42, kicker: 'VIE CHÈRE · MANIFS', text: 'Qui paie la note ?'},
  {at: 116.22, kicker: 'ÉLYSÉE', text: 'Un seul fauteuil, beaucoup d’appétits'},
  {at: 118.4, kicker: 'ET NOUS ?', text: 'Les miettes, comme d’hab'},
  {at: 122.1, kicker: 'FIN DE MANDAT', text: 'Tonton ne peut pas se représenter… ses promesses, si'},
  {at: 129.88, kicker: 'À DROITE · À GAUCHE', text: 'Primaire ? Union ? Coalition ? Pani pwoblèm !'},
  {at: 133.72, kicker: 'COÛT DE LA VIE', text: 'Toujours la première question'},
  {at: 135.78, kicker: 'CAMPAGNE', text: 'Meetings, plateaux, pubs ciblées…'},
  {at: 138.14, kicker: '1ER TOUR · 18 AVRIL 2027', text: 'Mille tons. Un seul bulletin.'},
  {at: 140.3, kicker: '', text: ''}, // let the placard speak
];

const VPhoto: React.FC<{shot: VShot; end: number}> = ({shot, end}) => {
  const {t} = useSongT();
  const p = Math.min(1, Math.max(0, (t - shot.t) / (end - shot.t)));
  const k = 0.5 - Math.cos(Math.PI * p) / 2;
  const s = interpolate(k, [0, 1], [shot.s0 ?? 1, shot.s1 ?? 1.1]);
  const W = 3413; // 1920x1080 still scaled to 1920 high
  const left = -(W - 1080) * (shot.fx ?? 0.5);
  const slogan = shot.placard && shot.slogan;
  const maxLen = slogan ? Math.max(...slogan.map((x) => x.length)) : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left, top: 0, width: W, height: 1920, transform: `scale(${s})`, transformOrigin: `${-left + 540}px 50%`}}>
        <Img src={staticFile(`carton/${shot.img}.jpg`)} style={{width: '100%', height: '100%', filter: 'contrast(1.12) saturate(0.92)'}} />
        {slogan && (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(1.7778)', transformOrigin: '0 0'}}>
            <Placard quad={QUADS[shot.placard!]} lines={slogan} at={shot.t + 0.1} size={Math.min(150, 1000 / (maxLen * 0.6))} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Hook: a cardboard ballot box swallowing the envelopes.
const Ballot: React.FC<{at: number}> = ({at}) => {
  const {f, fps, t} = useSongT();
  const k = sp(f, fps, at, {damping: 10, stiffness: 160});
  const d = downbeatPulse(t);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #3a2412 0%, ${C.night} 70%)`, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', transform: `scale(${sp(f, fps, at + 0.15, {damping: 9, stiffness: 300})})`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: 12, color: C.mango}}>PRÉSIDENTIELLE</div>
        <div style={{fontFamily: STENCIL, fontSize: 230, lineHeight: 0.95, color: C.cream, textShadow: '0 10px 0 #000'}}>2027</div>
      </div>
      {[0, 1, 2, 3, 4].map((i) => {
        const lt = (t - at - 0.5 - i * 0.45) / 0.7;
        if (lt < 0 || lt > 1) return null;
        return <div key={i} style={{position: 'absolute', left: 540 - 110 + (random(`e${i}`) - 0.5) * 120, top: 420 + lt * 330, width: 220, height: 140, background: '#f2ead8',
          transform: `rotate(${(random(`er${i}`) - 0.5) * 50 * (1 - lt)}deg)`, boxShadow: '0 10px 20px rgba(0,0,0,0.5)', clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)',
          backgroundImage: 'linear-gradient(155deg, transparent 49%, #d8cdb6 50%, transparent 51%), linear-gradient(25deg, transparent 49%, #d8cdb6 50%, transparent 51%)'}} />;
      })}
      <div style={{position: 'absolute', top: 700, left: 140, width: 800, height: 560, ...cardboardBg(C.carton, 18), boxShadow: '0 50px 90px rgba(0,0,0,0.8), inset 0 0 80px rgba(60,30,8,0.7)',
        transform: `translateY(${(1 - k) * 1200}px) scale(${1 + d * 0.02})`, borderRadius: 8}}>
        <div style={{position: 'absolute', left: 230, right: 230, top: 40, height: 26, background: '#140c05', borderRadius: 13}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
          <div style={{fontFamily: STENCIL, fontSize: 130, color: C.ink}}>URNE</div>
          <div style={{fontFamily: MARKER, fontSize: 64, color: C.hibiscus, transform: 'rotate(-5deg)'}}>en carton</div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.ink, marginTop: 24}}>18 AVRIL · 2 MAI 2027</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Chorus: the candidates' boxes are delivered (alphabetical, declared or expected).
const NAMES = ['ATTAL', 'GLUCKSMANN', 'LE PEN', 'MÉLENCHON', 'PHILIPPE', 'RETAILLEAU', 'ROUSSEL', 'TONDELIER'];
const Boxes: React.FC<{at: number}> = ({at}) => {
  const {f, fps, t} = useSongT();
  const b = beatPulse(t);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #1a120b 0%, #2c1d10 60%, #120c07 100%)`}}>
      <div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', opacity: sp(f, fps, at)}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 32, letterSpacing: 8, color: C.mango}}>CANDIDATS DÉCLARÉS OU PRESSENTIS</div>
        <div style={{fontFamily: DISPLAY, fontSize: 92, color: C.cream, lineHeight: 1.05, marginTop: 8}}>LIVRAISON DES PROMESSES</div>
      </div>
      {NAMES.map((n, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const k = sp(f, fps, at + 0.15 + i * 0.32, {damping: 11, stiffness: 180});
        const rot = (random(`bx${i}`) - 0.5) * 8;
        return (
          <div key={n} style={{position: 'absolute', left: 70 + col * 480, top: 380 + row * 172, width: 460, height: 156, ...cardboardBg(i % 3 === 0 ? C.cartonLight : C.carton, 14),
            boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 0 50px rgba(60,30,8,0.6)', transform: `translateY(${(1 - k) * -1500}px) rotate(${rot + (row % 2 ? b * 1.5 : -b * 1.5)}deg)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{position: 'absolute', top: 0, bottom: 0, left: 205, width: 50, background: 'rgba(200,170,120,0.55)'}} />
            <div style={{position: 'relative', fontFamily: STENCIL, fontSize: n.length > 9 ? 52 : 64, color: C.ink}}>{n}</div>
            <div style={{position: 'relative', fontFamily: MARKER, fontSize: 30, color: C.hibiscus, transform: 'rotate(-4deg)'}}>promesses · fragile</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// End card: push to the full clip.
const EndCard: React.FC<{at: number}> = ({at}) => {
  const {f, fps, t} = useSongT();
  const k = sp(f, fps, at, {damping: 12, stiffness: 140});
  const arrow = Math.sin((t - at) * 8) * 18;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #3b2412, ${C.night} 72%)`, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 300, width: 900, padding: '50px 40px', ...cardboardBg(C.carton, 18), boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 70px rgba(60,30,8,0.6)',
        transform: `scale(${k}) rotate(-2deg)`, textAlign: 'center'}}>
        <div style={{fontFamily: STENCIL, fontSize: 210, lineHeight: 0.9, color: C.ink}}>1000</div>
        <div style={{fontFamily: STENCIL, fontSize: 96, color: C.ink, letterSpacing: 4}}>PROMESSES</div>
        <div style={{fontFamily: MARKER, fontSize: 96, color: C.hibiscus, transform: 'rotate(-6deg)'}}>en carton</div>
      </div>
      <div style={{position: 'absolute', top: 1010, width: '100%', textAlign: 'center', opacity: sp(f, fps, at + 0.6)}}>
        <div style={{display: 'inline-block', background: C.red, color: '#fff', fontFamily: DISPLAY, fontSize: 84, padding: '10px 44px', borderRadius: 16, letterSpacing: 3,
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)'}}>▶ LE CLIP COMPLET</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: C.cream, marginTop: 26, letterSpacing: 4}}>SUR LA CHAÎNE</div>
        <div style={{fontSize: 90, color: C.mango, transform: `translateY(${arrow}px)`, marginTop: 6}}>⬇</div>
      </div>
      <div style={{position: 'absolute', top: 1390, left: 90, right: 90, textAlign: 'center', fontFamily: MARKER, fontSize: 50, color: C.cream, opacity: sp(f, fps, at + 1.4),
        transform: 'rotate(-2deg)'}}>
        Qui va livrer ses promesses ? Dis-le en commentaire
      </div>
    </AbsoluteFill>
  );
};

const Headline: React.FC = () => {
  const {f, fps, t} = useSongT();
  let h: (typeof HEADLINES)[number] | undefined;
  let next = Infinity;
  HEADLINES.forEach((x, i) => {
    if (x.at <= t) {
      h = x;
      next = HEADLINES[i + 1]?.at ?? Infinity;
    }
  });
  const shotChange = SHOTS.find((s) => s.gfx && s.t > (h?.at ?? 0))?.t ?? Infinity;
  if (!h || !h.text || t >= Math.min(next, shotChange)) return null;
  const words = h.text.split(' ');
  const kick = sp(f, fps, h.at, {damping: 10, stiffness: 260});
  return (
    <div style={{position: 'absolute', top: 230, left: 60, right: 60}}>
      <div style={{display: 'inline-block', background: C.red, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: 6, padding: '8px 22px',
        transform: `translateX(${(1 - kick) * -700}px) rotate(-2deg)`, boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}>{h.kicker}</div>
      <div style={{marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: '0 22px', fontFamily: DISPLAY, fontSize: h.text.length > 34 ? 84 : 100, lineHeight: 1.05,
        textTransform: 'uppercase', color: C.cream, textShadow: '0 8px 0 #000, 0 0 30px rgba(0,0,0,0.8)'}}>
        {words.map((w, i) => {
          const k = sp(f, fps, h!.at + 0.12 + i * 0.07, {damping: 9, stiffness: 320});
          return <span key={i} style={{display: 'inline-block', transform: `scale(${interpolate(k, [0, 1], [1.8, 1])})`, opacity: Math.min(1, k * 2)}}>{w}</span>;
        })}
      </div>
    </div>
  );
};

const Stage: React.FC = () => {
  const {f, t} = useSongT();
  let i = 0;
  SHOTS.forEach((s, k) => {
    if (s.t <= t) i = k;
  });
  const shot = SHOTS[i];
  const end = SHOTS[i + 1]?.t ?? SHORT_TO;
  const hotT = t >= 125.48 && t < 142.5;
  const d = downbeatPulse(t);
  const punch = hotT ? 1 + d * 0.04 : 1 + d * 0.012;
  const flash = interpolate(t, [shot.t, shot.t + 0.12], [shot.gfx ? 0.6 : 0.25, 0], clamp);
  const isEnd = shot.gfx === 'end';
  return (
    <AbsoluteFill style={{background: C.night}}>
      <AbsoluteFill style={{transform: `scale(${punch}) translate(${Math.sin(f * 2.3) * d * (hotT ? 6 : 0)}px, 0)`}}>
        {shot.gfx === 'ballot' && <Ballot at={shot.t} />}
        {shot.gfx === 'boxes' && <Boxes at={shot.t} />}
        {isEnd && <EndCard at={shot.t} />}
        {shot.img && <VPhoto shot={shot} end={end} />}
      </AbsoluteFill>
      {shot.img && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,6,3,0.85) 0%, rgba(10,6,3,0.2) 32%, transparent 55%, rgba(10,6,3,0.55) 100%)'}} />}
      <FilmLook vignette={0.5} />
      <Headline />
      {!isEnd && <Responses top={shot.gfx === 'boxes' ? 1000 : 820} />}
      {/* top badge */}
      {!isEnd && (
        <div style={{position: 'absolute', top: 90, left: 60, ...cardboardBg(C.carton), clipPath: tornClip('badge', 6, 10), padding: '10px 26px',
          fontFamily: STENCIL, fontSize: 34, color: C.ink, letterSpacing: 2}}>
          1000 PROMESSES EN CARTON
        </div>
      )}
      <Lyrics hidden={isEnd} bottom={430} maxWidth={1000} scale={0.95} />
      <AbsoluteFill style={{background: C.cream, opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

export const ShortCarton: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const off = Math.round(SHORT_FROM * fps);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Sequence from={-off} layout="none">
        <Stage />
      </Sequence>
      <Audio src={staticFile('audio/promesses-carton.mp3')} startFrom={off}
        volume={(fr) => interpolate(fr, [0, 8, durationInFrames - 60, durationInFrames], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};

export {quadMatrix};
