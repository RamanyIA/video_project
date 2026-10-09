import {continueRender, delayRender, staticFile} from 'remotion';

// Palette taken from the "Mille poèmes" cover: powder pinks, mint, peach on misty grey.
export const P = {
  mist: '#efe9ee',
  mist2: '#ddd6e3',
  ink: '#3d3346',
  inkSoft: '#6d6178',
  pink: '#f4a7c0',
  rose: '#e8798f',
  mint: '#9fe0cc',
  peach: '#f6a66f',
  coral: '#e8664f',
  lilac: '#c7b5e8',
  steel: '#5c5a63',
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = 'Montserrat, Inter, sans-serif';

const faces = [
  {family: 'Playfair Display', file: 'fonts/playfair-latin.woff2', style: 'normal'},
  {family: 'Playfair Display', file: 'fonts/playfair-italic-latin.woff2', style: 'italic'},
  {family: 'Montserrat', file: 'fonts/montserrat-latin.woff2', style: 'normal'},
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: '400 900', style: f.style});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}
