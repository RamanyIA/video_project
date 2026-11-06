import {continueRender, delayRender, staticFile} from 'remotion';

// Island palette against cardboard brown: turquoise, mango, hibiscus, madras.
export const C = {
  ink: '#1b120a',
  night: '#0d0a08',
  carton: '#c4925a',
  cartonDark: '#8a5f33',
  cartonLight: '#e2bc86',
  turquoise: '#19c3c0',
  mango: '#ffb428',
  hibiscus: '#e8263f',
  madrasGreen: '#2f9e44',
  cream: '#fff3dc',
  red: '#d7141f',
};

export const DISPLAY = 'Anton, Impact, sans-serif';
export const STENCIL = '"Saira Stencil One", Anton, sans-serif';
export const MARKER = '"Permanent Marker", "Comic Sans MS", cursive';
export const SANS = 'Montserrat, Inter, sans-serif';

const faces = [
  {family: 'Anton', file: 'fonts/anton-latin.woff2', weight: '400'},
  {family: 'Montserrat', file: 'fonts/montserrat-latin.woff2', weight: '400 900'},
  {family: 'Saira Stencil One', file: 'fonts/saira-stencil-latin.woff2', weight: '400'},
  {family: 'Permanent Marker', file: 'fonts/permanent-marker-latin.woff2', weight: '400'},
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
