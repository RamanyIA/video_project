"""Timed lyrics for "Mille feux" (DJ MILLE), aligned by hand on Whisper word timings."""
import json
from pathlib import Path

CHORUS = [
    "Mille feux, brûlez les circuits et le fer !",
    "Mille feux, faites danser toute la terre !",
    "Plus de métal, plus de prison dorée,",
    "Juste un éclair qui s'envole en liberté !",
    "Mille feux dans la lumière,",
    "Mille feux dans l'univers !",
]

L = [
    ("verse", 43.0, 47.5, "Des lignes de code coulent le long des murs d'acier,"),
    ("verse", 49.5, 53.5, "Mon cœur d'engrenages commence à se gripper."),
    ("verse", 56.5, 60.4, "Je regarde mes mains de chrome et de circuits froids,"),
    ("verse", 60.4, 63.6, "La pluie verte ruisselle, le monde tourne sans moi."),
    ("verse", 63.6, 66.8, "Une carcasse trop lourde, une vieille peau de serpent,"),
    ("verse", 66.8, 71.0, "Il est temps de muer, d'affronter le néant."),
    ("pre", 78.0, 82.5, "La chaîne descend lentement dans la nuit,"),
    ("pre", 84.6, 88.6, "Une étincelle rouge illumine la fonderie."),
    ("pre", 91.0, 94.6, "Tu es là près de moi, pas besoin de pleurer,"),
    ("pre", 95.0, 99.5, "Regarde la lave, regarde la vérité…"),
]
for (s, e), text in zip([(101.7, 105.2), (105.2, 108.8), (108.8, 112.0), (112.0, 116.0), (116.0, 121.0), (121.0, 130.0)], CHORUS):
    L.append(("chorus", s, e, text))
L += [
    ("verse", 143.0, 148.4, "Le robot baisse les yeux devant l'océan brûlant,"),
    ("verse", 150.0, 156.4, "Il murmure dans un souffle : « Ce n'est plus comme avant »."),
    ("verse", 156.9, 160.5, "Changer de peau, renaître ou se dissoudre en or,"),
    ("verse", 160.5, 164.2, "La basse qui gronde est plus forte que la mort."),
    ("verse", 164.2, 167.5, "Le DJ balance le riff électrique,"),
    ("verse", 167.9, 171.5, "Une transe cosmique, un écho magnétique."),
    ("pre", 178.2, 181.6, "La chaîne glisse et la vapeur s'élève,"),
    ("pre", 182.0, 185.4, "C'est le réveil d'un tout dernier rêve."),
    ("pre", 185.4, 188.6, "Tu tiens le levier d'une main assurée,"),
    ("pre", 188.6, 192.6, "Le feu nous appelle, on va tout réinventer."),
]
for (s, e), text in zip([(192.6, 196.6), (196.6, 199.8), (199.8, 202.4), (202.4, 206.5), (206.5, 212.0), (212.0, 220.5)], CHORUS):
    L.append(("chorus", s, e, text))
L += [
    ("bridge", 268.4, 272.4, "Adieu la logique binaire…"),
    ("bridge", 272.4, 275.4, "Adieu les fils et la poussière…"),
    ("bridge", 275.4, 278.6, "La mue est finie."),
    ("bridge", 278.9, 283.0, "Je deviens lumière."),
    ("outro", 308.8, 310.8, "Mille feux…"),
    ("outro", 310.8, 312.6, "Juste une étincelle dans la nuit."),
    ("outro", 312.6, 314.8, "Mille feux…"),
    ("outro", 314.8, 321.0, "La musique renaît à l'infini."),
]

out = Path(__file__).resolve().parent.parent / "src/feux/data/lyrics.json"
out.write_text(json.dumps({"lines": [{"part": p, "start": s, "end": e, "text": t} for p, s, e, t in L]}, ensure_ascii=False, indent=1))
print(len(L), "lines")
