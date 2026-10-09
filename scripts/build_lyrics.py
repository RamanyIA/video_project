"""Write src/poemes/data/lyrics.json from the artist's lyrics, timed by hand against
Whisper segment timings (Tamil / French / English passes) of public/audio/mille-poemes.mp3.

Each entry: (start, end, text). Text in (parentheses) is a backing vocal.
"""
import json
from pathlib import Path

L = [
    # Verse 1
    (25.8, 30.4, "மாலை வரும்போது, உன்னை நினைக்கிறேன்,"),
    (30.4, 35.4, "மணிநேரங்களை எண்ணிய பின்னும்."),
    (35.4, 41.4, "மாலைக் காற்று உன்னைப் பற்றிப் பேசுகிறது,"),
    (41.4, 47.0, "நான் உன்னை என் இதயத்தோடு அணைத்துக்கொள்கிறேன்."),
    (47.5, 52.3, "Quand vient le soir, je compte les heures,"),
    (52.5, 57.3, "Le vent me parle de toi, je te serre contre mon cœur"),
    # Chorus 1
    (57.5, 60.0, "Ohhh — give me, I say give me"),
    (60.0, 64.0, "What I want, gi-i-i-ive (give it to me…)"),
    (64.0, 68.0, "Me, me, me, me, me, me (yeah, yeah)"),
    (68.0, 71.0, "Give me, I say give me"),
    (71.0, 74.0, "And then you love me (love me, love me…)"),
    (74.0, 78.0, "Me, me, me, me, me, me"),
    (78.0, 82.8, "This love devient mille poèmes"),
    (83.0, 86.0, "That I ne-e-e-e-ed (I need it too…)"),
    (86.0, 88.0, "Nee, nee, nee, nee"),
    (88.0, 90.5, "'Cause you need me (you need me)"),
    (90.5, 93.0, "(I need you…)"),
    (93.0, 98.5, "Give me (ohhhh)"),
    (99.0, 101.0, "Mille poèmes"),
    (101.0, 105.5, "Mmm — I wrote them all for you (for me…)"),
    (105.5, 109.6, "Mille poèmes… just to get to you"),
    # Verse 2
    (110.0, 114.8, "மாலை வரும்போது, இறைவா, நான் உன்னை எவ்வளவு நேசிக்கிறேன்,"),
    (115.0, 119.6, "நான் உன்னுடன் மட்டுமே இருக்கிறேன்."),
    (120.0, 125.0, "நீ தூரத்தில் இருந்தாலும், உன்னை எனக்குள் வைத்திருக்கிறேன்,"),
    (125.0, 129.0, "உனக்காகக் காத்திருக்கிறேன், எப்போதும் காத்திருக்கிறேன்."),
    (129.1, 132.0, "Mon Dieu, que je t'aime, seul avec toi,"),
    (132.0, 135.0, "Même si tu es loin, je te garde en moi,"),
    (135.0, 141.0, "Pour l'éternité je t'attendrai (for youuu)"),
    # Pre-chorus
    (141.0, 145.5, "உனக்காக ஆயிரம் பிரச்சினைகள்,"),
    (145.5, 151.0, "எனக்காக ஆயிரம் பிரச்சினைகள்,"),
    (151.0, 156.0, "Mille problèmes pour toi, mille problèmes pour moi,"),
    (156.0, 162.0, "Mais quand tu dis « je t'aime »… ils deviennent mille poèmes"),
    # Bridge
    (162.2, 167.0, "நீ சென்றாலும், என் இதயம் உன்னுடன் இருக்கும்."),
    (167.0, 169.2, "காற்றில் ஆயிரம் பிரச்சினைகள்,"),
    (169.2, 172.0, "வசந்த காலத்தில் ஆயிரம் பிரச்சினைகள்,"),
    (172.0, 173.7, "உன் பெயரை, உன் பெயரை,"),
    (173.7, 177.0, "Même si tu t'en vas, mon cœur reste avec toi,"),
    (177.0, 179.0, "Mille poèmes dans le vent,"),
    (179.0, 182.0, "mille poèmes au printemps,"),
    (182.0, 190.0, "Et ton nom, et ton nom…"),
    # Verse 3
    (198.0, 201.5, "ஒவ்வொரு பருவத்திலும் நான் பாடுகிறேன்."),
    (201.5, 204.5, "உனக்காக ஆயிரம் பிரச்சினைகள்,"),
    (204.5, 207.0, "ஓ-ஓ… உனக்காக மட்டுமே,"),
    (207.0, 209.0, "உன் பெயரை, உன் பெயரை,"),
    (209.0, 211.0, "என் பாடலில் மீண்டும் வாழும்."),
    (211.0, 215.0, "Je le chante à chaque saison,"),
    (215.0, 218.0, "Oh-oh… rien que pour toi,"),
    (218.0, 221.5, "Et ton nom, et ton nom"),
    (221.5, 225.0, "Refleurira dans ma chanson"),
    # Final verse
    (225.0, 229.0, "காலை வரும்போது, உன்னை நினைக்கிறேன்,"),
    (229.0, 234.0, "உன் திரும்பி வருகையை கனவில் கண்ட பின்னும்."),
    (234.0, 239.0, "வழியெங்கும் மலர்களை விதைக்கிறேன்,"),
    (239.0, 245.0, "நீ திரும்பி வரும்போது அவற்றைக் காண்பதற்காக."),
    # Final chorus
    (245.5, 249.0, "Quand vient le matin, je pense à toi,"),
    (249.0, 252.0, "again and again, je pense à toi"),
    (252.0, 254.2, "Je ne compte plus les heures,"),
    (254.2, 256.6, "sur ton chemin, je sème des fleurs"),
    (256.6, 258.0, "and then I say"),
    (258.0, 260.0, "(ohhhh) give me, I say give me"),
    (260.0, 264.0, "what I want, giiiiive"),
    (264.0, 267.0, "me, me, me, me, me, me"),
    (267.0, 270.0, "give me, I say give me"),
    (270.0, 272.0, "and then you love me"),
    (272.0, 276.0, "me, me, me, me, me, me"),
    (276.0, 281.0, "this love devient mille poèmes"),
    (281.0, 284.0, "that I neeeeed"),
    (284.0, 286.0, "nee, nee, nee, nee"),
    (286.0, 290.0, "'cause you need me (you need me)"),
    (290.0, 294.0, "give me (ohhhh)"),
    (294.0, 297.0, "Mille poèmes"),
    (297.0, 301.0, "mmmmmm…"),
]

out = Path(__file__).resolve().parent.parent / "src/poemes/data/lyrics.json"
lines = []
for s, e, text in L:
    lines.append({"start": s, "end": e, "text": text, "big": text.strip("…. ").lower() == "mille poèmes"})
out.write_text(json.dumps({"lines": lines}, ensure_ascii=False, indent=1))
print(len(lines), "lines ->", out)
