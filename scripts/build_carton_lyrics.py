"""Word-level timed lyrics for "1000 promesses en carton".

Aligns the written lyrics (data/carton_lyrics.txt) onto Whisper word timestamps
(data/carton_whisper.json) with a global Needleman-Wunsch alignment on fuzzy word
similarity, interpolates the words Whisper missed, then applies manual fixes (FIX).
Output: src/carton/data/lyrics.json
"""
import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TXT = ROOT / "data/carton_lyrics.txt"
ASR = ROOT / "data/carton_whisper.json"
SEG = ROOT / "data/carton_whisper_segments.json"  # cleaner re-runs on short windows (no hallucinated loops)
OUT = ROOT / "src/carton/data/lyrics.json"

# French translation shown under Creole lines.
TR = {
    "Éh Tonton ! (Hein ?)": "Eh Tonton !",
    "Ou ka tann mwen ?": "Tu m'entends ?",
    "Mille promesses ! (An ka tann !)": "J'entends !",
    "Mille promesses ! (An ka atann !)": "J'attends !",
    "Pani pwoblèm, ou ka di !": "Pas de problème, tu dis !",
    "Mé pwoblèm-la toujou isi !": "Mais le problème est toujours ici !",
    "Ou ka palé asi mil ton !": "Tu parles sur mille tons !",
    "Mille promesses en carton ! (Tonton !)": None,
    "Ou ka palé asi mil ton ! (Tonton !)": "Tu parles sur mille tons !",
    "Pani pwoblèm, pani pwoblèm !": "Pas de problème, pas de problème !",
    "Mé sé toujou nou ki ni pwoblèm !": "Mais c'est toujours nous qui avons des problèmes !",
    "Pa pran nou pou kouyon !": "Ne nous prends pas pour des idiots !",
    "Nou pa lé viv an carton !": "On ne veut pas vivre dans le carton !",
    "Ka-la ka sonné ! (BOUM !)": "Le tambour résonne !",
    "Pèp-la ka lévé ! (HÉ !)": "Le peuple se lève !",
    "Nou pa ka dòmi ! (HÉ !)": "On ne dort pas !",
    "Ou changé le carton ?": "Tu as changé le carton ?",
    "Chanjé ton ton !": "Change de ton !",
    "Pani pwoblèm ?": "Pas de problème ?",
    "Sé la pwomès-la ki an carton !": "C'est la promesse qui est en carton !",
    "Qui paie les choix ? (Sé nou !)": None,
    "Qui ramasse les miettes ? (Sé nou !)": None,
}
TR_RESP = {"Sé nou !": "C'est nous !", "An ka tann !": "J'entends !", "An ka atann !": "J'attends !"}


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    w = re.sub(r"[^a-z0-9]", "", w)
    return {"1000": "mille", "6000": "mille", "49": "quaranteneuf"}.get(w, w)


def parse():
    lines, part = [], "intro"
    for raw in TXT.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s:
            continue
        if s.startswith("["):
            part = s.strip("[]").split("–")[0].strip().lower()
            continue
        if re.fullmatch(r"\(.*\)", s):  # stage directions: (Pause), (Dernier coup...)
            continue
        resp = re.findall(r"\(([^)]*)\)", s)
        lead = re.sub(r"\s*\([^)]*\)", "", s).strip()
        lines.append({"part": part, "raw": s, "text": lead, "resp": resp})
    return lines


def tokens(lines):
    toks = []
    for li, l in enumerate(lines):
        for w in l["text"].replace("…", "… ").split():
            if norm(w):
                toks.append({"li": li, "w": w, "n": norm(w), "resp": None})
        for ri, r in enumerate(l["resp"]):
            for w in r.split():
                if norm(w):
                    toks.append({"li": li, "w": w, "n": norm(w), "resp": ri})
    return toks


def sim(a, b):
    if a == b:
        return 2.0
    r = SequenceMatcher(None, a, b).ratio()
    return 2.0 * r - 0.9  # >0 for reasonably close words


def align(L, A):
    n, m = len(L), len(A)
    gap_l, gap_a = -0.4, -0.35
    S = [[0.0] * (m + 1) for _ in range(n + 1)]
    B = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        S[i][0] = i * gap_l
        B[i][0] = 1
    for j in range(1, m + 1):
        S[0][j] = j * gap_a
        B[0][j] = 2
    for i in range(1, n + 1):
        li = L[i - 1]["n"]
        for j in range(1, m + 1):
            d = S[i - 1][j - 1] + sim(li, A[j - 1]["n"])
            u = S[i - 1][j] + gap_l
            le = S[i][j - 1] + gap_a
            if d >= u and d >= le:
                S[i][j], B[i][j] = d, 0
            elif u >= le:
                S[i][j], B[i][j] = u, 1
            else:
                S[i][j], B[i][j] = le, 2
    pairs = {}
    i, j = n, m
    while i > 0 or j > 0:
        b = B[i][j]
        if i > 0 and j > 0 and b == 0:
            if sim(L[i - 1]["n"], A[j - 1]["n"]) > 0.2:
                pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif i > 0 and (j == 0 or b == 1):
            i -= 1
        else:
            j -= 1
    return pairs


def main():
    lines = parse()
    toks = tokens(lines)
    segs = json.loads(SEG.read_text())
    inseg = lambda t: any(a <= t < b for a, b in (r["range"] for r in segs))
    asr = [c for c in json.loads(ASR.read_text())["chunks"] if not inseg(c["timestamp"][0])]
    for r in segs:
        asr += r["chunks"]
    asr.sort(key=lambda c: c["timestamp"][0])
    A = []
    for c in asr:
        s, e = c["timestamp"]
        e = e if e is not None else s + 0.3
        for w in c["text"].split():
            if norm(w):
                A.append({"n": norm(w), "s": s, "e": e, "w": w})
    for a, b in zip(A, A[1:]):  # a word ends at the latest when the next one starts
        a["e"] = min(a["e"], max(a["s"] + 0.12, b["s"]))
        if a["e"] - a["s"] > 1.2:
            a["e"] = a["s"] + 1.2
    pairs = align(toks, A)
    for k, j in pairs.items():
        toks[k]["s"], toks[k]["e"] = A[j]["s"], A[j]["e"]
    # interpolate gaps between anchors, weighted by word length
    anchors = [k for k in range(len(toks)) if "s" in toks[k]]
    print(f"{len(anchors)}/{len(toks)} lyric words anchored on {len(A)} ASR words")
    prev_end, prev_k = 0.0, -1
    for k in anchors + [len(toks)]:
        nxt = toks[k]["s"] if k < len(toks) else prev_end + 2.0
        gap = toks[prev_k + 1:k]
        if gap:
            wsum = sum(len(t["n"]) + 1 for t in gap)
            span = max(0.2 * len(gap), nxt - prev_end) if k < len(toks) else 0.35 * len(gap)
            span = min(span, 0.45 * len(gap) + 0.3)  # don't stretch over instrumental gaps
            start = nxt - span if k < len(toks) else prev_end
            acc = start
            for t in gap:
                d = span * (len(t["n"]) + 1) / wsum
                t["s"], t["e"], t["interp"] = round(acc, 2), round(acc + d, 2), True
                acc += d
        if k < len(toks):
            prev_end, prev_k = toks[k]["e"], k
    return lines, toks


# Manual fixes (checked against the short-window Whisper runs): (line text, occurrence, start, end)
FIX = [
    ("Éh Tonton !", 0, 14.14, 15.0),
    ("Ou ka tann mwen ?", 0, 19.32, 20.4),
    ("Depuis là-bas, jusqu'ici,", 0, 23.0, 24.3),
    ("Depuis les îles jusqu'à Paris…", 0, 26.88, 29.2),
    ("Mille promesses !", 0, 33.38, 34.2),
    ("Mille promesses !", 1, 34.4, 35.5),
    ("Mille promesses en carton…", 3, 367.5, 369.0),
    ("Mille promesses en carton…", 4, 369.22, 370.9),
    ("Sé la pwomès-la ki an carton !", 0, 373.8, 376.6),
]
# Choir answers: (line text, occurrence, answer index, start)
RESP_FIX = [
    ("Éh Tonton !", 0, 0, 16.2),
    ("Mille promesses !", 0, 0, 34.0),
    ("Mille promesses !", 1, 0, 35.8),
]


def retime(words, a, b):
    s0, e0 = words[0]["s"], words[-1]["e"]
    k = (b - a) / max(0.05, e0 - s0)
    if any(w2["s"] <= w1["s"] for w1, w2 in zip(words, words[1:])):  # collapsed timestamps: spread by length
        tot = sum(len(w["w"]) + 1 for w in words)
        acc = a
        for w in words:
            d = (b - a) * (len(w["w"]) + 1) / tot
            w["s"], w["e"] = round(acc, 2), round(acc + d, 2)
            acc += d
        return
    for w in words:
        w["s"], w["e"] = round(a + (w["s"] - s0) * k, 2), round(a + (w["e"] - s0) * k, 2)


def apply_fixes(out):
    def find(text, occ):
        hits = [l for l in out if l["text"] == text]
        return hits[occ]
    for text, occ, a, b in FIX:
        l = find(text, occ)
        retime(l["words"], a, b)
        l["start"], l["end"] = a, b
        for r in l["resp"]:
            if r["start"] < b:
                r["start"], r["end"] = round(b + 0.05, 2), round(b + 0.7, 2)
    for text, occ, ri, a in RESP_FIX:
        r = find(text, occ)["resp"][ri]
        r["start"], r["end"] = a, round(a + 0.6, 2)


if __name__ == "__main__":
    lines, toks = main()
    out = []
    for li, l in enumerate(lines):
        lw = [t for t in toks if t["li"] == li and t["resp"] is None]
        resp = []
        for ri, r in enumerate(l["resp"]):
            rw = [t for t in toks if t["li"] == li and t["resp"] == ri]
            resp.append({"text": r, "start": round(rw[0]["s"], 2), "end": round(rw[-1]["e"], 2), "tr": TR_RESP.get(r)})
        out.append({
            "part": l["part"], "text": l["text"], "tr": TR.get(l["raw"]),
            "start": round(lw[0]["s"], 2), "end": round(lw[-1]["e"], 2),
            "words": [{"w": t["w"], "s": round(t["s"], 2), "e": round(t["e"], 2), **({"i": 1} if t.get("interp") else {})} for t in lw],
            "resp": resp,
        })
    apply_fixes(out)
    for l in out:  # keep every word inside its line and choir answers after the line
        for r in l["resp"]:
            r["start"] = max(r["start"], round(l["end"] - 0.1, 2))
            r["end"] = max(r["end"], r["start"] + 0.5)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"lines": out}, ensure_ascii=False, indent=1))
    for l in out:
        ni = sum(1 for w in l["words"] if w.get("i"))
        print(f"{l['start']:7.2f}-{l['end']:7.2f} [{ni}/{len(l['words'])}] {l['text']}  " + " ".join(f"({r['text']}@{r['start']})" for r in l["resp"]))
