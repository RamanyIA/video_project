"""Synthesize an ORIGINAL Breton-style military march (bagad feel) as background music.

Not a cover of any existing tune: the melody below is composed for this project.
Instruments are synthesized with numpy: bagpipe chanter (biniou/bombarde-like reedy tone),
drones on D and A, march snare and bass drum.

Usage: python3 scripts/synth_bagad.py <seconds> public/audio/bagad.wav
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 108
BEAT = 60 / BPM  # quarter note, 2/4 march

D4 = 293.66
# scale degrees of D mixolydian relative to D4 (semitones)
DEG = {"a3": -5, "b3": -3, "d": 0, "e": 2, "f#": 4, "g": 5, "a": 7, "b": 9, "c": 10, "d'": 12, "e'": 14}

# Original 8-bar phrases (note, length in quarter beats) — A part and B part, AABB form.
A = [("a", .5), ("d'", .5), ("c", .25), ("b", .25), ("a", .5), ("f#", .5), ("a", .5), ("g", .25), ("f#", .25), ("e", .5),
     ("d", .5), ("e", .25), ("f#", .25), ("g", .5), ("a", .5), ("b", .5), ("a", .5), ("f#", 1),
     ("a", .5), ("d'", .5), ("c", .25), ("b", .25), ("a", .5), ("b", .5), ("c", .5), ("d'", .25), ("c", .25), ("b", .5),
     ("a", .5), ("f#", .25), ("g", .25), ("a", .5), ("e", .5), ("f#", .5), ("e", .5), ("d", 1)]
B = [("d'", .5), ("e'", .25), ("d'", .25), ("c", .5), ("a", .5), ("b", .5), ("c", .25), ("b", .25), ("a", 1),
     ("g", .5), ("a", .25), ("g", .25), ("f#", .5), ("d", .5), ("e", .5), ("f#", .5), ("g", .5), ("a", .5),
     ("d'", .5), ("e'", .25), ("d'", .25), ("c", .5), ("a", .5), ("b", .5), ("a", .25), ("g", .25), ("f#", .5), ("a", .5),
     ("g", .5), ("f#", .25), ("e", .25), ("d", .5), ("a3", .5), ("d", .5), ("f#", .5), ("d", 1)]
TUNE = A + A + B + B


def freq(n):
    return D4 * 2 ** (DEG[n] / 12)


def reed(f, dur, vib=True):
    t = np.arange(int(dur * SR)) / SR
    v = 1 + (0.004 * np.sin(2 * np.pi * 5.5 * t) if vib else 0)
    ph = 2 * np.pi * f * np.cumsum(v) / SR
    # bright reedy spectrum: odd+even harmonics with slow rolloff
    sig = sum((0.9 ** k) / k * np.sin(k * ph) for k in range(1, 14))
    env = np.minimum(1, t / 0.012) * np.minimum(1, (dur - t) / 0.02 + 0.0)
    env = np.clip(env, 0, 1)
    return sig * env


def grace(f, dur):
    """Short high grace note before melody notes — typical of pipes."""
    return reed(f * 2 ** (5 / 12) * 2, dur, vib=False)


def snare(dur, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = np.random.default_rng(int(dur * 1e6) % 9999).standard_normal(n)
    tone = np.sin(2 * np.pi * 190 * t)
    return amp * (0.75 * noise + 0.35 * tone) * np.exp(-t / 0.06)


def kick(dur):
    t = np.arange(int(dur * SR)) / SR
    f = 110 * np.exp(-t / 0.05) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)


def render_loop():
    total_beats = sum(d for _, d in TUNE)
    n = int(total_beats * BEAT * SR)
    melody = np.zeros(n)
    pos = 0.0
    for note, d in TUNE:
        start = int(pos * BEAT * SR)
        g = 0.035
        if d >= 0.5:
            gs = grace(freq(note), g)
            melody[start:start + len(gs)] += 0.5 * gs[: n - start]
            start += len(gs)
        s = reed(freq(note), d * BEAT - (g if d >= 0.5 else 0))
        melody[start:start + len(s)] += s[: max(0, n - start)]
        pos += d
    t = np.arange(n) / SR
    drone = 0.35 * reed(D4 / 2, n / SR, vib=False) + 0.25 * reed(D4 * 0.75, n / SR, vib=False)  # D3 + A3
    drone *= 0.6 + 0.05 * np.sin(2 * np.pi * 0.2 * t)

    drums = np.zeros(n)
    # 2/4 march snare: roll pattern per bar (8 sixteenths), accents on beats
    sixteenth = BEAT / 4
    pattern = [1.0, 0.35, 0.5, 0.35, 0.9, 0.35, 0.6, 0.6]
    i = 0
    while i * sixteenth * SR < n:
        a = pattern[i % 8]
        s = snare(0.18, a)
        st = int(i * sixteenth * SR)
        drums[st:st + len(s)] += s[: n - st]
        if i % 4 == 0:
            k = kick(0.4)
            drums[st:st + len(k)] += 0.9 * k[: n - st]
        i += 1

    mix = 0.55 * melody / np.abs(melody).max() + 0.35 * drone / np.abs(drone).max() + 0.45 * drums / np.abs(drums).max()
    return mix


def main():
    seconds = float(sys.argv[1])
    out = sys.argv[2]
    loop = render_loop()
    reps = int(np.ceil(seconds * SR / len(loop)))
    sig = np.tile(loop, reps)[: int(seconds * SR)]
    # gentle low-pass (moving average) so it sits under voices, then fade in/out
    k = 5
    sig = np.convolve(sig, np.ones(k) / k, mode="same")
    fade = int(2 * SR)
    sig[:fade] *= np.linspace(0, 1, fade)
    sig[-fade * 2:] *= np.linspace(1, 0, fade * 2)
    sig = sig / np.abs(sig).max() * 0.8
    pcm = (sig * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{out}: {seconds:.1f}s, loop {len(loop) / SR:.1f}s")


if __name__ == "__main__":
    main()
