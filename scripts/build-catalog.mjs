import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatToken, parseMidi } from '../js/midi.js';
import { syllableLines } from '../js/syllables.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = join(root, 'songs');
const index = JSON.parse(readFileSync(join(songsDir, 'index.json'), 'utf8'));
const catalog = [];
let failed = false;

index.forEach((entry) => {
  const lyrics = readFileSync(join(songsDir, `${entry.id}.lyrics.txt`), 'utf8').replace(/\n$/, '');
  const notes = parseMidi(readFileSync(join(songsDir, `${entry.id}.mid`))).map((note) => formatToken(note.name, note.beats ?? 1));
  const lines = syllableLines(lyrics, true);
  let cursor = 0;
  let songFailed = false;
  for (let line = 0; line < lines.length; line += 1) {
    const need = lines[line].length;
    const have = Math.max(0, notes.length - cursor);
    if (have < need) {
      console.error(`${entry.id} line ${line + 1}: ${need} syllables, ${have} notes`);
      songFailed = true;
      failed = true;
      break;
    }
    cursor += need;
  }
  if (!songFailed && notes.length > cursor) {
    console.error(`${entry.id}: ${notes.length - cursor} extra notes`);
    songFailed = true;
    failed = true;
  }
  if (!songFailed) console.log(`${entry.id}: ${cursor} syllables, lines match`);
  catalog.push({ ...entry, lyrics, notes });
});

if (failed) process.exit(1);
writeFileSync(join(root, 'catalog.json'), `${JSON.stringify({ songs: catalog }, null, 2)}\n`);
console.log('wrote catalog.json');
