# AGENTS.md

Project notes for Typewriter Piano. General working rules (TDD, git, writing style) live in your global `AGENTS.md` and are not repeated here. This repository is public, so never add tokens, billing details, or other personal data.

## What it is

A static web page where typing lyrics plays a melody. Each syllable has one note. The vowel of the syllable (its nucleus) starts the note on keydown and stops it on keyup, so typing drives the sound. The lyrics run as one line from right to left, and a green chip drops onto the next vowel at its beat. The moving line and the chip are only a timing guide. They never play or block a note.

## Run locally

```bash
node scripts/write-songs.mjs     # only after editing scripts/songs.mjs
node scripts/build-catalog.mjs   # fails if syllables and notes differ on any line
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765 and click the page. Opening `index.html` from `file://` does not work, because the catalog is fetched.

## Layout

- `index.html` holds all markup and CSS.
- `js/app.js` runs the stage, clock, lyric ticker, chip, keyboard handling, and synth.
- `js/syllables.js` splits words into syllables and finds each nucleus.
- `js/midi.js` reads and writes MIDI and handles beat tokens: `C4` is one beat, `C4*2` two beats, `C4/2` half a beat, `_` a rest.
- `scripts/songs.mjs` is the source of truth for every song.
- `songs/` and `catalog.json` are generated from it and committed.

## Adding a song

- Words and melody must both be public domain. Never add copyrighted lyrics or melodies, and never extract them from MIDI files a user supplies.
- The melody must be syllabic: exactly one note per syllable on every line. Use hyphens in the lyrics to force a split.
- Edit `scripts/songs.mjs`, run both scripts, and commit the regenerated `songs/` files and `catalog.json`.

## Product rules that must hold

- The whole page fits the viewport. The page never scrolls.
- Colours come from the dark k_ai tokens in `:root`. Signal green is used only for state and for the underscore in the `k_ai` mark.
- Geist and Inter from Google Fonts are the only external dependency. There is no framework, no build step, and no npm dependency.
- These were removed on purpose. Do not bring them back unless asked: the song editor and MIDI import, the karaoke wipe, speed modes, the 3-2-1 count-in, and the side piano roll.
- The bottom-right "Built by k_ai" credit links to LinkedIn and opens in a new tab.

## Testing

- Run `node --test js/*.test.js`.
- Run `node --check js/app.js` after editing JavaScript.
- For visual checks, drive headless Chrome over DevTools and set the viewport with `Emulation.setDeviceMetricsOverride` (1280×800 and a phone size). `--window-size` does not set the CSS viewport. Bring the page to the front first, otherwise `visibilitychange` pauses the clock.

## Deploy

- The site is the Vercel project `typewriter-piano` under the personal scope `kaipetersxanten-8684s-projects`. Production is https://www.typewriter-piano.com. DNS stays at GoDaddy, with the A record for `@` and the CNAME for `www` shown on the project's Domains page in Vercel.
- Deploy from a copy without `.git` or tests, because the commit email is not a member of the Vercel project:

  ```bash
  rm -rf /tmp/typewriter-piano-deploy
  rsync -a --exclude .git --exclude .DS_Store --exclude 'js/*.test.js' ./ /tmp/typewriter-piano-deploy/
  npx vercel@latest deploy /tmp/typewriter-piano-deploy --prod --yes \
    --scope kaipetersxanten-8684s-projects --project typewriter-piano
  ```

- Web Analytics uses the plain-HTML snippet at the end of `index.html`, which loads `/_vercel/insights/script.js`. Do not install `@vercel/analytics`.
