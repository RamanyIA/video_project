// Render preview stills at given seconds: node scripts/stills.mjs 2 30 65 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({serveUrl, id: 'Short', browserExecutable});
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = `out/stills/t${String(t).padStart(5, '0')}.jpg`;
  await renderStill({composition, serveUrl, output, frame, imageFormat: 'jpeg', browserExecutable, scale: 0.5});
  console.log(output);
}
