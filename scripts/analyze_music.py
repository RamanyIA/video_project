"""Beat / energy analysis of a song for motion design sync.

Usage: python3 scripts/analyze_music.py public/audio/mille-poemes.mp3 src/poemes/data/music.json
Outputs tempo, beat times, downbeats (every 4 beats), an energy curve (10 Hz, 0-1)
and section boundaries from novelty in the chroma/MFCC self-similarity.
"""
import json
import sys
from pathlib import Path

import librosa
import numpy as np

src, out = sys.argv[1], Path(sys.argv[2])
y, sr = librosa.load(src, sr=22050, mono=True)
duration = len(y) / sr

tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
tempo = float(np.atleast_1d(tempo)[0])

hop = 2205  # 10 Hz
rms = librosa.feature.rms(y=y, frame_length=4410, hop_length=hop)[0]
rms = np.convolve(rms, np.ones(5) / 5, mode="same")
energy = (rms - rms.min()) / (rms.max() - rms.min() + 1e-9)

onset = librosa.onset.onset_strength(y=y, sr=sr)
on_times = librosa.times_like(onset, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=10, post_max=10, pre_avg=50, post_avg=50, delta=onset.std() * 1.5, wait=20)
hits = [round(float(on_times[p]), 2) for p in peaks]

# sections: agglomerative segmentation on beat-synced features
chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
feat = np.vstack([librosa.util.normalize(chroma, axis=1), librosa.util.normalize(mfcc, axis=1)])
beat_frames = librosa.time_to_frames(beats, sr=sr)
sync = librosa.util.sync(feat, beat_frames)
k = max(4, int(duration // 25))
bounds = librosa.segment.agglomerative(sync, k)
bound_times = [0.0] + [round(float(beats[min(b, len(beats) - 1)]), 2) for b in bounds[1:]]

def mean_energy(a, b):
    seg = energy[int(a * 10): max(int(a * 10) + 1, int(b * 10))]
    return round(float(seg.mean()), 3)

edges = bound_times + [duration]
sections = [{"start": a, "end": round(b, 2), "energy": mean_energy(a, b)} for a, b in zip(edges, edges[1:])]

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({
    "duration": round(duration, 3),
    "tempo": round(tempo, 2),
    "beats": [round(float(b), 3) for b in beats],
    "hits": hits,
    "energy": [round(float(e), 3) for e in energy],
    "sections": sections,
}))
print(f"duration {duration:.1f}s tempo {tempo:.1f} bpm, {len(beats)} beats, {len(hits)} hits")
for s in sections:
    print(f"  {s['start']:7.2f} -> {s['end']:7.2f}  energy {s['energy']:.2f}  " + "#" * int(s['energy'] * 40))
