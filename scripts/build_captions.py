"""Build caption data for the Remotion short from the Whisper transcripts.

Steps:
  1. merge the full transcript with the re-transcribed robotics passage
     (Whisper looped on it in the full pass),
  2. glue sub-word tokens ("C" + "'est") into words,
  3. fix proper nouns / mis-heard words,
  4. group words into short caption pages,
  5. tag each page with a speaker (two voices) from its median pitch.

Usage: python3 scripts/build_captions.py  ->  src/data/captions.json
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public/audio/jev.m4a"
OUT = ROOT / "src/data/captions.json"

FIX_START, FIX_END = 238.5, 268.5  # window replaced by transcript_fix.json
FIX_SPLITS = [252.25, 263.6]  # boundaries between the overlapping fix segments

# (heard, correct) — matched on whole words, punctuation kept from the source.
CORRECTIONS = [
    ("au menu « Tirez IA »", "Au menu – IA"),
    ("Type Safe", "TypeSafe"),
    ("silicone valée", "Silicon Valley"),
    ("« Charge & PT »", "ChatGPT"),
    ("l'élève studio", "l'élève studieux"),
    ("« Jive »", "JEV"),
    ("nos hiéogénératives", "nos IA génératives"),
    ("par ce tordre", "par se tordre"),
    ("QCAM", "QCM"),
    ("de ses recherches", "de ces recherches"),
    ("gare de destination", "gares de destination"),
    ("modèle roue", "modèle route"),
    ("sont jamais se trompées", "sans jamais se tromper"),
    ("C'est aurissant", "C'est ahurissant"),
    ("bouton apprécié", "bouton approprié"),
    ("assez qu'aucasse", "assez cocasse"),
    ("de LIA", "de l'IA"),
    ("de filtres ultra rapides", "de filtre ultra rapide"),
    ("crucial, C'est", "crucial, c'est"),
    ("router ses tâches", "router ces tâches"),
    ("Et des validés", "Et les valider"),
    ("le nom de LIA", "le nom de l'IA"),
    ("paradoxe de Gévan", "paradoxe de Jevons"),
    ("les hiages génératives", "les IA génératives"),
    ("se font totalement", "se fond totalement"),
    ("ça lasse", "ça laisse"),
    ("La quelle", "Laquelle"),
    ("décisions éclaires", "décisions éclair"),
    ("décision fulgure en tant bout", "décision fulgurante en bout"),
    ("Smart If", "Smart IF"),
]
SINGLE = {"Jive": "JEV", "Jive,": "JEV,", "Jif": "JEV", "Jive.": "JEV."}

# Words that get the accent colour in captions.
KEYWORDS = {
    "jev", "ia", "openai", "chatgpt", "qcm", "système", "encodeur", "décodeur",
    "zéro", "shot", "smart", "if", "mario", "jevons", "robotique", "robot",
    "instinct", "hallucinations", "miroir", "miroirs", "millisecondes",
    "silicon", "valley", "typesafe", "pouvoir", "spam", "dark", "data",
    "centime", "rapide", "cher", "1", "2", "décision", "décisions",
}


def load_words():
    raw = json.loads((ROOT / "data/transcript_raw.json").read_text())["chunks"]
    fix = json.loads((ROOT / "data/transcript_fix.json").read_text())
    toks = [c for c in raw if c["timestamp"][0] < FIX_START]
    bounds = [FIX_START, *FIX_SPLITS, FIX_END]
    for seg, lo, hi in zip(fix, bounds, bounds[1:]):
        toks += [c for c in seg["chunks"] if lo <= c["timestamp"][0] < hi and c["text"].strip() != "..."]
    toks += [c for c in raw if c["timestamp"][0] >= FIX_END]

    words = []
    for c in toks:
        text = c["text"]
        s, e = c["timestamp"][0], c["timestamp"][1] or c["timestamp"][0]
        if words and not text.startswith(" "):  # sub-word token: glue to previous word
            words[-1]["w"] += text
            words[-1]["e"] = max(words[-1]["e"], e)
        else:
            words.append({"w": text.strip(), "s": s, "e": e})
    return [w for w in words if w["w"]]


def apply_corrections(words):
    def norm(t):
        return t.strip(" ,.?!").lower()

    for heard, right in CORRECTIONS:
        pat = heard.split()
        i = 0
        while i <= len(words) - len(pat):
            span = words[i : i + len(pat)]
            if all(norm(a["w"]) == norm(b) for a, b in zip(span, pat)):
                trail = "".join(ch for ch in span[-1]["w"][::-1] if ch in ",.?!")[::-1] if span[-1]["w"][-1] in ",.?!" else ""
                new = right.split()
                s, e = span[0]["s"], span[-1]["e"]
                step = (e - s) / len(new)
                repl = [{"w": t, "s": s + k * step, "e": s + (k + 1) * step} for k, t in enumerate(new)]
                if trail and not repl[-1]["w"].endswith(trail):
                    repl[-1]["w"] += trail
                words[i : i + len(pat)] = repl
                i += len(repl)
            else:
                i += 1
    for w in words:
        w["w"] = SINGLE.get(w["w"], w["w"])
        w["w"] = w["w"].replace("«", "").replace("»", "").strip()
    return [w for w in words if w["w"]]


def group_pages(words, max_words=4, max_chars=24, max_gap=0.35):
    pages, cur = [], []
    for w in words:
        if cur:
            gap = w["s"] - cur[-1]["e"]
            chars = sum(len(x["w"]) + 1 for x in cur) + len(w["w"])
            if len(cur) >= max_words or chars > max_chars or gap > max_gap or cur[-1]["w"][-1] in ".?!":
                pages.append(cur)
                cur = []
        cur.append(w)
    if cur:
        pages.append(cur)
    return pages


def pitch_track(sr=16000):
    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(AUDIO), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    x = np.frombuffer(pcm, dtype=np.float32)
    hop, win = 160, 640  # 10 ms hop, 40 ms window
    lo, hi = sr // 400, sr // 70
    n = (len(x) - win) // hop
    f0 = np.zeros(n)
    rms = np.zeros(n)
    for i in range(n):
        fr = x[i * hop : i * hop + win]
        fr = fr - fr.mean()
        rms[i] = np.sqrt((fr ** 2).mean())
        ac = np.correlate(fr, fr, "full")[win - 1 :]
        if ac[0] <= 0:
            continue
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] / ac[0] > 0.45:
            f0[i] = sr / lag
    f0[rms < 0.01] = 0
    return f0


def main():
    words = apply_corrections(load_words())
    pages = group_pages(words)
    f0 = pitch_track()

    def med(s, e):
        seg = f0[int(s * 100) : int(e * 100) + 1]
        seg = seg[seg > 0]
        return float(np.median(seg)) if len(seg) else 0.0

    # Speaker per sentence: pitch median over each sentence, split at the threshold
    # between the two voice clusters (simple 1-D 2-means).
    sentences, cur = [], []
    for p in pages:
        cur.append(p)
        if p[-1]["w"][-1] in ".?!":
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    meds = np.array([med(s[0][0]["s"], s[-1][-1]["e"]) for s in sentences])
    voiced = meds[meds > 0]
    c = np.percentile(voiced, [20, 80])
    for _ in range(20):
        thr = c.mean()
        c = np.array([voiced[voiced < thr].mean(), voiced[voiced >= thr].mean()])
    thr = c.mean()

    out = []
    prev_spk = 0
    for sent, m in zip(sentences, meds):
        spk = prev_spk if m == 0 else int(m >= thr)
        prev_spk = spk
        for p in sent:
            out.append({
                "start": round(p[0]["s"], 3),
                "end": round(p[-1]["e"], 3),
                "speaker": spk,
                "words": [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3),
                           "k": norm_kw(w["w"]) in KEYWORDS} for w in p],
            })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": audio_duration(), "pitchThreshold": thr, "pages": out}, ensure_ascii=False, indent=1))
    print(f"{len(words)} words, {len(out)} pages, voices at {c.round(1)} Hz -> {OUT.relative_to(ROOT)}")


def norm_kw(t):
    return t.strip(" ,.?!'’").lower()


def audio_duration():
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(AUDIO)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


if __name__ == "__main__":
    main()
