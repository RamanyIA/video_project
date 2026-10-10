import {continueRender, delayRender, staticFile} from 'remotion';

// Foundry palette from the cover: black steel, molten orange, green rain.
export const F = {
  black: '#060508',
  steel: '#23252c',
  chrome: '#c9ced8',
  molten: '#ff5a00',
  fire: '#ffb000',
  red: '#ff1f1f',
  green: '#39ff6a',
  white: '#fff4e0',
};

export const DISPLAY = 'Anton, Impact, sans-serif';
export const SANS = 'Montserrat, Inter, sans-serif';

const faces = [
  {family: 'Anton', file: 'fonts/anton-latin.woff2', weight: '400'},
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
