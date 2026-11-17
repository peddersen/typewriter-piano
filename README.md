# Typewriter Piano

Type the lyrics. Each syllable has one note, the vowel plays it, and the note lasts as long as you hold the key. The lyrics run past as one line, and a green chip lands on each vowel when it is time to play it. The song you pick brings its own melody.

## Run

```bash
node scripts/write-songs.mjs
node scripts/build-catalog.mjs
python3 -m http.server 8765
```

Open http://127.0.0.1:8765 , click the page, and type. The catalog is fetched, so the page needs a local server.

## Songs

All songs are public domain. Each one is a lyrics file and a monophonic MIDI file in `songs/`, written from `scripts/songs.mjs`. `catalog.json` is generated from those files. Pick a song from the badge at the top to load both the words and the pitches.
