import {music} from './music';

export type Stop = {img: string; label: string; flag: string; focus: number};

// One stop per image of the world tour (focus = horizontal centre of the dancers, 0-1).
export const STOPS: Stop[] = [
  {img: 'caraibes', label: 'CARAÏBES', flag: '🌴', focus: 0.35},
  {img: 'inde', label: 'INDE', flag: '🇮🇳', focus: 0.45},
  {img: 'italie', label: 'ITALIE', flag: '🇮🇹', focus: 0.4},
  {img: 'maroc', label: 'MAROC', flag: '🇲🇦', focus: 0.4},
  {img: 'nigeria', label: 'NIGERIA', flag: '🇳🇬', focus: 0.35},
  {img: 'portugal', label: 'PORTUGAL', flag: '🇵🇹', focus: 0.45},
  {img: 'russie', label: 'RUSSIE', flag: '🇷🇺', focus: 0.3},
  {img: 'thailande', label: 'THAÏLANDE', flag: '🇹🇭', focus: 0.4},
  {img: 'paris', label: 'PARIS', flag: '🇫🇷', focus: 0.4},
  {img: 'tunisie', label: 'TUNISIE', flag: '🇹🇳', focus: 0.4},
  {img: 'antilles', label: 'ANTILLES', flag: '🌺', focus: 0.45},
];

export const COVER: Stop = {img: 'cover', label: 'ET ÇA RECOMMENCE', flag: '❤️', focus: 0.5};

export const INTRO_END = 8.3; // cover card while the first "Ah oh" rises
export const OUTRO_START = 176;

export type Shot = Stop & {start: number; index: number};

// Cut every 8 beats (one bar of two at 112 bpm ≈ 4.3 s), every 4 in the hottest parts.
const buildShots = (): Shot[] => {
  const shots: Shot[] = [{...COVER, start: 0, index: 0}];
  const beats = music.beats;
  let i = beats.findIndex((b) => b >= INTRO_END);
  let n = 0;
  while (i >= 0 && i < beats.length && beats[i] < OUTRO_START) {
    shots.push({...STOPS[n % STOPS.length], start: beats[i], index: n + 1});
    n++;
    const e = music.energy[Math.round(beats[i] * 10)] ?? 0;
    i += e > 0.7 ? 4 : 8;
  }
  shots.push({...COVER, start: OUTRO_START, index: n + 1});
  return shots;
};

export const SHOTS = buildShots();

export const shotAt = (t: number) => {
  let s = SHOTS[0];
  for (const x of SHOTS) if (x.start <= t) s = x;
  return s;
};
