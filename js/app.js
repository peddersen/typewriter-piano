import { parseNote, tokenBeats } from './midi.js';
import { baseChar, isLetter, syllableLines } from './syllables.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const lyricsEl = $('lyrics');
const statusEl = $('status');
const countEl = $('count');
const songBadge = $('songBadge');
const songTitle = $('songTitle');
const songSheet = $('songSheet');
const songList = $('songList');
const ticker = $('ticker');
const chip = $('chip');

const STORE = 'typewriter-piano-v1';
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const esc = (char) => char.replace(/[&<>"]/g, (mark) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[mark]));

let catalog = [];
let currentId = 'twinkle';
let songLyrics = '';
let songNotes = [];
let score = [];
let layout = [];
let noteLines = [];
let noteTokens = 0;
let notesBad = [];
let ignoredLines = 0;
let play = { syllable: 0, letter: 0, last: null };
let armed = false;
let importNote = '';
let typingTimer = 0;
let missTimer = 0;
let lastLineTop = -1;

const isTypingTarget = (target) => !!target && (
  target.tagName === 'TEXTAREA'
  || target.tagName === 'INPUT'
  || target.tagName === 'SELECT'
  || target.tagName === 'BUTTON'
  || target.isContentEditable
);

const findSong = (id) => catalog.find((song) => song.id === id);

const loadStore = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (raw && typeof raw.currentId === 'string') currentId = raw.currentId;
  } catch (error) {
    currentId = 'twinkle';
  }
};

const saveStore = () => {
  try {
    localStorage.setItem(STORE, JSON.stringify({ v: 1, currentId }));
  } catch (error) {
    /* private mode */
  }
};

const renderPicker = () => {
  const current = findSong(currentId);
  songTitle.textContent = current ? current.title : 'Song';
  songList.replaceChildren();
  catalog.forEach((song) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = song.title;
    button.dataset.id = song.id;
    if (song.id === currentId) button.setAttribute('aria-current', 'true');
    item.appendChild(button);
    songList.appendChild(item);
  });
  fitList();
};

const fitList = () => {
  let size = Math.min(56, Math.floor(window.innerWidth / 12));
  size = Math.max(18, size);
  songList.style.fontSize = `${size}px`;
  while (size > 16 && songList.scrollHeight > window.innerHeight - 24) {
    size -= 1;
    songList.style.fontSize = `${size}px`;
  }
};

const openSongs = () => {
  songSheet.hidden = false;
  songBadge.setAttribute('aria-expanded', 'true');
  renderPicker();
  const current = songList.querySelector('[aria-current="true"]');
  if (current) current.focus();
};

const closeSongs = () => {
  songSheet.hidden = true;
  songBadge.setAttribute('aria-expanded', 'false');
  stage.focus({ preventScroll: true });
};

const parseScore = () => {
  score = [];
  layout = [];
  songLyrics.split(/\r?\n/).forEach((line) => {
    const words = line.trim().split(/\s+/).filter(Boolean);
    const lineWords = [];
    words.forEach((word) => {
      const parts = [];
      syllableLines(word, true).forEach((row) => {
        row.forEach((part) => {
          const syllable = {
            i: score.length,
            raw: part.raw,
            letters: part.letters,
            nuc: part.nuc,
            extra: 0,
            live: false,
            note: null,
            el: null,
          };
          score.push(syllable);
          parts.push(syllable.i);
        });
      });
      if (parts.length) lineWords.push(parts);
    });
    if (lineWords.length) layout.push(lineWords);
  });
  noteTokens = songNotes.length;
  let beatCursor = 0;
  score.forEach((syllable, index) => {
    const token = songNotes[index];
    const beats = token ? tokenBeats(token).beats : 1;
    syllable.beatAt = beatCursor;
    syllable.beats = beats;
    beatCursor += beats;
    if (!token) return;
    const note = parseNote(token);
    if (!note) {
      notesBad.push(token);
      return;
    }
    if (!note.rest) syllable.note = note;
  });
};

const renderSyllable = (index) => {
  const syllable = score[index];
  if (!syllable?.el) return;
  const done = index < play.syllable ? syllable.letters.length : (index === play.syllable ? play.letter : 0);
  let letterIndex = 0;
  let html = '';
  Array.from(syllable.raw).forEach((char) => {
    if (isLetter(char)) {
      const at = letterIndex;
      letterIndex += 1;
      let cls = at < done ? 'done' : 'todo';
      let text = esc(char);
      let note = '';
      if (at === syllable.nuc && syllable.note) {
        cls += at < done ? ` tone-key ${syllable.live ? 'live' : 'played'}` : ' tone-key ahead';
        note = ` data-note="${esc(syllable.note.name)}"`;
        cls += ' hit';
        if (at < done && syllable.extra) text = text.repeat(1 + syllable.extra);
      }
      if (index === play.syllable && at === play.letter) cls += ' next';
      html += `<span class="${cls}"${note}>${text}</span>`;
      return;
    }
    const shown = index < play.syllable || (index === play.syllable && (letterIndex > 0 ? play.letter >= letterIndex : play.letter > 0));
    html += `<span class="${shown ? 'done' : 'todo'}">${esc(char)}</span>`;
  });
  syllable.el.innerHTML = html;
};

const buildDOM = () => {
  lyricsEl.replaceChildren();
  if (!score.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Add lyrics in the score below to begin.';
    lyricsEl.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  layout.forEach((line, lineIndex) => {
    if (lineIndex) {
      const gap = document.createElement('span');
      gap.className = 'phrase-gap';
      gap.textContent = '\u00a0';
      fragment.appendChild(gap);
    }
    line.forEach((word) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'w';
      word.forEach((index) => {
        const el = document.createElement('span');
        score[index].el = el;
        wordEl.appendChild(el);
      });
      fragment.appendChild(wordEl);
      fragment.appendChild(document.createTextNode(' '));
    });
  });
  lyricsEl.appendChild(fragment);
  score.forEach((syllable, index) => renderSyllable(index));
};

const follow = () => {
  const syllable = score[Math.min(play.syllable, score.length - 1)];
  if (!syllable?.el) return;
  const top = syllable.el.offsetTop;
  if (top === lastLineTop) return;
  lastLineTop = top;
  lyricsEl.scrollTo({
    top: Math.max(0, top - lyricsEl.clientHeight / 2 + syllable.el.offsetHeight / 2),
    behavior: motionQuery.matches ? 'auto' : 'smooth',
  });
};

const updateStatus = () => {
  if (!score.length) {
    statusEl.textContent = '';
    countEl.textContent = '';
    return;
  }
  const finished = play.syllable >= score.length;
  statusEl.textContent = finished ? 'Esc plays it again' : (armed ? 'Listening' : 'Type to play');
  countEl.textContent = `${Math.min(play.syllable, score.length)} / ${score.length}`;
};

const fitType = () => {
  const room = lyricsEl.clientHeight;
  if (room < 24) return;
  let size = Math.min(76, Math.floor(lyricsEl.clientWidth / 8));
  size = Math.max(16, size);
  lyricsEl.style.fontSize = `${size}px`;
  while (size > 15 && lyricsEl.scrollHeight > room + 1) {
    size -= 1;
    lyricsEl.style.fontSize = `${size}px`;
  }
};

const restart = () => {
  releaseAll();
  play = { syllable: 0, letter: 0, last: null };
  score.forEach((syllable) => {
    syllable.extra = 0;
    syllable.live = false;
  });
  score.forEach((syllable, index) => renderSyllable(index));
  lastLineTop = -1;
  lyricsEl.scrollTop = 0;
  resetRoll();
  if (armed) beginRoll();
  updateStatus();
};

const rebuild = () => {
  releaseAll();
  parseScore();
  play = { syllable: 0, letter: 0, last: null };
  lastLineTop = -1;
  buildDOM();
  resetRoll();
  if (armed) beginRoll();
  updateStatus();
  draw();
  requestAnimationFrame(fitType);
};

const selectSong = (id) => {
  const song = findSong(id) || catalog[0];
  if (!song) return;
  currentId = song.id;
  songTitle.textContent = song.title;
  songLyrics = song.lyrics || '';
  songNotes = Array.isArray(song.notes) ? song.notes : [];
  saveStore();
  rebuild();
};

let audioContext = null;
let master = null;

const impulse = (seconds, decay) => {
  const length = Math.floor(audioContext.sampleRate * seconds);
  const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** decay;
  }
  return buffer;
};

const ensureAudio = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    if (!audioContext) {
      audioContext = new AudioCtx({ latencyHint: 'interactive' });
      const compressor = audioContext.createDynamicsCompressor();
      compressor.connect(audioContext.destination);
      master = audioContext.createGain();
      master.gain.value = 0.8;
      master.connect(compressor);
      const convolver = audioContext.createConvolver();
      convolver.buffer = impulse(1.6, 2.6);
      const wet = audioContext.createGain();
      wet.gain.value = 0.2;
      master.connect(convolver);
      convolver.connect(wet);
      wet.connect(compressor);
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return true;
  } catch (error) {
    return false;
  }
};

const synthStart = (freq) => {
  if (!audioContext) return null;
  const time = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.42, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.3, time + 0.4);
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(Math.min(freq * 8, 7000), time);
  filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 3, 3000), time + 0.6);
  const partials = [['triangle', 1, 0, 0.6], ['sine', 2, 0, 0.18], ['triangle', 1, 7, 0.3]];
  const oscillators = partials.map((partial) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = partial[0];
    oscillator.frequency.value = freq * partial[1];
    oscillator.detune.value = partial[2];
    const partialGain = audioContext.createGain();
    partialGain.gain.value = partial[3];
    oscillator.connect(partialGain);
    partialGain.connect(filter);
    oscillator.start(time);
    return oscillator;
  });
  filter.connect(gain);
  gain.connect(master);
  return { gain, oscillators };
};

const synthRelease = (voice) => {
  if (!voice || !audioContext) return;
  const time = audioContext.currentTime;
  try {
    const value = Math.max(voice.gain.gain.value, 0.0001);
    voice.gain.gain.cancelScheduledValues(time);
    voice.gain.gain.setValueAtTime(value, time);
    voice.gain.gain.setTargetAtTime(0.0001, time, 0.07);
  } catch (error) {
    /* already stopped */
  }
  voice.oscillators.forEach((oscillator) => {
    try { oscillator.stop(time + 0.6); } catch (error) { /* already stopped */ }
  });
};

const BEAT_MS = 1100;
const LEAD_MS = 2400;
let rollFrame = 0;
let clockOn = false;
let clockOrigin = 0;
let clockShown = 0;

const rollNow = () => (clockOn ? performance.now() : clockShown);

const beginRoll = () => {
  if (clockOn || !score.length) return;
  const now = performance.now();
  if (!clockOrigin) clockOrigin = now + LEAD_MS;
  else clockOrigin += now - clockShown;
  clockOn = true;
  kick();
};

const pauseRoll = () => {
  if (!clockOn) return;
  clockShown = performance.now();
  clockOn = false;
  draw();
};

const resetRoll = () => {
  clockOn = false;
  clockOrigin = 0;
  clockShown = 0;
  draw();
};

const rollStart = () => null;

const rollEnd = () => {};

const FALL_MS = 900;

const hitPoints = () => score.flatMap((syllable) => {
  if (!syllable.note || !syllable.el) return [];
  const mark = syllable.el.querySelector('.hit');
  if (!mark) return [];
  return [{
    syllable,
    t: clockOrigin + syllable.beatAt * BEAT_MS,
    x: mark.offsetLeft + mark.offsetWidth / 2,
  }];
});

const draw = () => {
  if (!ticker || !clockOrigin) {
    chip.hidden = true;
    return;
  }
  const now = rollNow();
  const points = hitPoints();
  const center = ticker.clientWidth / 2;
  let x = 0;
  if (!points.length) {
    lyricsEl.style.transform = 'translate(0, -50%)';
  } else if (now <= points[0].t) {
    const from = points[0].x - center * 0.65;
    const start = points[0].t - LEAD_MS;
    const u = now <= start ? 0 : (now - start) / LEAD_MS;
    x = from + (points[0].x - from) * Math.min(1, Math.max(0, u));
  } else {
    let index = points.length - 1;
    for (let cursor = 0; cursor < points.length - 1; cursor += 1) {
      if (now < points[cursor + 1].t) {
        index = cursor;
        break;
      }
    }
    const here = points[index];
    const next = points[index + 1];
    if (!next) x = here.x;
    else x = here.x + (next.x - here.x) * ((now - here.t) / (next.t - here.t));
  }
  lyricsEl.style.transform = `translate(${center - x}px, -50%)`;
  const upcoming = points.find((point) => point.t >= now - 120);
  if (!upcoming) {
    chip.hidden = true;
    return;
  }
  const remain = upcoming.t - now;
  if (remain > FALL_MS) {
    chip.hidden = true;
    return;
  }
  const fall = motionQuery.matches ? 1 : 1 - Math.max(0, remain) / FALL_MS;
  const travel = ticker.clientHeight * 0.22;
  chip.hidden = false;
  chip.textContent = (upcoming.syllable.letters[upcoming.syllable.nuc] || '').toUpperCase();
  chip.style.top = `calc(50% - ${travel * (1 - Math.min(1, fall))}px)`;
};

const frame = () => {
  rollFrame = 0;
  draw();
  const busy = clockOn;
  if (busy) rollFrame = requestAnimationFrame(frame);
};

const kick = () => {
  if (!rollFrame) rollFrame = requestAnimationFrame(frame);
};

const fit = () => {
  draw();
};

const voices = new Map();

const endVoice = (voice) => {
  if (voices.get(voice.code) === voice) voices.delete(voice.code);
  synthRelease(voice.node);
  rollEnd(voice.bar);
  let still = false;
  voices.forEach((other) => {
    if (other.syllable === voice.syllable) still = true;
  });
  voice.syllable.live = still;
  renderSyllable(voice.syllable.i);
};

const releaseAll = () => {
  [...voices.values()].forEach(endVoice);
};

const startVoice = (syllable, code) => {
  const previous = voices.get(code);
  if (previous) endVoice(previous);
  const voice = { syllable, code, node: null, bar: null };
  if (syllable.note) {
    voice.node = synthStart(syllable.note.freq);
    voice.bar = rollStart(syllable);
  }
  voices.set(code, voice);
  syllable.live = true;
  renderSyllable(syllable.i);
};

const accept = (code) => {
  const syllable = score[play.syllable];
  const index = play.letter;
  play.letter += 1;
  play.last = { syllable, index };
  if (index === syllable.nuc) startVoice(syllable, code);
  const finished = play.letter >= syllable.letters.length;
  if (finished) {
    play.syllable += 1;
    play.letter = 0;
  }
  renderSyllable(syllable.i);
  if (finished && play.syllable < score.length) renderSyllable(play.syllable);
  follow();
  updateStatus();
};

const extend = (syllable, code, fromRepeat) => {
  if (syllable.extra < 60) syllable.extra += 1;
  if (fromRepeat) renderSyllable(syllable.i);
  else startVoice(syllable, code);
};

const miss = () => {
  stage.classList.add('miss');
  clearTimeout(missTimer);
  missTimer = setTimeout(() => stage.classList.remove('miss'), 170);
};

const handleKey = (key, code, repeat) => {
  const syllable = score[play.syllable];
  const last = play.last;
  const held = last && last.index === last.syllable.nuc ? last.syllable : null;
  const heldKey = held ? held.letters[held.nuc] : null;
  if (repeat) {
    const voice = voices.get(code);
    if (!voice) return;
    if (syllable && voice.syllable === syllable && syllable.letters[play.letter] === key) {
      accept(code);
      return;
    }
    if (held && voice.syllable === held && key === heldKey) extend(held, code, true);
    return;
  }
  if (syllable && syllable.letters[play.letter] === key) {
    accept(code);
    return;
  }
  if (held && key === heldKey) {
    extend(held, code, false);
    return;
  }
  miss();
};

document.addEventListener('keydown', (event) => {
  if (!songSheet.hidden) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSongs();
    }
    return;
  }
  if (isTypingTarget(event.target)) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    restart();
    return;
  }
  if (event.key === ' ') {
    event.preventDefault();
    return;
  }
  if (!event.key || Array.from(event.key).length !== 1) return;
  if (!isLetter(event.key) || !score.length) return;
  event.preventDefault();
  ensureAudio();
  handleKey(baseChar(event.key), event.code || event.key, event.repeat);
});

document.addEventListener('keyup', (event) => {
  const voice = voices.get(event.code || event.key);
  if (voice) endVoice(voice);
});

window.addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  releaseAll();
  pauseRoll();
});

document.addEventListener('pointerdown', (event) => {
  const target = event.target;
  if (isTypingTarget(target) || target.closest?.('button, a, summary, label')) return;
  ensureAudio();
  stage.focus({ preventScroll: true });
});

stage.addEventListener('focus', () => {
  armed = true;
  stage.classList.add('armed');
  beginRoll();
  updateStatus();
});
stage.addEventListener('blur', () => {
  armed = false;
  stage.classList.remove('armed');
  pauseRoll();
  updateStatus();
});

songBadge.addEventListener('click', () => {
  if (songSheet.hidden) openSongs();
  else closeSongs();
});
songList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  ensureAudio();
  selectSong(button.dataset.id);
  closeSongs();
});
songSheet.addEventListener('click', (event) => {
  if (event.target === songSheet) closeSongs();
});

const refit = () => {
  fit();
  fitType();
  if (!songSheet.hidden) fitList();
};
if (window.ResizeObserver) {
  const observer = new ResizeObserver(refit);
  observer.observe(stage);
} else window.addEventListener('resize', refit);

const start = async () => {
  loadStore();
  try {
    const response = await fetch('catalog.json');
    if (!response.ok) throw new Error('missing catalog');
    catalog = (await response.json()).songs;
  } catch (error) {
    statusEl.textContent = 'Could not load songs. Serve this folder over http.';
    return;
  }
  if (!findSong(currentId)) currentId = 'twinkle';
  if (!findSong(currentId)) currentId = catalog[0]?.id;
  renderPicker();
  selectSong(currentId);
  fit();
  fitType();
  try { stage.focus({ preventScroll: true }); } catch (error) { /* focus can wait */ }
};

start();
