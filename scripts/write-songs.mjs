import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatToken, parseMidi, writeMidi } from '../js/midi.js';
import { syllableLines } from '../js/syllables.js';
import { lyricsOf, notesOf, songs } from './songs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = join(root, 'songs');
mkdirSync(songsDir, { recursive: true });

const index = [];
songs.forEach((entry) => {
  entry.rows.forEach((row, line) => {
    const count = syllableLines(row[0], true)[0]?.length ?? 0;
    if (count !== row[1].length) {
      throw new Error(`${entry.id} line ${line + 1}: ${count} syllables, ${row[1].length} notes ("${row[0]}")`);
    }
  });
  const notes = notesOf(entry);
  const midi = writeMidi(notes);
  const parsed = parseMidi(midi).map((note) => formatToken(note.name, note.beats ?? 1));
  if (parsed.join(' ') !== notes.join(' ')) {
    throw new Error(`${entry.id} MIDI round-trip failed\n${parsed.join(' ')}\n${notes.join(' ')}`);
  }
  writeFileSync(join(songsDir, `${entry.id}.lyrics.txt`), `${lyricsOf(entry)}\n`);
  writeFileSync(join(songsDir, `${entry.id}.mid`), midi);
  index.push({ id: entry.id, title: entry.title, credit: entry.credit });
  console.log(`${entry.id}: wrote ${notes.length} notes`);
});

writeFileSync(join(songsDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`wrote ${index.length} songs`);
