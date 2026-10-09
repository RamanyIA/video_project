import {continueRender, delayRender, staticFile} from 'remotion';

// Hot "world tour" palette picked from the images: hibiscus red, sunset orange, gold, tropical teal.
export const A = {
  night: '#1a0620',
  plum: '#3a0d3f',
  red: '#ff2e4c',
  orange: '#ff8a00',
  gold: '#ffd23f',
  teal: '#00d1b2',
  pink: '#ff5fa2',
  cream: '#fff6e8',
};

export const DISPLAY = 'Anton, Impact, sans-serif';
export const SCRIPT = 'Pacifico, cursive';
export const SANS = 'Montserrat, Inter, sans-serif';

const faces = [
  {family: 'Anton', file: 'fonts/anton-latin.woff2', weight: '400'},
  {family: 'Pacifico', file: 'fonts/pacifico-latin.woff2', weight: '400'},
  {family: 'Montserrat', file: 'fonts/montserrat-latin.woff2', weight: '400 900'},
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}
