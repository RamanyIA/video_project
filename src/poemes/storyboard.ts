import type {Crop} from './crops';
import {PC} from './crops';
import {music} from './music';

export type Shot = Crop & {start: number};

export const INTRO_END = 26; // title card over the cover until the first vocals
export const OUTRO_START = 294;

// Photo order: warm / personal moments first, the studio smiles in between.
const ORDER: Crop[] = [
  PC.smile3, PC.create, PC.family, PC.smile1, PC.travel, PC.cook, PC.smile2, PC.center,
  PC.think, PC.sport, PC.explain, PC.present, PC.dev,
];

const energyBetween = (a: number, b: number) => {
  const seg = music.energy.slice(Math.round(a * 10), Math.round(b * 10));
  return seg.reduce((x, y) => x + y, 0) / Math.max(1, seg.length);
};

// Cut on downbeats: every 16 beats in calm passages, every 8 when the song lifts.
const buildShots = (): Shot[] => {
  const shots: Shot[] = [{...PC.cover, start: 0}];
  const beats = music.beats;
  let i = beats.findIndex((b) => b >= INTRO_END);
  let n = 0;
  while (i >= 0 && i < beats.length && beats[i] < OUTRO_START) {
    shots.push({...ORDER[n % ORDER.length], start: beats[i]});
    n++;
    const step = energyBetween(beats[i], beats[Math.min(beats.length - 1, i + 16)]) > 0.5 ? 8 : 16;
    i += step;
  }
  shots.push({...PC.cover, start: OUTRO_START});
  return shots;
};

export const SHOTS = buildShots();
