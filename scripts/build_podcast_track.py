"""Per-frame lip-sync + speaker track and karaoke captions for the podcast.

- speaker of each sentence = which of the two voice clusters its median pitch falls in
  (0 = high voice -> L'Amirale, 1 = low voice -> Le Général)
- mouth opening per video frame = loudness envelope (RMS) of the voice, only while a word
  of that speaker is being spoken, with fast attack / slower release so lips snap on syllables.

Usage: python3 scripts/build_podcast_track.py public/audio/mistral.m4a data/podcast_words.json src/podcast/data
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

FPS = 30
SR = 16000

audio_path, words_path, out_dir = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)

pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", audio_path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.float32)
duration = len(x) / SR
n_frames = int(np.ceil(duration * FPS))

# ---- loudness envelope per video frame (40 ms window centred on the frame)
hop = SR // FPS
win = int(0.04 * SR)
rms = np.zeros(n_frames)
for i in range(n_frames):
    c = i * hop
    seg = x[max(0, c - win // 2): c + win // 2]
    rms[i] = np.sqrt((seg ** 2).mean()) if len(seg) else 0
ref = np.percentile(rms[rms > 0], 95)
level = np.clip(rms / ref, 0, 1.2)

# ---- pitch track (100 Hz) for speaker clustering
phop, pwin = 160, 640
lo, hi = SR // 400, SR // 70
pn = (len(x) - pwin) // phop
f0 = np.zeros(pn)
for i in range(pn):
    fr = x[i * phop: i * phop + pwin]
    fr = fr - fr.mean()
    if np.sqrt((fr ** 2).mean()) < 0.01:
        continue
    ac = np.correlate(fr, fr, "full")[pwin - 1:]
    if ac[0] <= 0:
        continue
    lag = lo + int(np.argmax(ac[lo:hi]))
    if ac[lag] / ac[0] > 0.45:
        f0[i] = SR / lag

# ---- words -> sentences -> speaker
chunks = json.loads(words_path.read_text())["chunks"]
words = []
for c in chunks:
    t = c["text"]
    s, e = c["timestamp"][0], c["timestamp"][1] or c["timestamp"][0]
    # chunk overlap: timestamps jump back -> drop the already-transcribed tail (keep the later pass)
    if words and s < words[-1]["s"] - 0.5:
        while words and words[-1]["s"] >= s - 0.05:
            words.pop()
        t = " " + t.lstrip()
    if words and not t.startswith(" "):
        words[-1]["w"] += t
        words[-1]["e"] = max(words[-1]["e"], e)
    else:
        words.append({"w": t.strip(), "s": s, "e": e})
words = [w for w in words if w["w"]]

sentences, cur = [], []
for w in words:
    if cur and (w["s"] - cur[-1]["e"] > 0.7):
        sentences.append(cur)
        cur = []
    cur.append(w)
    if w["w"][-1] in ".?!":
        sentences.append(cur)
        cur = []
if cur:
    sentences.append(cur)


def med(s, e):
    seg = f0[int(s * 100): int(e * 100) + 1]
    seg = seg[seg > 0]
    return float(np.median(seg)) if len(seg) else 0.0


meds = np.array([med(s[0]["s"], s[-1]["e"]) for s in sentences])
voiced = meds[meds > 0]
c = np.percentile(voiced, [20, 80])
for _ in range(30):
    thr = c.mean()
    c = np.array([voiced[voiced < thr].mean(), voiced[voiced >= thr].mean()])
thr = c.mean()

speaker_of_frame = np.full(n_frames, -1, dtype=int)
prev = 0
for sent, m in zip(sentences, meds):
    spk = prev if m == 0 else (0 if m >= thr else 1)  # high voice -> admiral (0)
    prev = spk
    for w in sent:
        w["spk"] = spk
        a, b = int((w["s"] - 0.04) * FPS), int((w["e"] + 0.06) * FPS) + 1
        speaker_of_frame[max(0, a): min(n_frames, b)] = spk

# fill short gaps inside a turn so the mouth doesn't flicker between words
last, gap = -1, 0
for i in range(n_frames):
    if speaker_of_frame[i] >= 0:
        if 0 < gap <= 6 and last >= 0:
            speaker_of_frame[i - gap: i] = last
        last, gap = speaker_of_frame[i], 0
    else:
        gap += 1

# ---- mouth envelopes with attack/release
mouth = np.zeros((2, n_frames))
for spk in (0, 1):
    target = np.where(speaker_of_frame == spk, level, 0)
    target = np.clip((target - 0.08) / 0.75, 0, 1)
    v = 0.0
    for i in range(n_frames):
        a = 0.85 if target[i] > v else 0.45
        v = v + (target[i] - v) * a
        mouth[spk, i] = v

# ---- caption pages (max 5 words / 28 chars, split on pauses and speaker change)
pages, curp = [], []
for w in words:
    if curp:
        chars = sum(len(z["w"]) + 1 for z in curp) + len(w["w"])
        if (len(curp) >= 5 or chars > 28 or w["s"] - curp[-1]["e"] > 0.4 or w["spk"] != curp[-1]["spk"]
                or curp[-1]["w"][-1] in ".?!"):
            pages.append(curp)
            curp = []
    curp.append(w)
if curp:
    pages.append(curp)

(out_dir / "track.json").write_text(json.dumps({
    "fps": FPS,
    "duration": round(duration, 3),
    "speaker": speaker_of_frame.tolist(),
    "mouth0": [round(float(v), 2) for v in mouth[0]],
    "mouth1": [round(float(v), 2) for v in mouth[1]],
}, separators=(",", ":")))
(out_dir / "captions.json").write_text(json.dumps({"pages": [{
    "start": round(p[0]["s"], 3), "end": round(p[-1]["e"], 3), "speaker": p[0]["spk"],
    "words": [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3)} for w in p]} for p in pages]},
    ensure_ascii=False, separators=(",", ":")))
share = [(speaker_of_frame == k).mean() for k in (0, 1)]
print(f"{len(words)} words, {len(sentences)} sentences, voices {c.round(1)} Hz, "
      f"speaking share admiral {share[0]:.0%} general {share[1]:.0%}, {len(pages)} caption pages")
