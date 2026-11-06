import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {beatPulse, downbeatPulse} from '../music';
import {C, DISPLAY, MARKER, SANS, STENCIL} from '../theme';
import {cardboardBg, quadMatrix, tornClip} from './Cardboard';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f, fps, t: f / fps};
};
const sp = (f: number, fps: number, at: number, cfg = {damping: 12, stiffness: 200}) => spring({frame: f - Math.round(at * fps), fps, config: cfg});

// ------------------------------------------------------------------ title card: a box opens
export const TitleBox: React.FC<{at: number; out: number}> = ({at, out}) => {
  const {f, fps, t} = useT();
  const open = sp(f, fps, at + 0.4, {damping: 13, stiffness: 90});
  const words = sp(f, fps, at + 1.0, {damping: 10, stiffness: 160});
  const fade = interpolate(t, [out - 0.6, out], [1, 0], clamp);
  const d = downbeatPulse(t);
  return (
    <AbsoluteFill style={{opacity: fade, alignItems: 'center', justifyContent: 'center', perspective: 1400}}>
      <div style={{position: 'relative', width: 1180, height: 520, transform: `rotateX(14deg) scale(${1 + d * 0.015})`, transformStyle: 'preserve-3d'}}>
        {/* box body */}
        <div style={{position: 'absolute', inset: 0, ...cardboardBg(C.carton, 18), boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 0 70px rgba(70,35,8,0.6)', borderRadius: 6}} />
        {/* flaps */}
        {(['top', 'bottom'] as const).map((s) => (
          <div key={s} style={{position: 'absolute', left: 0, right: 0, height: 260, [s]: -1, transformOrigin: s === 'top' ? '50% 0%' : '50% 100%',
            transform: `rotateX(${(s === 'top' ? 1 : -1) * interpolate(open, [0, 1], [0, 118])}deg)`, ...cardboardBg(C.cartonDark, 18),
            boxShadow: 'inset 0 0 50px rgba(40,20,4,0.7)', backfaceVisibility: 'visible'}} />
        ))}
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: open, transform: `translateZ(2px)`}}>
          <div style={{fontFamily: STENCIL, fontSize: 230, lineHeight: 0.9, color: C.ink, transform: `scale(${interpolate(words, [0, 1], [1.6, 1])})`, opacity: words,
            textShadow: '0 2px 0 rgba(255,230,190,0.4)'}}>1000</div>
          <div style={{fontFamily: STENCIL, fontSize: 96, lineHeight: 1, color: C.ink, letterSpacing: 6, opacity: words}}>PROMESSES</div>
          <div style={{fontFamily: MARKER, fontSize: 92, color: C.hibiscus, transform: `rotate(-6deg) scale(${sp(f, fps, at + 1.8, {damping: 8, stiffness: 300})})`, marginTop: -6}}>
            en carton
          </div>
        </div>
        {/* fragile sticker */}
        <div style={{position: 'absolute', right: 40, top: 30, transform: `rotate(12deg) scale(${sp(f, fps, at + 2.4, {damping: 8, stiffness: 300})})`,
          border: `5px solid ${C.red}`, color: C.red, fontFamily: DISPLAY, fontSize: 34, padding: '4px 16px', letterSpacing: 3}}>
          FRAGILE · NE PAS PROMETTRE
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 120, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 14, color: C.cream,
        opacity: sp(f, fps, at + 2.6), textShadow: '0 2px 10px #000'}}>
        ZOUK · GWO KA · KANAVAL
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "Mille promesses !" counter
export const PromiseCounter: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const p = interpolate(t, [at, at + dur * 0.85], [0, 1], clamp);
  const n = Math.max(1, Math.round(Math.pow(p, 2.2) * 1000));
  const k = sp(f, fps, at);
  const out = interpolate(t, [at + dur - 0.3, at + dur], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 90, top: 110, transform: `rotate(-4deg) scale(${k})`, opacity: out}}>
      <div style={{...cardboardBg(C.cartonLight), clipPath: tornClip('cnt', 5, 12), padding: '18px 40px', textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 26, letterSpacing: 6, color: C.cartonDark}}>PROMESSE N°</div>
        <div style={{fontFamily: STENCIL, fontSize: 120, lineHeight: 1, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{String(n).padStart(4, '0')}</div>
      </div>
      {n >= 1000 && (
        <div style={{position: 'absolute', inset: -10, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(-14deg) scale(${sp(f, fps, at + dur * 0.85, {damping: 8, stiffness: 400})})`}}>
          <div style={{border: `6px solid ${C.red}`, color: C.red, fontFamily: DISPLAY, fontSize: 54, padding: '0 18px', background: 'rgba(255,243,220,0.7)'}}>NON TENUE</div>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ rice price climbing
export const RicePrice: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const p = interpolate(t, [at + 0.3, at + dur - 0.5], [0, 1], clamp);
  const price = 1.29 + Math.pow(p, 1.6) * 2.6;
  const k = sp(f, fps, at);
  const out = interpolate(t, [at + dur - 0.3, at + dur], [1, 0], clamp);
  const pts = new Array(24).fill(0).map((_, i) => {
    const x = (i / 23) * 520;
    const y = 200 - Math.pow(i / 23, 1.6) * 170 - random(`rp${i}`) * 18;
    return `${x},${y}`;
  });
  const shown = Math.max(2, Math.round(p * 24));
  return (
    <div style={{position: 'absolute', right: 80, top: 90, opacity: out, transform: `scale(${k}) rotate(-3deg)`}}>
      <div style={{background: C.cream, padding: '22px 30px', borderRadius: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.55)', width: 580}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <span style={{fontFamily: DISPLAY, fontSize: 52, color: C.ink, letterSpacing: 2}}>RIZ · 1 KG</span>
          <span style={{fontFamily: DISPLAY, fontSize: 84, color: C.red, fontVariantNumeric: 'tabular-nums'}}>{price.toFixed(2).replace('.', ',')} €</span>
        </div>
        <svg width={520} height={210}>
          <polyline points={pts.slice(0, shown).join(' ')} fill="none" stroke={C.red} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
          <line x1={0} y1={205} x2={520} y2={205} stroke={C.ink} strokeWidth={3} />
        </svg>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.cartonDark, letterSpacing: 3}}>APRÈS LE DÉPART DU BATEAU ▲</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ crossing the street
export const Crossing: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const p = interpolate(t, [at + 0.2, at + dur * 0.55], [0, 1], clamp);
  const after = sp(f, fps, at + dur * 0.55, {damping: 9, stiffness: 300});
  const step = Math.sin(t * 14);
  return (
    <AbsoluteFill style={{background: '#3a3a3e', overflow: 'hidden'}}>
      {new Array(9).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 260 + i * 160, top: 0, bottom: 0, width: 90, background: '#ece6d8', opacity: 0.92}} />
      ))}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent 30%, transparent 70%, rgba(0,0,0,0.5))'}} />
      <div style={{position: 'absolute', top: 470, left: interpolate(p, [0, 1], [60, 1560]), transform: `translateY(${Math.abs(step) * -12}px)`, fontSize: 200}}>
        <svg width={170} height={260} viewBox="0 0 170 260">
          <circle cx={85} cy={36} r={30} fill={C.ink} />
          <rect x={58} y={70} width={54} height={95} rx={20} fill={C.hibiscus} />
          <rect x={60} y={160} width={18} height={90} rx={9} fill={C.ink} transform={`rotate(${step * 22} 69 160)`} />
          <rect x={92} y={160} width={18} height={90} rx={9} fill={C.ink} transform={`rotate(${-step * 22} 101 160)`} />
          <rect x={30} y={78} width={110} height={70} fill={C.carton} stroke={C.cartonDark} strokeWidth={4} transform="rotate(-8 85 110)" />
          <text x={85} y={124} textAnchor="middle" fontFamily="Permanent Marker" fontSize={26} fill={C.ink} transform="rotate(-8 85 110)">CV</text>
        </svg>
      </div>
      <div style={{position: 'absolute', top: 90, left: 80, fontFamily: DISPLAY, fontSize: 96, color: C.cream, letterSpacing: 3, textShadow: '0 8px 0 #000'}}>
        TRAVERSER LA RUE ? <span style={{color: C.madrasGreen}}>✔</span>
      </div>
      <div style={{position: 'absolute', top: 260, right: 90, transform: `rotate(-6deg) scale(${after})`, border: `8px solid ${C.red}`, padding: '6px 26px',
        fontFamily: DISPLAY, fontSize: 80, color: C.red, background: 'rgba(255,243,220,0.9)'}}>MÊME GALÈRE</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ pizza box = electoral programme
export const PizzaBox: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const arrive = sp(f, fps, at, {damping: 14, stiffness: 120});
  const open = sp(f, fps, at + dur * 0.42, {damping: 12, stiffness: 70});
  const stamp = sp(f, fps, at + dur * 0.62, {damping: 8, stiffness: 380});
  const steam = (i: number) => (t * 0.6 + i * 0.33) % 1;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #3b2614 0%, ${C.night} 75%)`, alignItems: 'center', justifyContent: 'center', perspective: 1600}}>
      {/* TV glow */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 10% 30%, rgba(80,140,255,${0.18 + Math.sin(t * 9) * 0.05}), transparent 45%)`}} />
      <div style={{position: 'relative', width: 640, height: 640, transform: `translateY(${(1 - arrive) * 900 + 170}px) rotateX(38deg) rotateZ(${(1 - arrive) * 25 - 4}deg)`, transformStyle: 'preserve-3d'}}>
        {/* inside: empty, a folded paper */}
        <div style={{position: 'absolute', inset: 0, ...cardboardBg(C.cartonLight, 10), boxShadow: 'inset 0 0 90px rgba(60,30,8,0.8)'}}>
          <div style={{position: 'absolute', left: 110, top: 160, width: 420, height: 320, background: '#f6efe2', transform: 'rotate(-7deg)', boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            padding: 28, fontFamily: DISPLAY, color: C.ink}}>
            <div style={{fontSize: 46, letterSpacing: 2}}>PROGRAMME</div>
            <div style={{fontSize: 30, color: C.cartonDark}}>DES ÉLECTIONS</div>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{height: 10, background: '#cfc6b6', margin: '16px 0', width: `${90 - i * 12}%`}} />)}
          </div>
          {[0.2, 0.5, 0.7].map((x, i) => <div key={i} style={{position: 'absolute', left: `${x * 100}%`, top: `${20 + i * 25}%`, width: 30, height: 18, borderRadius: 9, background: 'rgba(160,80,20,0.45)'}} />)}
        </div>
        {/* lid */}
        <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `rotateX(${interpolate(open, [0, 1], [0, -96])}deg)`, transformStyle: 'preserve-3d'}}>
          <div style={{position: 'absolute', inset: 0, ...cardboardBg(C.carton, 10), boxShadow: 'inset 0 0 60px rgba(60,30,8,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backfaceVisibility: 'hidden'}}>
            <div style={{width: 380, height: 380, borderRadius: '50%', border: `10px solid ${C.hibiscus}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: MARKER, fontSize: 70, color: C.hibiscus}}>Pizza</div>
              <div style={{fontFamily: STENCIL, fontSize: 92, color: C.ink, lineHeight: 1}}>TONTON</div>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 22, color: C.ink, letterSpacing: 4}}>LIVRAISON EN CAMION</div>
            </div>
          </div>
          <div style={{position: 'absolute', inset: 0, ...cardboardBg(C.cartonDark, 10), transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}} />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 860 + i * 70, top: 520 - steam(i) * 300, width: 40, height: 120, borderRadius: 30, background: 'rgba(255,255,255,0.15)',
          filter: 'blur(14px)', opacity: open * (1 - steam(i))}} />
      ))}
      <div style={{position: 'absolute', top: 80, right: 120, transform: `rotate(10deg) scale(${stamp})`, border: `8px solid ${C.red}`, padding: '4px 24px',
        fontFamily: DISPLAY, fontSize: 86, color: C.red, background: 'rgba(255,243,220,0.9)'}}>VIDE !</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ poker: they keep the aces
const Card: React.FC<{label: string; suit: string; color: string; style?: React.CSSProperties}> = ({label, suit, color, style}) => (
  <div style={{position: 'absolute', width: 230, height: 330, borderRadius: 18, background: '#fbf6ec', boxShadow: '0 16px 30px rgba(0,0,0,0.55)', border: '3px solid #ddd2bd', ...style}}>
    <div style={{position: 'absolute', top: 12, left: 18, fontFamily: DISPLAY, fontSize: 52, color, lineHeight: 1}}>{suit}</div>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: DISPLAY, fontSize: label.length > 4 ? 40 : 110, color, padding: 10, lineHeight: 1}}>{label}</div>
    <div style={{position: 'absolute', bottom: 12, right: 18, fontFamily: DISPLAY, fontSize: 52, color, transform: 'rotate(180deg)', lineHeight: 1}}>{suit}</div>
  </div>
);
export const Poker: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const deal = (i: number) => sp(f, fps, at + 0.15 + i * 0.12, {damping: 13, stiffness: 160});
  const split = sp(f, fps, at + dur * 0.5, {damping: 12, stiffness: 120});
  const top = [['A', '♠'], ['A', '♥'], ['A', '♦'], ['A', '♣']];
  const bot = [['GALÈRE', '♣'], ['LOYER', '♠'], ['FACTURE', '♦'], ['PRIX', '♥']];
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, #1f6b3c 0%, #0c2c18 80%)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 0%, rgba(255,210,120,0.35), transparent 50%)'}} />
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontSize: 60, color: C.mango, letterSpacing: 6, opacity: split}}>
        VOUS : LES AS · NOUS : LES GALÈRES
      </div>
      {top.map(([l, s], i) => (
        <Card key={`a${i}`} label={l} suit={s} color={s === '♥' || s === '♦' ? C.red : C.ink}
          style={{left: 420 + i * 270, top: interpolate(split, [0, 1], [380, 200]), transform: `translateY(${(1 - deal(i)) * -900}px) rotate(${(i - 1.5) * 4}deg)`}} />
      ))}
      {bot.map(([l, s], i) => (
        <Card key={`b${i}`} label={l} suit={s} color={C.cartonDark}
          style={{left: 420 + i * 270, top: interpolate(split, [0, 1], [380, 600]), opacity: split, transform: `translateY(${(1 - split) * 300}px) rotate(${(1.5 - i) * 4}deg)`}} />
      ))}
      <div style={{position: 'absolute', bottom: 260, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: 10, color: C.cream, opacity: 1 - split}}>
        MISE : NOS SALAIRES
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Jupiter far above, coins down here
export const Jupiter: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const k = sp(f, fps, at, {damping: 18, stiffness: 60});
  const coins = sp(f, fps, at + dur * 0.5, {damping: 12, stiffness: 140});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #050816 0%, #12183a 55%, #2a1a0c 100%)', overflow: 'hidden'}}>
      {new Array(90).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: `${random(`sx${i}`) * 100}%`, top: `${random(`sy${i}`) * 60}%`, width: 3, height: 3, borderRadius: 2, background: '#fff',
          opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i))}} />
      ))}
      <div style={{position: 'absolute', left: 1180, top: 60 + (1 - k) * -400, width: 420, height: 420, borderRadius: '50%', transform: `rotate(-18deg)`,
        background: `repeating-linear-gradient(180deg, #d9a066 0 34px, #b97a45 34px 58px, #f0cf9a 58px 80px, #a8653a 80px 96px)`,
        boxShadow: 'inset -60px -40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(255,180,90,0.3)'}}>
        <div style={{position: 'absolute', left: 250, top: 250, width: 70, height: 40, borderRadius: '50%', background: '#a0442a', opacity: 0.85}} />
      </div>
      <div style={{position: 'absolute', left: 640, top: 160, opacity: k, background: C.cream, borderRadius: 40, padding: '24px 40px', fontFamily: MARKER, fontSize: 54, color: C.ink, transform: 'rotate(-4deg)'}}>
        « Tout va bien en bas ! »
        <div style={{position: 'absolute', right: -30, top: 40, width: 0, height: 0, borderTop: '20px solid transparent', borderBottom: '20px solid transparent', borderLeft: `40px solid ${C.cream}`}} />
      </div>
      {new Array(9).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 260 + i * 70, bottom: 120 + (i % 3) * 18, width: 90, height: 90, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #fff2b0, #d8a52a 55%, #8a6512)', border: '4px solid #6e500f',
          transform: `translateY(${(1 - sp(f, fps, at + dur * 0.5 + i * 0.07, {damping: 9, stiffness: 300})) * -700}px)`, opacity: coins,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 30, color: '#6e500f'}}>€</div>
      ))}
      <div style={{position: 'absolute', left: 260, bottom: 40, fontFamily: SANS, fontWeight: 900, fontSize: 30, letterSpacing: 8, color: C.mango, opacity: coins}}>NOUS, ON COMPTE LES PIÈCES SUR TERRE</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "poudre de perlimpinpin": colour powder burst over a photo
export const Powder: React.FC<{at: number; dur: number; cx?: number; cy?: number}> = ({at, dur, cx = 960, cy = 520}) => {
  const {t} = useT();
  const lt = t - at;
  if (lt < 0 || lt > dur) return null;
  const cols = [C.hibiscus, C.mango, C.turquoise, '#b44cff', C.madrasGreen, '#ff7ac8'];
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      {new Array(70).fill(0).map((_, i) => {
        const a = random(`pa${i}`) * Math.PI * 2;
        const v = 200 + random(`pv${i}`) * 700;
        const d = (1 - Math.exp(-lt * 2.2)) * v;
        const s = 30 + random(`ps${i}`) * 120 + lt * 60;
        return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * d - s / 2, top: cy + Math.sin(a) * d * 0.7 - s / 2 + lt * 40, width: s, height: s, borderRadius: '50%',
          background: cols[i % cols.length], filter: `blur(${10 + lt * 8}px)`, opacity: Math.max(0, 0.75 - lt / dur * 0.7)}} />;
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the bill: "quoi qu'il en coûte"
export const Receipt: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const unroll = interpolate(t, [at + 0.2, at + dur * 0.7], [0, 1], clamp);
  const total = sp(f, fps, at + dur * 0.72, {damping: 8, stiffness: 350});
  const rows = [
    ['Promesse x1000', '0,00'],
    ['Discours livrés en camion', '0,00'],
    ['Beurre (fondu en chemin)', '0,00'],
    ['Poudre de perlimpinpin', '0,00'],
    ['Quoi qu’il en coûte', '∞'],
  ];
  return (
    <div style={{position: 'absolute', right: 110, top: 0, width: 560, transform: 'rotate(3deg)'}}>
      <div style={{background: '#fbf8f1', padding: '40px 36px 30px', boxShadow: '0 24px 50px rgba(0,0,0,0.6)', clipPath: `inset(0 0 ${(1 - unroll) * 100}% 0)`,
        fontFamily: '"Courier New", monospace', color: '#222', fontSize: 28}}>
        <div style={{textAlign: 'center', fontWeight: 700, fontSize: 32, letterSpacing: 4}}>ÉLYSÉE-MARKET</div>
        <div style={{textAlign: 'center', fontSize: 22, marginBottom: 18}}>ticket n° 49.3</div>
        {rows.map(([a, b], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #bbb', padding: '8px 0'}}><span>{a}</span><span>{b}</span></div>
        ))}
        <div style={{marginTop: 22, fontWeight: 700, fontSize: 30}}>PAYÉ PAR :</div>
        <div style={{fontFamily: MARKER, fontSize: 46, color: C.red, transform: `scale(${total}) rotate(-4deg)`, transformOrigin: 'left center'}}>le petit bonhomme</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ break gwo ka: shockwave rings on the BOUMs
export const Shockwave: React.FC<{times: number[]}> = ({times}) => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {times.map((at, i) => {
        const lt = t - at;
        if (lt < 0 || lt > 0.8) return null;
        const r = 100 + lt * 1800;
        return <div key={i} style={{position: 'absolute', left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: '50%',
          border: `${Math.max(2, 40 - lt * 50)}px solid ${C.mango}`, opacity: 1 - lt / 0.8, boxShadow: `0 0 60px ${C.hibiscus}`}} />;
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the cardboard calculator
export const Calculator: React.FC<{at: number; dur: number; lines: {at: number; text: string}[]}> = ({at, dur, lines}) => {
  const {f, fps, t} = useT();
  const k = sp(f, fps, at, {damping: 14, stiffness: 120});
  let display = '';
  for (const l of lines) if (t >= l.at) {
    const n = Math.floor((t - l.at) * 22);
    display = l.text.slice(0, n);
  }
  const press = Math.floor(t * 8) % 16;
  const b = beatPulse(t);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #4a2f17 0%, ${C.night} 75%)`, alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 10%, rgba(255,220,150,0.35), transparent 40%)'}} />
      <div style={{position: 'relative', width: 760, height: 980, transform: `translateY(${(1 - k) * 1000 + 120}px) rotate(-6deg) scale(${0.9 + b * 0.01})`,
        ...cardboardBg(C.carton, 16), borderRadius: 30, boxShadow: '0 40px 90px rgba(0,0,0,0.8), inset 0 0 80px rgba(60,30,8,0.7)', padding: 50}}>
        <div style={{fontFamily: MARKER, fontSize: 34, color: C.ink, marginBottom: 10}}>CASIO-TONTON  <span style={{fontSize: 22}}>solaire (pas de soleil)</span></div>
        <div style={{height: 190, background: '#9fb48a', borderRadius: 12, border: `8px solid ${C.cartonDark}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 26px', fontFamily: '"Courier New", monospace', fontWeight: 700, fontSize: display.length > 18 ? 46 : 64, color: '#1d2a14', overflow: 'hidden', whiteSpace: 'nowrap',
          boxShadow: 'inset 0 6px 16px rgba(0,0,0,0.35)'}}>
          {display}<span style={{opacity: Math.floor(t * 3) % 2}}>▌</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, marginTop: 40}}>
          {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'].map((key, i) => (
            <div key={key} style={{height: 110, borderRadius: 18, ...cardboardBg(i === press ? C.mango : C.cartonLight, 10), display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MARKER, fontSize: 56, color: C.ink, boxShadow: i === press ? 'inset 0 4px 10px rgba(0,0,0,0.4)' : '0 8px 0 rgba(70,40,10,0.7)',
              transform: i === press ? 'translateY(6px)' : undefined}}>{key}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "49.3" rubber stamp
export const Stamp493: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  if (t < at - 0.1 || t > at + dur) return null;
  const k = sp(f, fps, at, {damping: 7, stiffness: 420});
  const out = interpolate(t, [at + dur - 0.3, at + dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{transform: `scale(${interpolate(k, [0, 1], [3.5, 1])}) rotate(-12deg)`, opacity: Math.min(1, k * 2), border: `16px solid ${C.red}`, borderRadius: 24,
        padding: '0 60px', fontFamily: DISPLAY, fontSize: 300, lineHeight: 1.1, color: C.red, background: 'rgba(255,243,220,0.25)',
        maskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.65) 100%)'}}>
        49.3
      </div>
      <div style={{position: 'absolute', bottom: 300, fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: 16, color: C.cream, textShadow: '0 3px 10px #000', opacity: k}}>
        ADOPTÉ SANS VOTE
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "Pas besoin d'intelligence artificielle"
export const NoAI: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  if (t < at || t > at + dur) return null;
  const k = sp(f, fps, at, {damping: 10, stiffness: 260});
  const cross = interpolate(t, [at + 0.5, at + 0.9], [0, 1], clamp);
  const glitch = Math.floor(t * 20) % 5 === 0 ? 8 : 0;
  return (
    <div style={{position: 'absolute', right: 260, top: 130, transform: `scale(${k}) rotate(5deg)`}}>
      <div style={{position: 'relative', fontFamily: DISPLAY, fontSize: 180, color: C.turquoise, letterSpacing: 10, textShadow: `${glitch}px 0 ${C.hibiscus}, ${-glitch}px 0 ${C.mango}`}}>
        I.A.
        <svg style={{position: 'absolute', inset: 0}} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1={0} y1={90} x2={100 * cross} y2={90 - 80 * cross} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{fontFamily: MARKER, fontSize: 52, color: C.cream, textShadow: '0 3px 8px #000', marginTop: -20}}>pas besoin !</div>
    </div>
  );
};

// ------------------------------------------------------------------ the red card
export const RedCard: React.FC<{at: number; dur: number}> = ({at, dur}) => {
  const {f, fps, t} = useT();
  const k = sp(f, fps, at, {damping: 10, stiffness: 140});
  const d = downbeatPulse(t);
  const out = interpolate(t, [at + dur - 0.5, at + dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(215,20,31,${0.35 * k}), rgba(0,0,0,${0.75 * k}) 70%)`}} />
      <div style={{position: 'absolute', left: 960 - 190, top: 140, width: 380, height: 540, borderRadius: 26, background: `linear-gradient(160deg, #ff3a3a, ${C.red} 60%, #8e0910)`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 ${80 + d * 60}px rgba(255,40,40,0.6)`, transform: `translateY(${(1 - k) * 900}px) rotate(${interpolate(k, [0, 1], [-30, -6])}deg) scale(${1 + d * 0.03})`}}>
        <div style={{position: 'absolute', inset: 22, border: '3px solid rgba(255,255,255,0.35)', borderRadius: 16}} />
        <div style={{position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontFamily: STENCIL, fontSize: 40, color: 'rgba(255,240,230,0.85)', letterSpacing: 4}}>EN CARTON</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ slogans hand-written on the blank placards
export const Placard: React.FC<{quad: number[][]; lines: string[]; at: number; size?: number; color?: string}> = ({quad, lines, at, size = 120, color = C.ink}) => {
  const {t} = useT();
  const W = 1000;
  const H = 700;
  const total = lines.join('').length;
  let shown = Math.max(0, (t - at) * 18);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: quadMatrix(W, H, quad),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mixBlendMode: 'multiply'}}>
      {lines.map((l, i) => {
        const n = Math.max(0, Math.min(l.length, Math.floor(shown)));
        shown -= l.length;
        return (
          <div key={i} style={{fontFamily: MARKER, fontSize: i === 0 ? size : size * 0.82, lineHeight: 1.08, color: i === lines.length - 1 && lines.length > 1 ? C.red : color,
            transform: `rotate(${(i % 2 ? 1.5 : -2)}deg)`, whiteSpace: 'nowrap', opacity: total ? 0.93 : 0}}>
            {l.slice(0, n)}
            <span style={{opacity: 0}}>{l.slice(n)}</span>
          </div>
        );
      })}
    </div>
  );
};

// Photo of a placard with its slogan written live.
export const PlacardPhoto: React.FC<{img: string}> = ({img}) => <Img src={staticFile(`carton/${img}.jpg`)} style={{width: '100%', height: '100%'}} />;
