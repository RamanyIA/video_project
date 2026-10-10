import React from 'react';

// Original illustrated characters, 3/4 view. `open` (0-1) drives the mouth,
// `blink` (0-1) closes the eyes, `talk` adds head motion while speaking.

type Props = {open: number; blink: number; tilt: number; nod: number; brow: number};

const SKIN_F = '#f1c7a8';
const SKIN_M = '#d9a37f';

const Mouth: React.FC<{x: number; y: number; open: number; w: number; lip: string}> = ({x, y, open, w, lip}) => {
  const h = 2 + open * 22;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={h / 2 - 2} rx={w * (0.75 + open * 0.15)} ry={h / 2 + 2} fill="#5a1f22" />
      {open > 0.25 && <rect x={-w * 0.55} y={-1} width={w * 1.1} height={Math.min(6, h * 0.3)} rx={2} fill="#fff" />}
      {open > 0.4 && <ellipse cx={0} cy={h - 3} rx={w * 0.45} ry={Math.min(5, h * 0.2)} fill="#c95b63" />}
      <path d={`M${-w} -1 Q 0 ${-6 - open * 2} ${w} -1`} stroke={lip} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M${-w * 0.9} ${h} Q 0 ${h + 6} ${w * 0.9} ${h}`} stroke={lip} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

const Eye: React.FC<{x: number; y: number; blink: number; look: number; lash?: boolean}> = ({x, y, blink, look, lash}) => {
  const ry = 9 * (1 - blink * 0.95);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={13} ry={ry + 0.5} fill="#fff" />
      {ry > 2 && <circle cx={look * 4} cy={0} r={Math.min(7, ry)} fill="#3b2a20" />}
      {ry > 2 && <circle cx={look * 4 + 2} cy={-2} r={2} fill="#fff" />}
      <path d={`M-14 ${-ry} Q 0 ${-ry - 6} 14 ${-ry}`} stroke="#2b1d18" strokeWidth={lash ? 4 : 3} fill="none" strokeLinecap="round" />
    </g>
  );
};

// L'Amirale — Marine nationale inspired dress uniform (navy jacket, white cap, gold rings).
export const Admiral: React.FC<Props> = ({open, blink, tilt, nod, brow}) => (
  <svg width={460} height={620} viewBox="0 0 460 620" style={{overflow: 'visible'}}>
    {/* body */}
    <path d="M60 620 C 60 470, 120 420, 230 410 C 340 420, 400 470, 400 620 Z" fill="#14213d" />
    <path d="M185 412 L230 520 L275 412 Z" fill="#ffffff" />
    <path d="M222 430 L238 430 L242 520 L230 540 L218 520 Z" fill="#111" />
    <path d="M185 412 L230 520 L150 470 Z" fill="#1b2c52" />
    <path d="M275 412 L230 520 L310 470 Z" fill="#1b2c52" />
    {/* shoulder boards with gold stars (admiral rank) */}
    {[[90, 445], [300, 445]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${i ? 8 : -8})`}>
        <rect width={70} height={22} rx={6} fill="#0d1730" stroke="#d4af37" strokeWidth={3} />
        {[14, 30, 46, 60].slice(0, 4).map((sx) => (
          <text key={sx} x={sx - 6} y={17} fontSize={14} fill="#d4af37">★</text>
        ))}
      </g>
    ))}
    {/* medal ribbons */}
    <rect x={290} y={490} width={60} height={10} fill="#c8102e" />
    <rect x={290} y={502} width={60} height={10} fill="#1f4fa3" />
    <circle cx={260} cy={560} r={6} fill="#d4af37" />
    <circle cx={260} cy={595} r={6} fill="#d4af37" />
    {/* neck + head */}
    <rect x={205} y={340} width={50} height={80} rx={20} fill={SKIN_F} />
    <g transform={`translate(230 260) rotate(${tilt}) translate(0 ${nod}) translate(-230 -260)`}>
      {/* hair bun behind */}
      <circle cx={170} cy={270} r={42} fill="#5b3a29" />
      <path d="M150 230 C 150 160, 310 160, 310 240 L 310 300 C 300 260, 160 260, 150 300 Z" fill="#5b3a29" />
      <ellipse cx={232} cy={265} rx={78} ry={95} fill={SKIN_F} />
      <path d="M156 250 C 170 210, 290 205, 310 250 C 290 232, 180 232, 156 250 Z" fill="#5b3a29" />
      {/* ear + earring */}
      <ellipse cx={160} cy={275} rx={12} ry={20} fill={SKIN_F} />
      <circle cx={160} cy={298} r={5} fill="#d4af37" />
      {/* eyes, brows (looking right towards the general) */}
      <Eye x={210} y={262} blink={blink} look={1} lash />
      <Eye x={268} y={262} blink={blink} look={1} lash />
      <path d={`M195 ${240 - brow * 6} Q 210 ${232 - brow * 6} 226 ${238 - brow * 4}`} stroke="#3b2418" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M254 ${238 - brow * 4} Q 270 ${232 - brow * 6} 284 ${240 - brow * 6}`} stroke="#3b2418" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M244 270 Q 256 300 242 304" stroke="#c98e72" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={200} cy={300} rx={14} ry={8} fill="#f4a0a0" opacity={0.45} />
      <ellipse cx={285} cy={300} rx={14} ry={8} fill="#f4a0a0" opacity={0.45} />
      <Mouth x={244} y={322} open={open} w={20} lip="#b5485a" />
      {/* white peaked cap with gold embroidery */}
      <path d="M140 205 C 150 140, 320 130, 335 200 L 330 215 L 145 220 Z" fill="#f7f7f7" stroke="#d9d9d9" strokeWidth={3} />
      <rect x={146} y={205} width={186} height={26} rx={6} fill="#0d1730" />
      <path d="M150 232 C 200 250, 300 252, 345 228 L 340 240 C 300 262, 200 262, 150 245 Z" fill="#111" />
      <path d="M160 222 Q 200 230 240 222 Q 280 230 320 222" stroke="#d4af37" strokeWidth={4} fill="none" />
      <circle cx={240} cy={214} r={13} fill="#d4af37" />
      <path d="M233 214 L240 204 L247 214 L240 224 Z" fill="#0d1730" />
    </g>
  </svg>
);

// Le Général — Armée de l'air inspired uniform (blue-grey jacket, wings, stars).
export const General: React.FC<Props> = ({open, blink, tilt, nod, brow}) => (
  <svg width={460} height={620} viewBox="0 0 460 620" style={{overflow: 'visible'}}>
    <path d="M50 620 C 50 465, 115 415, 230 405 C 345 415, 410 465, 410 620 Z" fill="#3c4f6e" />
    <path d="M188 408 L230 515 L272 408 Z" fill="#cfe0f2" />
    <path d="M222 425 L238 425 L242 515 L230 535 L218 515 Z" fill="#1d2738" />
    <path d="M188 408 L230 515 L148 465 Z" fill="#4a5f82" />
    <path d="M272 408 L230 515 L312 465 Z" fill="#4a5f82" />
    {/* shoulder boards with stars */}
    {[[85, 440], [305, 440]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${i ? 8 : -8})`}>
        <rect width={72} height={22} rx={6} fill="#26344d" stroke="#d4af37" strokeWidth={3} />
        {[12, 28, 44, 58].map((sx) => (
          <text key={sx} x={sx - 6} y={17} fontSize={14} fill="#e5e5e5">★</text>
        ))}
      </g>
    ))}
    {/* pilot wings badge */}
    <g transform="translate(115 495)">
      <path d="M0 10 Q 30 -6 50 8 Q 70 -6 100 10 Q 70 14 50 18 Q 30 14 0 10 Z" fill="#d4af37" />
      <circle cx={50} cy={10} r={7} fill="#c8102e" stroke="#d4af37" strokeWidth={2} />
    </g>
    <rect x={295} y={492} width={60} height={10} fill="#1f4fa3" />
    <rect x={295} y={504} width={60} height={10} fill="#e9e9e9" />
    <rect x={295} y={516} width={60} height={10} fill="#c8102e" />
    {/* neck + head */}
    <rect x={203} y={335} width={54} height={80} rx={20} fill={SKIN_M} />
    <g transform={`translate(230 260) rotate(${tilt}) translate(0 ${nod}) translate(-230 -260)`}>
      <ellipse cx={228} cy={262} rx={80} ry={96} fill={SKIN_M} />
      {/* grey short hair at the sides */}
      <path d="M150 250 C 150 215, 160 200, 175 195 L 172 280 C 160 275, 150 265, 150 250 Z" fill="#9a9a9a" />
      <path d="M306 250 C 306 215, 296 200, 282 195 L 286 280 C 298 275, 306 265, 306 250 Z" fill="#9a9a9a" />
      <ellipse cx={300} cy={272} rx={12} ry={20} fill={SKIN_M} />
      {/* eyes looking left towards the admiral */}
      <Eye x={192} y={262} blink={blink} look={-1} />
      <Eye x={250} y={262} blink={blink} look={-1} />
      <path d={`M174 ${238 - brow * 6} Q 190 ${228 - brow * 6} 208 ${236 - brow * 4}`} stroke="#6f6f6f" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M234 ${236 - brow * 4} Q 252 ${228 - brow * 6} 268 ${238 - brow * 6}`} stroke="#6f6f6f" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M214 268 Q 200 298 214 302" stroke="#b07a5a" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* moustache */}
      <path d="M184 312 Q 200 300 214 310 Q 228 300 244 312 Q 230 322 214 316 Q 198 322 184 312 Z" fill="#8a8a8a" />
      <Mouth x={214} y={326} open={open} w={18} lip="#8e4b40" />
      <path d="M160 300 Q 165 340 200 355" stroke="#b07a5a" strokeWidth={3} fill="none" opacity={0.5} />
      {/* air force peaked cap (dark blue, gold oak leaves on the visor) */}
      <path d="M138 205 C 145 135, 315 128, 325 198 L 320 214 L 143 218 Z" fill="#2b3a57" />
      <rect x={144} y={203} width={178} height={26} rx={6} fill="#1c273b" />
      <path d="M128 232 C 180 252, 280 254, 318 228 L 314 242 C 280 264, 180 264, 130 246 Z" fill="#111" />
      <path d="M140 240 Q 175 252 210 248 M 240 248 Q 275 252 305 238" stroke="#d4af37" strokeWidth={4} fill="none" />
      <g transform="translate(232 212)">
        <path d="M-26 0 Q -13 -10 0 -2 Q 13 -10 26 0 Q 13 4 0 6 Q -13 4 -26 0 Z" fill="#d4af37" />
        <circle r={7} fill="#c8102e" stroke="#d4af37" strokeWidth={2} />
      </g>
    </g>
  </svg>
);
