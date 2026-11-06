"""Magic-trick sound effects for the Short hook (local seconds, 0 = song 159.684 s).
wand tap 0.12 s, rising shimmer 0.35 -> 1.6 s, powder 'poof' at 1.72 s (= song 161.4, "...pin")."""
import wave
from pathlib import Path

import numpy as np

SR = 44100
T = 4.0
out = np.zeros(int(SR * T))


def add(sig, at):
    i = int(at * SR)
    out[i:i + len(sig)] += sig[: len(out) - i]


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


rng = np.random.default_rng(7)
# wand tap: short bright click + bell
n = int(0.6 * SR)
t = np.arange(n) / SR
bell = sum(np.sin(2 * np.pi * f * t) * w for f, w in [(1760, 1), (2637, 0.5), (3520, 0.3)])
add(bell * env(n, 0.002, 0.18) * 0.35 + rng.normal(0, 1, n) * env(n, 0.0005, 0.004) * 0.3, 0.12)
# shimmer: rising pentatonic sparkles
notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3, 2637.0, 3136.0, 3520.0]
for k, f in enumerate(notes):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    add(np.sin(2 * np.pi * f * t) * env(n, 0.003, 0.12) * 0.16, 0.35 + k * 0.125)
# poof: filtered noise burst with a low thump
n = int(1.2 * SR)
t = np.arange(n) / SR
noise = rng.normal(0, 1, n)
k = int(0.0015 * SR)
noise = np.convolve(noise, np.ones(k) / k, mode="same")  # soften
thump = np.sin(2 * np.pi * (90 - 40 * t) * t) * np.exp(-t / 0.12)
add((noise * env(n, 0.01, 0.25) * 1.2 + thump * 0.8) * 0.55, 1.72)

out = out / max(1e-9, np.abs(out).max()) * 0.8
fade = np.minimum(1, (len(out) - np.arange(len(out))) / (0.2 * SR))
pcm = (out * fade * 32767).astype(np.int16)
dst = Path(__file__).resolve().parent.parent / "public/audio/sfx-magic.wav"
with wave.open(str(dst), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(dst)
