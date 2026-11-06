# Au menu – IA · Short « JEV »

Short vertical (1080×1920, 30 fps) en motion design, généré avec [Remotion](https://www.remotion.dev/)
à partir de la voix off `public/audio/jev.m4a` (4 min 45).

## Structure

| Chemin | Rôle |
| --- | --- |
| `public/audio/jev.m4a` | voix off (podcast à deux voix) |
| `public/photos/` | photos intégrées (recadrées automatiquement en 9:16) |
| `public/fonts/` | Montserrat, embarquée pour un rendu hors ligne |
| `data/transcript_*.json` | transcription Whisper brute, mot par mot |
| `scripts/build_captions.py` | corrections + découpage en sous-titres + détection des 2 voix → `src/data/captions.json` |
| `src/scenes.ts` | **storyboard** : moment de début, recadrage photo et animation de chaque scène |
| `src/components/` | fond animé, carte photo, sous-titres karaoké, animations par idée |

## Commandes

```bash
npm install
npm run studio                       # prévisualiser / ajuster dans le navigateur
python3 scripts/build_captions.py    # après avoir modifié les corrections de texte
npm run render                       # -> out/short.mp4
node scripts/stills.mjs 10 60 120    # images de contrôle à 10 s, 60 s, 120 s -> out/stills/
```

Dans l'environnement cloud, préfixer les rendus par
`REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

## Modifier la vidéo

- **Texte mal transcrit** : ajouter une paire dans `CORRECTIONS` de `scripts/build_captions.py`, relancer le script.
- **Changer une scène** : éditer `src/scenes.ts` (temps de début, photo `CROPS.*`, titre, emoji).
- **Couleurs** : `src/theme.ts`.

---

# 1000 promesses en carton · clip (16:9)

Clip 1920×1080, 30 fps, 6 min 23 — `PromessesCarton` dans `src/Root.tsx`, rendu : `renders/1000-promesses-en-carton.mp4`.

| Chemin | Rôle |
| --- | --- |
| `public/audio/promesses-carton.mp3` | la chanson |
| `public/carton/NN.jpg` | les 72 plans du storyboard, remis en 1920×1080 |
| `data/carton_lyrics.txt` | paroles **telles qu'elles sont chantées** (break à 3 « Ka-la ka sonné », a cappella final ×5) |
| `data/carton_whisper*.json` | Whisper mot à mot (passe complète + passes courtes sur l'intro, le break et l'outro) |
| `scripts/build_carton_lyrics.py` | alignement paroles ↔ voix (Needleman-Wunsch) + corrections `FIX` / `RESP_FIX` → `src/carton/data/lyrics.json` |
| `src/carton/storyboard.ts` | **montage** : chaque coupe tombe sur une ligne chantée ; `gfx` = motion design plein écran, `over` = incrust sur photo |
| `src/carton/components/Lyrics.tsx` | karaoké sur bande de carton déchirée, traduction des lignes en créole, tampons rouges du chœur |
| `src/carton/components/Gfx.tsx` | boîte-titre, compteur de promesses, prix du riz, passage piéton, pizza-programme, poker, Jupiter, ticket « quoi qu'il en coûte », calculatrice en carton, tampon 49.3, I.A., carton rouge, slogans écrits sur les pancartes |

```bash
python3 scripts/build_carton_lyrics.py
COMP=PromessesCarton node scripts/stills.mjs 35 123.8 299
npx remotion render src/index.ts PromessesCarton out/promesses-carton.mp4 --crf=20
```

## Short « Présidentielle 2027 » (9:16), v2 sobre

`ShortCarton` (`src/carton/short/ShortCarton.tsx`) : 33 s → `renders/1000-promesses-short-v2.mp4`.
- 0–4,5 s : accroche « tour de magie » sur « La poudre de perlimpinpin » (la promesse dorée part en fumée sur « …pin »),
  effets sonores synthétisés par `scripts/synth_magic_sfx.py` → `public/audio/sfx-magic.wav`.
- 4,5–8,7 s : bascule « 18 avril 2027 · Présidentielle », puis « Les promesses reviennent » sur « le beurre a fondu en chemin ».
- puis raccord sur le temps vers « Éh Tonton ! Pa pran nou pou kouyon ! » et le refrain 2, et la carte « Le clip complet sur la chaîne ».
