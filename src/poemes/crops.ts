import type {Box} from '../scenes';

// Square-ish crops of the brand photos (1536x1024 sources) for the round porthole.
const P1 = 'photos/photo1.jpg';
const P2 = 'photos/photo2.jpg';
const P3 = 'photos/photo3.jpg';
const P4 = 'photos/photo4.jpg';

export type Crop = {src: string; box: Box};

export const PC = {
  smile1: {src: P1, box: {x: 600, y: 120, w: 520, h: 520}},
  smile2: {src: P2, box: {x: 540, y: 80, w: 480, h: 480}},
  smile3: {src: P3, box: {x: 470, y: 60, w: 520, h: 520}},
  center: {src: P4, box: {x: 520, y: 10, w: 560, h: 560}},
  family: {src: P4, box: {x: 632, y: 668, w: 278, h: 300}},
  cook: {src: P4, box: {x: 915, y: 668, w: 272, h: 300}},
  create: {src: P4, box: {x: 0, y: 668, w: 330, h: 330}},
  travel: {src: P4, box: {x: 1200, y: 378, w: 336, h: 290}},
  sport: {src: P4, box: {x: 1200, y: 0, w: 336, h: 340}},
  think: {src: P4, box: {x: 90, y: 340, w: 320, h: 320}},
  explain: {src: P4, box: {x: 60, y: 0, w: 350, h: 340}},
  dev: {src: P4, box: {x: 335, y: 668, w: 290, h: 300}},
  present: {src: P4, box: {x: 1190, y: 668, w: 346, h: 330}},
  cover: {src: 'photos/mille-poemes-cover.jpg', box: {x: 0, y: 0, w: 360, h: 360}},
} satisfies Record<string, Crop>;
