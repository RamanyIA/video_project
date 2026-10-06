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
