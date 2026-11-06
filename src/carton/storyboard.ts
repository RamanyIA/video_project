import type {Move} from './components/Shot';

// Every cut lands on a sung line (times in seconds from src/carton/data/lyrics.json)
// or on a downbeat in the instrumentals. `gfx` = full-screen motion design invented where
// the AI stills did not fit the lyric; `over` = motion design laid over the photo.
export type Gfx = 'title' | 'crossing' | 'pizza' | 'poker' | 'jupiter' | 'calculator' | 'redcard' | 'black';
export type Over = 'counter' | 'rice' | 'receipt' | 'powder' | 'noai' | 'stamp493';
export type Shot = {
  t: number;
  img?: string;
  gfx?: Gfx;
  over?: Over;
  move?: Move;
  xf?: number; // crossfade from previous shot (s); 0 = hard cut on the beat
  placard?: 'p22' | 'p29';
  slogan?: string[];
};

const Q22 = [[680, 85], [1255, 62], [642, 560], [1252, 560]];
const Q29 = [[392, 140], [1340, 44], [452, 835], [1425, 726]];
export const QUADS = {p22: Q22, p29: Q29};

export const SHOTS: Shot[] = [
  // ---- INTRO · l'appel (conque, ka)
  {t: 0, img: '01', move: {s0: 1.25, s1: 1.05, x0: 3}, xf: 0},
  {t: 7.1, img: '02', move: {s0: 1.04, s1: 1.18, y1: -2}, xf: 1.2},
  {t: 14.14, img: '03', move: {s0: 1.18, s1: 1.04, x0: -3, x1: 2}, xf: 0.4},
  {t: 23.0, img: '04', move: {s0: 1.05, s1: 1.2, y1: 2}, xf: 0.5},
  {t: 26.88, img: '06', move: {s0: 1.2, s1: 1.04}, xf: 0.5},
  {t: 33.38, img: '05', over: 'counter', move: {s0: 1.1, s1: 1.3, x1: -3}},
  {t: 37.8, img: '08', move: {s0: 1.06, s1: 1.2, x0: 2}},
  {t: 41.62, img: '31', move: {s0: 1.3, s1: 1.08, x0: 6, y0: 3}},
  {t: 43.93, img: '07', move: {s0: 1.04, s1: 1.18, x1: -3}},
  {t: 46.96, img: '25', move: {s0: 1.25, s1: 1.1}},
  {t: 48.74, img: '29', placard: 'p29', slogan: ['1000 PROMESSES', 'EN CARTON !'], move: {s0: 1.0, s1: 1.1}},
  // ---- REFRAIN 1
  {t: 51.0, img: '24', move: {s0: 1.08, s1: 1.2, x0: -2, x1: 2}},
  {t: 53.4, img: '23', move: {s0: 1.2, s1: 1.08}},
  {t: 55.82, img: '28', move: {s0: 1.05, s1: 1.2, y0: 2}},
  {t: 57.16, img: '26', move: {s0: 1.1, s1: 1.25, y1: 3}},
  {t: 59.56, img: '09', move: {s0: 1.2, s1: 1.06, x0: 3}},
  {t: 61.6, img: '34', move: {s0: 1.04, s1: 1.25, y1: 4}},
  {t: 64.02, img: '39', move: {s0: 1.06, s1: 1.18}},
  {t: 66.14, img: '11', move: {s0: 1.2, s1: 1.06, x1: 2}},
  // ---- COUPLET 1 · le carton de la République
  {t: 68.68, img: '14', move: {s0: 1.04, s1: 1.22, x0: 2, x1: -3}, xf: 0.8},
  {t: 76.82, img: '13', move: {s0: 1.25, s1: 1.06, y0: 3}, xf: 0.4},
  {t: 81.24, img: '15', move: {s0: 1.05, s1: 1.2, y1: -3}},
  {t: 83.52, img: '16', move: {s0: 1.2, s1: 1.05, x0: -2}},
  {t: 87.58, img: '44', move: {s0: 1.04, s1: 1.16}},
  {t: 90.04, img: '17', move: {s0: 1.04, s1: 1.2, x0: 2, x1: -2}},
  {t: 92.28, img: '18', over: 'rice', move: {s0: 1.1, s1: 1.22, x1: 4}},
  {t: 94.08, img: '10', move: {s0: 1.06, s1: 1.22}},
  {t: 96.46, img: '57', move: {s0: 1.2, s1: 1.06}},
  {t: 98.66, gfx: 'crossing'},
  {t: 102.96, img: '19', move: {s0: 1.04, s1: 1.2, x1: -3}},
  {t: 107.24, img: '34', move: {s0: 1.3, s1: 1.12, y0: 5}},
  {t: 109.22, img: '20', move: {s0: 1.06, s1: 1.22, x0: 2}},
  // ---- PRÉ-REFRAIN · qui fait les lois ?
  {t: 112.28, img: '21', move: {s0: 1.1, s1: 1.2}},
  {t: 114.42, img: '23', move: {s0: 1.3, s1: 1.18, x0: -4}},
  {t: 116.22, img: '31', move: {s0: 1.1, s1: 1.25, x1: 4}},
  {t: 118.4, img: '61', move: {s0: 1.06, s1: 1.2}},
  {t: 122.1, img: '22', placard: 'p22', slogan: ['PA PRAN NOU', 'POU KOUYON !'], move: {s0: 1.0, s1: 1.08, y1: 2}},
  // ---- REFRAIN 2 (plus fort)
  {t: 125.48, img: '28', move: {s0: 1.2, s1: 1.05}},
  {t: 126.6, img: '24', move: {s0: 1.1, s1: 1.2}},
  {t: 127.68, img: '23', move: {s0: 1.06, s1: 1.18}},
  {t: 129.88, img: '41', move: {s0: 1.15, s1: 1.05}},
  {t: 131.4, img: '27', move: {s0: 1.05, s1: 1.2, x1: 3}},
  {t: 133.72, img: '09', move: {s0: 1.06, s1: 1.2}},
  {t: 135.78, img: '12', move: {s0: 1.2, s1: 1.06}},
  {t: 138.14, img: '39', move: {s0: 1.1, s1: 1.22}},
  {t: 140.3, img: '26', move: {s0: 1.2, s1: 1.05}},
  // ---- COUPLET 2 · la satire de Tonton
  {t: 142.5, img: '30', move: {s0: 1.04, s1: 1.22, x1: 2}},
  {t: 146.54, gfx: 'pizza'},
  {t: 150.86, img: '32', move: {s0: 1.04, s1: 1.18}},
  {t: 153.18, gfx: 'poker'},
  {t: 155.3, gfx: 'jupiter'},
  {t: 159.88, img: '35', over: 'powder', move: {s0: 1.04, s1: 1.2}},
  {t: 164.12, img: '36', move: {s0: 1.04, s1: 1.25, y1: 2}},
  {t: 168.4, img: '37', over: 'receipt', move: {s0: 1.06, s1: 1.16, x0: -6, x1: -10}},
  {t: 172.78, img: '61', move: {s0: 1.2, s1: 1.05}},
  // ---- BREAK gwo ka
  {t: 177.2, img: '38', move: {s0: 1.1, s1: 1.2}},
  {t: 178.72, img: '40', move: {s0: 1.2, s1: 1.1}},
  {t: 179.59, img: '42', move: {s0: 1.1, s1: 1.25}},
  {t: 180.78, img: '39', move: {s0: 1.25, s1: 1.1}},
  {t: 181.94, img: '25', move: {s0: 1.1, s1: 1.25}},
  {t: 182.96, img: '41', move: {s0: 1.22, s1: 1.08}},
  {t: 185.06, img: '31', move: {s0: 1.06, s1: 1.25, x1: 5}},
  {t: 188.92, img: '07', move: {s0: 1.2, s1: 1.06}},
  {t: 190.5, img: '23', move: {s0: 1.06, s1: 1.2}},
  {t: 191.4, img: '05', move: {s0: 1.25, s1: 1.1}},
  // ---- COUPLET 3 · la mémoire et la dignité (on ralentit)
  {t: 193.6, img: '43', move: {s0: 1.04, s1: 1.18, y0: 2, y1: -2}, xf: 0.8},
  {t: 199.0, img: '46', move: {s0: 1.18, s1: 1.04}, xf: 0.8},
  {t: 204.14, img: '15', move: {s0: 1.06, s1: 1.2, x1: -2}, xf: 0.4},
  {t: 208.46, img: '44', move: {s0: 1.04, s1: 1.18}, xf: 0.4},
  {t: 212.86, img: '13', move: {s0: 1.2, s1: 1.06}, xf: 0.4},
  {t: 216.98, img: '45', move: {s0: 1.04, s1: 1.18, x0: 2}, xf: 0.4},
  {t: 221.06, img: '47', move: {s0: 1.04, s1: 1.18}},
  {t: 223.4, img: '48', move: {s0: 1.18, s1: 1.04, y0: 2}},
  {t: 225.3, img: '43', move: {s0: 1.25, s1: 1.1, y0: 4}},
  {t: 229.7, img: '49', move: {s0: 1.04, s1: 1.18}, xf: 0.4},
  {t: 232.12, img: '16', move: {s0: 1.06, s1: 1.18}},
  {t: 234.08, img: '12', move: {s0: 1.18, s1: 1.04}},
  {t: 236.34, img: '50', move: {s0: 1.04, s1: 1.16}},
  {t: 238.4, img: '08', move: {s0: 1.2, s1: 1.06}},
  {t: 240.58, img: '13', move: {s0: 1.06, s1: 1.25, y1: -3}},
  {t: 242.76, img: '34', move: {s0: 1.04, s1: 1.3, y1: 5}},
  // ---- PONT · Manman disait (presque statique)
  {t: 249.55, img: '51', move: {s0: 1.04, s1: 1.12}, xf: 1.0},
  {t: 254.22, img: '52', move: {s0: 1.12, s1: 1.04}, xf: 0.8},
  {t: 258.1, img: '58', move: {s0: 1.04, s1: 1.12}, xf: 0.8},
  {t: 262.44, img: '53', move: {s0: 1.04, s1: 1.2}, xf: 0.8},
  {t: 268.2, img: '56', move: {s0: 1.12, s1: 1.04}, xf: 1.0},
  {t: 273.38, img: '54', move: {s0: 1.04, s1: 1.14, x1: -2}, xf: 0.6},
  {t: 275.3, img: '55', move: {s0: 1.14, s1: 1.04}, xf: 0.6},
  {t: 277.78, img: '02', move: {s0: 1.04, s1: 1.14}, xf: 0.6},
  {t: 279.9, img: '57', move: {s0: 1.04, s1: 1.25}, xf: 0.6},
  // ---- MONTÉE
  {t: 283.26, img: '40', move: {s0: 1.06, s1: 1.25}},
  {t: 285.34, gfx: 'calculator'},
  {t: 292.78, img: '59', over: 'noai', move: {s0: 1.04, s1: 1.18, x0: -3}},
  {t: 295.6, img: '50', move: {s0: 1.18, s1: 1.04}},
  {t: 298.42, img: '60', over: 'stamp493', move: {s0: 1.06, s1: 1.2}},
  {t: 301.68, img: '63', move: {s0: 1.04, s1: 1.22}},
  {t: 304.6, img: '38', move: {s0: 1.2, s1: 1.06}},
  {t: 307.54, img: '64', move: {s0: 1.3, s1: 1.06, y0: 5}},
  {t: 311.13, img: '22', placard: 'p22', slogan: ['TONTON,', 'CHANJÉ TON !'], move: {s0: 1.12, s1: 1.0}},
  // ---- REFRAIN FINAL · grand carnaval
  {t: 312.78, img: '65', move: {s0: 1.1, s1: 1.22}},
  {t: 314.0, img: '66', move: {s0: 1.2, s1: 1.08}},
  {t: 315.32, img: '67', move: {s0: 1.06, s1: 1.2}},
  {t: 316.5, img: '68', move: {s0: 1.2, s1: 1.06}},
  {t: 317.62, img: '24', move: {s0: 1.06, s1: 1.2}},
  {t: 319.0, img: '70', move: {s0: 1.2, s1: 1.06}},
  {t: 320.2, img: '28', move: {s0: 1.06, s1: 1.2}},
  {t: 321.36, img: '65', move: {s0: 1.25, s1: 1.1}},
  {t: 322.4, img: '66', move: {s0: 1.06, s1: 1.2}},
  {t: 323.0, img: '68', move: {s0: 1.06, s1: 1.18}},
  {t: 324.2, img: '39', move: {s0: 1.2, s1: 1.08}},
  {t: 325.82, img: '67', move: {s0: 1.25, s1: 1.06}},
  {t: 327.76, img: '29', placard: 'p29', slogan: ['LA DIGNITÉ', "N'EST PAS EN CARTON"], move: {s0: 1.0, s1: 1.12}},
  // ---- OUTRO · voix parlée, tambour seul
  {t: 332.4, img: '02', move: {s0: 1.2, s1: 1.04}, xf: 0.8},
  {t: 334.34, img: '34', move: {s0: 1.04, s1: 1.25, y1: 4}, xf: 0.4},
  {t: 339.5, img: '06', move: {s0: 1.04, s1: 1.15}},
  {t: 341.92, img: '69', move: {s0: 1.04, s1: 1.18}},
  {t: 344.42, img: '62', move: {s0: 1.0, s1: 1.25}},
  {t: 347.66, img: '71', move: {s0: 1.0, s1: 1.45, y1: 6}},
  {t: 358.13, gfx: 'redcard'},
  {t: 361.0, img: '72', move: {s0: 1.04, s1: 1.25}, xf: 0.8},
  {t: 376.6, gfx: 'title', xf: 0.6},
];

// Section chapters (top-left stencil card).
export const CHAPTERS = [
  {start: 69.2, title: 'Couplet 1', sub: 'Le carton de la République'},
  {start: 112.3, title: 'Qui fait les lois ?', sub: 'Appel et réponse'},
  {start: 142.6, title: 'Couplet 2', sub: 'La satire de Tonton'},
  {start: 177.2, title: 'Break gwo ka', sub: 'Pèp-la ka lévé'},
  {start: 194.0, title: 'Couplet 3', sub: 'La mémoire et la dignité'},
  {start: 249.8, title: 'Le pont', sub: 'Manman disait'},
  {start: 312.8, title: 'Grand carnaval', sub: 'Tout le monde chante'},
];

// Sections where the picture punches on every downbeat.
export const HOT = [[51, 68.6], [125.4, 142.4], [177.2, 193.4], [301.6, 332.3]];
export const BOUMS = [177.62, 179.8, 181.98, 178.6, 180.47, 182.69];
