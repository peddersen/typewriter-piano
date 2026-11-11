const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const read16 = (data, pos) => (data[pos] << 8) | data[pos + 1];
const read32 = (data, pos) => ((data[pos] << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3]) >>> 0;

const readVar = (data, pos) => {
  let value = 0;
  let guard = 0;
  let byte = 0;
  do {
    if (pos >= data.length || guard > 4) throw new Error('Bad MIDI length');
    byte = data[pos];
    pos += 1;
    guard += 1;
    value = (value << 7) | (byte & 0x7f);
  } while (byte & 0x80);
  return [value, pos];
};

export const midiToName = (midi) => {
  const pitch = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return NAMES[pitch] + octave;
};

export const tokenBeats = (token) => {
  const text = String(token);
  const times = /^(.*?)\*(\d+(?:\.\d+)?)$/.exec(text);
  if (times) return { name: times[1], beats: Number(times[2]) };
  const divide = /^(.*?)\/(\d+(?:\.\d+)?)$/.exec(text);
  if (divide) return { name: divide[1], beats: 1 / Number(divide[2]) };
  return { name: text, beats: 1 };
};

export const formatToken = (name, beats) => {
  const snapped = Math.round(beats * 2) / 2;
  if (snapped === 1) return name;
  if (snapped === 0.5) return `${name}/2`;
  return `${name}*${snapped}`;
};

export const parseNote = (token) => {
  const { name } = tokenBeats(token);
  if (name === '_' || name === '.') return { rest: true, name: '_' };
  const match = /^([A-Ga-g])([#b♯♭]?)(-?\d)?$/.exec(name);
  if (!match) return null;
  let semi = SEMI[match[1].toUpperCase()];
  if (semi === undefined) return null;
  if (match[2] === '#' || match[2] === '♯') semi += 1;
  else if (match[2] === 'b' || match[2] === '♭') semi -= 1;
  const octave = match[3] === undefined ? 4 : Number.parseInt(match[3], 10);
  const midi = 12 * (octave + 1) + semi;
  const spelled = name.charAt(0).toUpperCase() + name.slice(1);
  return { midi, name: spelled, freq: 440 * 2 ** ((midi - 69) / 12) };
};

const writeVar = (value) => {
  const bytes = [value & 0x7f];
  let rest = value >> 7;
  while (rest > 0) {
    bytes.unshift((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  return bytes;
};

export const writeMidi = (names) => {
  const division = 480;
  const track = [];
  const push = (...bytes) => { track.push(...bytes); };
  let pending = 0;
  names.forEach((token) => {
    const { beats } = tokenBeats(token);
    const note = parseNote(token);
    if (!note) throw new Error(`Not a note: ${token}`);
    const ticks = Math.max(1, Math.round(division * beats));
    if (note.rest) {
      push(...writeVar(pending), 0xff, 0x01, 1, 0x5f);
      pending = ticks;
      return;
    }
    push(...writeVar(pending), 0x90, note.midi, 80);
    pending = 0;
    push(...writeVar(ticks), 0x80, note.midi, 0);
  });
  push(...writeVar(0), 0xff, 0x2f, 0x00);
  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (division >> 8) & 0xff, division & 0xff];
  const length = track.length;
  const body = [
    0x4d, 0x54, 0x72, 0x6b,
    (length >>> 24) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff,
    ...track,
  ];
  return Uint8Array.from([...header, ...body]);
};

export const parseMidi = (bytes) => {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (data.length < 14 || String.fromCharCode(data[0], data[1], data[2], data[3]) !== 'MThd') {
    throw new Error('Not a MIDI file');
  }
  const headerLength = read32(data, 4);
  const trackCount = read16(data, 10);
  const division = read16(data, 12) || 480;
  let pos = 8 + headerLength;
  const items = [];
  for (let track = 0; track < trackCount; track += 1) {
    if (String.fromCharCode(data[pos], data[pos + 1], data[pos + 2], data[pos + 3]) !== 'MTrk') {
      throw new Error('Missing MIDI track');
    }
    const length = read32(data, pos + 4);
    const end = pos + 8 + length;
    pos += 8;
    let tick = 0;
    let status = 0;
    while (pos < end) {
      let delta;
      [delta, pos] = readVar(data, pos);
      tick += delta;
      if (pos >= end) break;
      let byte = data[pos];
      if (byte >= 0x80) {
        pos += 1;
        if (byte >= 0x80 && byte < 0xf0) status = byte;
        else if (byte === 0xff) {
          const type = data[pos];
          pos += 1;
          let metaLength;
          [metaLength, pos] = readVar(data, pos);
          if (type === 0x01 && metaLength === 1 && data[pos] === 0x5f) items.push({ tick, rest: true });
          pos += metaLength;
          if (type === 0x2f) break;
          continue;
        } else if (byte === 0xf0 || byte === 0xf7) {
          let sysexLength;
          [sysexLength, pos] = readVar(data, pos);
          pos += sysexLength;
          status = 0;
          continue;
        } else {
          continue;
        }
      }
      if (!status) throw new Error('Bad MIDI event');
      const kind = status & 0xf0;
      const dataBytes = kind === 0xc0 || kind === 0xd0 ? 1 : 2;
      const first = data[pos];
      pos += 1;
      const second = dataBytes === 2 ? data[pos] : 0;
      if (dataBytes === 2) pos += 1;
      if (kind === 0x80 || (kind === 0x90 && second === 0)) items.push({ tick, midi: first, off: true });
      else if (kind === 0x90 && second > 0) items.push({ tick, midi: first, on: true });
    }
    pos = end;
  }
  items.sort((a, b) => a.tick - b.tick);
  const notes = [];
  const sounding = new Map();
  items.forEach((item) => {
    if (item.off) {
      const started = sounding.get(item.midi);
      if (started) started.beats = (item.tick - started.tick) / division;
      sounding.delete(item.midi);
      return;
    }
    if (item.rest) {
      notes.push({ tick: item.tick, rest: true, name: '_' });
      return;
    }
    if (!item.on) return;
    const note = { tick: item.tick, midi: item.midi, name: midiToName(item.midi), beats: 1 };
    notes.push(note);
    sounding.set(item.midi, note);
  });
  notes.forEach((note, index) => {
    if (!note.rest) return;
    const next = notes[index + 1];
    note.beats = next ? (next.tick - note.tick) / division : 1;
  });
  return notes.map(({ midi, name, rest, beats }) => (rest ? { rest: true, name, beats } : { midi, name, beats }));
};
