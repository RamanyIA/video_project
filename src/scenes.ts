// Storyboard: one entry per idea of the voice-over, times in seconds of the audio.
// `photo` is a crop box in the 1536x1024 source photo, `graphic` picks the motion
// graphic drawn over the lower part of the photo card.

export type Box = {x: number; y: number; w: number; h: number};
export type PhotoRef = {src: string; box: Box};

export type GraphicKind =
  | 'logo' | 'chip' | 'jev' | 'system2' | 'qcm' | 'mirrors' | 'mirror'
  | 'spam' | 'zeroshot' | 'switch' | 'speedcost' | 'game' | 'fatigue'
  | 'm2m' | 'jevons' | 'robot' | 'question' | 'outro';

export type Scene = {
  start: number;
  photo: PhotoRef;
  graphic: GraphicKind;
  emoji?: string;
  title?: string;
  sub?: string;
};

const P1 = 'photos/photo1.jpg'; // pointing, studio, JEV screen
const P2 = 'photos/photo2.jpg'; // thumbs up, burger
const P3 = 'photos/photo3.jpg'; // podcast mic, feature panels
const P4 = 'photos/photo4.jpg'; // collage of activities

export const CROPS = {
  p1Face: {src: P1, box: {x: 430, y: 40, w: 760, h: 900}},
  p1Screen: {src: P1, box: {x: 1010, y: 90, w: 526, h: 440}},
  p2Face: {src: P2, box: {x: 420, y: 20, w: 760, h: 880}},
  p2Panels: {src: P2, box: {x: 1000, y: 90, w: 536, h: 480}},
  p3Face: {src: P3, box: {x: 360, y: 40, w: 720, h: 900}},
  p3Panels: {src: P3, box: {x: 860, y: 0, w: 676, h: 660}},
  p3Menu: {src: P3, box: {x: 0, y: 200, w: 520, h: 420}},
  p4Center: {src: P4, box: {x: 418, y: 0, w: 776, h: 665}},
  expliquer: {src: P4, box: {x: 0, y: 0, w: 410, h: 340}},
  reflechir: {src: P4, box: {x: 0, y: 340, w: 410, h: 320}},
  sport: {src: P4, box: {x: 1200, y: 0, w: 336, h: 380}},
  voyager: {src: P4, box: {x: 1200, y: 378, w: 336, h: 290}},
  creer: {src: P4, box: {x: 0, y: 668, w: 330, h: 356}},
  developper: {src: P4, box: {x: 335, y: 668, w: 290, h: 356}},
  presenter: {src: P4, box: {x: 1190, y: 668, w: 346, h: 356}},
} satisfies Record<string, PhotoRef>;

export const SCENES: Scene[] = [
  {start: 0, photo: CROPS.p3Face, graphic: 'logo'},
  {start: 3.3, photo: CROPS.p1Face, graphic: 'chip', emoji: '🔥', title: "L'ANNONCE IA", sub: 'la plus importante du moment'},
  {start: 7.7, photo: CROPS.p3Menu, graphic: 'chip', emoji: '▶️', title: 'AUSSI EN VIDÉO', sub: 'sur la chaîne YouTube Au menu – IA'},
  {start: 16.5, photo: CROPS.presenter, graphic: 'chip', emoji: '⏱️', title: '3 MINUTES', sub: "on va à l'essentiel"},
  {start: 20.0, photo: CROPS.p4Center, graphic: 'chip', emoji: '🚀', title: 'TYPESAFE', sub: 'fondée par Diego Almeida, ex-OpenAI'},
  {start: 26.9, photo: CROPS.p1Screen, graphic: 'jev'},
  {start: 33.0, photo: CROPS.p1Face, graphic: 'chip', emoji: '🤐', title: 'ZÉRO PHRASE', sub: 'une IA incapable de rédiger'},
  {start: 39.8, photo: CROPS.reflechir, graphic: 'system2'},
  {start: 55.0, photo: CROPS.p2Face, graphic: 'qcm'},
  {start: 66.9, photo: CROPS.expliquer, graphic: 'mirrors'},
  {start: 87.9, photo: CROPS.developper, graphic: 'mirror'},
  {start: 101.2, photo: CROPS.reflechir, graphic: 'spam'},
  {start: 116.4, photo: CROPS.p3Face, graphic: 'chip', emoji: '🧱', title: 'TROP RIGIDES', sub: "des milliers d'exemples par tâche"},
  {start: 131.7, photo: CROPS.p3Face, graphic: 'zeroshot'},
  {start: 142.9, photo: CROPS.presenter, graphic: 'switch'},
  {start: 158.5, photo: CROPS.p2Face, graphic: 'speedcost'},
  {start: 167.0, photo: CROPS.creer, graphic: 'game'},
  {start: 187.7, photo: CROPS.reflechir, graphic: 'fatigue'},
  {start: 199.3, photo: CROPS.developper, graphic: 'm2m'},
  {start: 206.2, photo: CROPS.p3Panels, graphic: 'jevons'},
  {start: 218.9, photo: CROPS.expliquer, graphic: 'chip', emoji: '🗂️', title: 'DARK DATA', sub: "des millions d'avis clients"},
  {start: 225.7, photo: CROPS.p2Panels, graphic: 'chip', emoji: '🪙', title: '< 1 CENTIME', sub: 'des milliards de micro-décisions'},
  {start: 235.3, photo: CROPS.sport, graphic: 'robot'},
  {start: 263.7, photo: CROPS.p1Face, graphic: 'chip', emoji: '🌐', title: 'INSTINCT NUMÉRIQUE', sub: 'des milliards de décisions invisibles'},
  {start: 276.8, photo: CROPS.p4Center, graphic: 'question'},
  {start: 285.7, photo: CROPS.p3Face, graphic: 'outro'},
];

// Seconds of branded outro after the voice-over ends.
export const OUTRO_TAIL = 3;
