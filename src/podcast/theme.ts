import {continueRender, delayRender, staticFile} from 'remotion';

// Navy / gold / radar cyan — naval + air force + digital.
export const PC = {
  navy: '#07122b',
  navy2: '#13254d',
  gold: '#e3b341',
  cyan: '#4fd8ff',
  white: '#f4f7ff',
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = 'Montserrat, Inter, sans-serif';

let loaded = false;
export const loadPodcastFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    [
      {family: 'Playfair Display', file: 'fonts/playfair-latin.woff2'},
      {family: 'Montserrat', file: 'fonts/montserrat-latin.woff2'},
    ].map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: '400 900'});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
};
