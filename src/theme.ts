import {continueRender, delayRender, staticFile} from 'remotion';

// Montserrat (variable 600–900), bundled locally so renders work offline.
export const FONT = 'Montserrat, Inter, sans-serif';

const fontFiles = [
  {file: 'fonts/montserrat-latin.woff2', range: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'},
  {file: 'fonts/montserrat-latin-ext.woff2', range: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF'},
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Montserrat');
  Promise.all(
    fontFiles.map((f) => {
      const face = new FontFace('Montserrat', `url(${staticFile(f.file)}) format('woff2')`, {weight: '600 900', unicodeRange: f.range});
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
}

export const C = {
  bg: '#050816',
  bg2: '#0b1233',
  blue: '#2f7bff',
  cyan: '#38e1ff',
  red: '#ff2d4a',
  yellow: '#ffd23f',
  green: '#2ee59d',
  white: '#ffffff',
  muted: '#9aa6d6',
};

// Accent colour per detected speaker (0 = low voice, 1 = high voice).
export const SPEAKER = [C.cyan, C.yellow];
