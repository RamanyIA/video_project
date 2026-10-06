import fs from 'node:fs';
import path from 'node:path';
const [asrDir, audioPath, outPath, ...ranges] = process.argv.slice(2);
const {pipeline, env} = await import(path.join(asrDir, 'node_modules/@huggingface/transformers/dist/transformers.node.mjs'));
env.allowRemoteModels = false;
env.localModelPath = path.join(asrDir, 'node_modules/sts-whisper-small/models') + '/';
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {dtype: 'q8', device: 'cpu'});
const buf = fs.readFileSync(audioPath);
const audio = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
const result = [];
for (const r of ranges) {
  const [a, b] = r.split('-').map(Number);
  const seg = audio.slice(Math.round(a * 16000), Math.round(b * 16000));
  const out = await asr(seg, {language: 'french', task: 'transcribe', return_timestamps: 'word'});
  const chunks = out.chunks.map((c) => ({text: c.text, timestamp: [c.timestamp[0] + a, (c.timestamp[1] ?? c.timestamp[0]) + a]}));
  result.push({range: [a, b], text: out.text, chunks});
  console.log(r, out.text);
}
fs.writeFileSync(outPath, JSON.stringify(result, null, 1));
