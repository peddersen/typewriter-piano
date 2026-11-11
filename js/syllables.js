const LETTER = /\p{L}/u;
const VOWELS = { a: 1, e: 1, i: 1, o: 1, u: 1 };
const CLUSTERS = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr',
  'th', 'sh', 'ch', 'ph', 'wh', 'sw', 'tw', 'wr',
]);

export const baseChar = (char) => char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const isVowelAt = (letters, index) => {
  const char = letters[index];
  if (!VOWELS[char] && char !== 'y') return false;
  if (char === 'y' && index === 0 && letters.length > 1 && VOWELS[letters[1]]) return false;
  if (char === 'u' && index > 0 && letters[index - 1] === 'q') return false;
  return true;
};

const nucleusIndex = (letters) => {
  for (let i = 0; i < letters.length; i += 1) {
    if (VOWELS[letters[i]]) return i;
  }
  const y = letters.indexOf('y');
  return y < 0 ? 0 : y;
};

const syllableCuts = (letters) => {
  const count = letters.length;
  if (count < 4) return [];
  const groups = [];
  let index = 0;
  while (index < count) {
    if (isVowelAt(letters, index)) {
      let end = index;
      while (end < count && isVowelAt(letters, end)) end += 1;
      groups.push([index, end]);
      index = end;
    } else {
      index += 1;
    }
  }
  if (groups.length < 2) return [];
  const lastGroup = groups[groups.length - 1];
  const last = letters[count - 1];
  if (lastGroup[1] === count && lastGroup[1] - lastGroup[0] === 1 && last === 'e') {
    const keepLe = letters[lastGroup[0] - 1] === 'l' && lastGroup[0] >= 2 && !isVowelAt(letters, lastGroup[0] - 2);
    if (!keepLe) groups.pop();
  } else if (lastGroup[1] === count - 1 && lastGroup[1] - lastGroup[0] === 1 && letters[lastGroup[0]] === 'e' && (last === 's' || last === 'd')) {
    const before = letters[lastGroup[0] - 1];
    const drop = last === 'd' ? before !== 't' && before !== 'd' : !'sxzcgh'.includes(before);
    if (drop) groups.pop();
  }
  if (groups.length < 2) return [];
  const cuts = [];
  for (let group = 1; group < groups.length; group += 1) {
    const end = groups[group - 1][1];
    const start = groups[group][0];
    const gap = start - end;
    if (gap <= 1) cuts.push(start - gap);
    else cuts.push(CLUSTERS.has(letters[start - 2] + letters[start - 1]) ? start - 2 : start - 1);
  }
  return cuts;
};

export const splitWord = (word, autoSplit) => {
  if (word.includes('-') || !autoSplit) return word.split(/-+/).filter(Boolean);
  const chars = Array.from(word);
  const letters = chars.filter((char) => LETTER.test(char)).map(baseChar);
  const cuts = syllableCuts(letters);
  if (!cuts.length) return [word];
  const parts = [''];
  let letterIndex = 0;
  let cutIndex = 0;
  chars.forEach((char) => {
    if (LETTER.test(char)) {
      if (cutIndex < cuts.length && letterIndex === cuts[cutIndex]) {
        parts.push('');
        cutIndex += 1;
      }
      letterIndex += 1;
    }
    parts[parts.length - 1] += char;
  });
  return parts.filter(Boolean);
};

export const syllableLines = (text, autoSplit = true) => {
  const lines = [];
  text.split(/\r?\n/).forEach((line) => {
    const syllables = [];
    line.trim().split(/\s+/).filter(Boolean).forEach((word) => {
      splitWord(word, autoSplit).forEach((part) => {
        const letters = Array.from(part).filter((char) => LETTER.test(char)).map(baseChar);
        if (!letters.length) return;
        syllables.push({ raw: part, letters, nuc: nucleusIndex(letters) });
      });
    });
    if (syllables.length) lines.push(syllables);
  });
  return lines;
};

export const isLetter = (char) => LETTER.test(char);
