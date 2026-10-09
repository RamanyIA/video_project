import type {Crop} from './crops';
import {PC} from './crops';
import {music} from './music';

export type Shot = Crop & {start: number};

export const INTRO_END = 25.5; // title card over the cover until the first vocals
export const OUTRO_START = 294;

// Dreams: during the choruses he dances with everyone; when the dream ends he is alone.
export const DREAMS = [
  {start: 57.5, end: 98.5},
  {start: 151, end: 190},
  {start: 256.6, end: 290},
];
const ALONE_FOR = 6;

// Photo order: warm / personal moments first, the studio smiles in between.
const ORDER: Crop[] = [
  PC.smile3, PC.create, PC.family, PC.smile1, PC.travel, PC.cook, PC.smile2, PC.center,
  PC.explain, PC.present, PC.dev,
];
// Joyful shots for the dreams.
const JOY: Crop[] = [PC.smile1, PC.sport, PC.center, PC.smile2, PC.travel, PC.smile3, PC.cook];

const energyBetween = (a: number, b: number) => {
  const seg = music.energy.slice(Math.round(a * 10), Math.round(b * 10));
  return seg.reduce((x, y) => x + y, 0) / Math.max(1, seg.length);
};

const inDream = (t: number) => DREAMS.some((d) => t >= d.start && t < d.end);
const alone = (t: number) => DREAMS.some((d) => t >= d.end && t < d.end + ALONE_FOR);

// Cut on downbeats: every 16 beats in calm passages, every 8 when the song lifts;
// forced cuts when a dream starts, ends (pensive, alone) and when he comes back.
const buildShots = (): Shot[] => {
  const beats = music.beats;
  const cuts = new Set<number>();
  let i = beats.findIndex((b) => b >= INTRO_END);
  while (i >= 0 && i < beats.length && beats[i] < OUTRO_START) {
    cuts.add(beats[i]);
    i += energyBetween(beats[i], beats[Math.min(beats.length - 1, i + 16)]) > 0.5 ? 8 : 16;
  }
  const forced = DREAMS.flatMap((d) => [d.start, d.end, d.end + ALONE_FOR]);
  // beat cuts too close to a forced cut are dropped, forced cuts always stay
  const beatCuts = [...cuts].filter((x) => forced.every((y) => Math.abs(x - y) > 2.5));
  const kept = [...beatCuts, ...forced].filter((x) => x >= INTRO_END && x < OUTRO_START).sort((a, b) => a - b);

  const shots: Shot[] = [{...PC.cover, start: 0}];
  let n = 0;
  let j = 0;
  for (const x of kept) {
    if (alone(x)) shots.push({...PC.think, start: x});
    else if (inDream(x)) shots.push({...JOY[j++ % JOY.length], start: x});
    else shots.push({...ORDER[n++ % ORDER.length], start: x});
  }
  shots.push({...PC.cover, start: OUTRO_START});
  return shots;
};

export const SHOTS = buildShots();
