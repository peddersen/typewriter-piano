# Typewriter Piano

Type the lyrics. Each syllable has one note, the vowel plays it, and the note lasts as long as you hold the key. There is no tempo. The song you pick brings its own melody.

## Run

```bash
node scripts/write-songs.mjs
node scripts/build-catalog.mjs
python3 -m http.server 8765
```

Open http://127.0.0.1:8765 , click the page, and type. The catalog is fetched, so the page needs a local server.

## Songs

Built-in songs are public domain. Each one is a lyrics file and a monophonic MIDI file in `songs/`. `catalog.json` is generated from those files. Picking a song loads both the words and the pitches.

Your own songs, including a MIDI import, stay in this browser (`localStorage`). They are not uploaded.

Open Score to edit a title, lyrics, and notes. A line check compares syllables and notes per line. Save keeps a copy here. Built-in songs are not overwritten.
