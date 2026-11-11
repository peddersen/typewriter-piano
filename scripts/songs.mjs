const song = (id, title, credit, rows) => ({ id, title, credit, rows });

const rhythm = (notes, beats) => {
  if (notes.length !== beats.length) throw new Error(`rhythm ${notes.length} notes, ${beats.length} beats`);
  return notes.map((note, index) => {
    const beat = beats[index];
    if (beat === 0.5) return `${note}/2`;
    if (beat === 1) return note;
    return `${note}*${beat}`;
  });
};

export const songs = [
  song('scale', 'Practice scale', 'A scale, not a copyrighted work.', [
    ['do re mi fa sol la ti do', rhythm(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], [1, 1, 1, 1, 1, 1, 1, 2])],
  ]),
  song('twinkle', 'Twinkle, Twinkle, Little Star', 'Lyrics by Jane Taylor, 1806. Melody: Ah! vous dirai-je, maman. Public domain.', [
    ['Twin-kle twin-kle lit-tle star', rhythm(['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'], [1, 1, 1, 1, 1, 1, 2])],
    ['How I won-der what you are', rhythm(['F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Up a-bove the world so high', rhythm(['G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Like a dia-mond in the sky', rhythm(['G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Twin-kle twin-kle lit-tle star', rhythm(['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'], [1, 1, 1, 1, 1, 1, 2])],
    ['How I won-der what you are', rhythm(['F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'], [1, 1, 1, 1, 1, 1, 2])],
  ]),
  song('mary', 'Mary Had a Little Lamb', 'Traditional, public domain.', [
    ['Ma-ry had a lit-tle lamb', rhythm(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Lit-tle lamb lit-tle lamb', rhythm(['D4', 'D4', 'D4', 'E4', 'G4', 'G4'], [1, 1, 2, 1, 1, 2])],
    ['Ma-ry had a lit-tle lamb', rhythm(['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Whose fleece was white as snow', rhythm(['E4', 'D4', 'D4', 'E4', 'D4', 'C4'], [1, 1, 1, 1, 1, 2])],
  ]),
  song('row', 'Row, Row, Row Your Boat', 'Traditional, public domain.', [
    ['Row row row your boat', rhythm(['C4', 'C4', 'C4', 'D4', 'E4'], [0.5, 0.5, 1, 1, 1])],
    ['Gent-ly down the stream', rhythm(['E4', 'D4', 'E4', 'F4', 'G4'], [0.5, 0.5, 1, 1, 2])],
    ['Mer-ri-ly mer-ri-ly mer-ri-ly mer-ri-ly', rhythm(['C5', 'C5', 'C5', 'G4', 'G4', 'G4', 'E4', 'E4', 'E4', 'C4', 'C4', 'C4'], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])],
    ['Life is but a dream', rhythm(['G4', 'F4', 'E4', 'D4', 'C4'], [1, 1, 1, 1, 2])],
  ]),
  song('london', 'London Bridge Is Falling Down', 'Traditional, public domain.', [
    ['Lon-don Bridge is fal-ling down', rhythm(['G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Fal-ling down fal-ling down', rhythm(['D4', 'E4', 'F4', 'D4', 'E4', 'F4'], [1, 1, 1, 1, 1, 2])],
    ['Lon-don Bridge is fal-ling down', rhythm(['G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4'], [1, 1, 1, 1, 1, 1, 2])],
    ['My fair la-dy', rhythm(['D4', 'G4', 'E4', 'C4'], [1, 1, 1, 2])],
  ]),
  song('frere', 'Frère Jacques', 'Traditional, public domain.', [
    ['Frè-re Jac-ques Frè-re Jac-ques', ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4']],
    ['Dor-mez-vous Dor-mez-vous', ['E4', 'F4', 'G4', 'E4', 'F4', 'G4']],
    ['Son-nez les ma-ti-nes Son-nez les ma-ti-nes', ['G4', 'A4', 'G4', 'F4', 'E4', 'C4', 'G4', 'A4', 'G4', 'F4', 'E4', 'C4']],
    ['Ding ding dong Ding ding dong', rhythm(['C4', 'G3', 'C4', 'C4', 'G3', 'C4'], [1, 1, 2, 1, 1, 2])],
  ]),
  song('jingle', 'Jingle Bells', 'Words and music by James Lord Pierpont, 1857. Public domain.', [
    ['Jin-gle bells jin-gle bells jin-gle all the way', rhythm(['B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'D5', 'G4', 'A4', 'B4'], [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2])],
    ['Oh what fun it is to ride in a one horse o-pen sleigh', rhythm(['C5', 'C5', 'C5', 'C5', 'C5', 'B4', 'B4', 'B4', 'B4', 'D5', 'D5', 'C5', 'A4', 'G4'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2])],
    ['Jin-gle bells jin-gle bells jin-gle all the way', rhythm(['B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'D5', 'G4', 'A4', 'B4'], [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2])],
    ['Oh what fun it is to ride in a one horse o-pen sleigh', rhythm(['C5', 'C5', 'C5', 'C5', 'C5', 'B4', 'B4', 'B4', 'B4', 'D5', 'D5', 'C5', 'A4', 'G4'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2])],
  ]),
  song('saints', 'When the Saints Go Marching In', 'Traditional spiritual, public domain.', [
    ['Oh when the saints go march-ing in', rhythm(['C4', 'E4', 'F4', 'G4', 'C4', 'E4', 'F4', 'G4'], [1, 1, 1, 1, 1, 1, 1, 2])],
    ['Oh when the saints go march-ing in', rhythm(['C4', 'E4', 'F4', 'G4', 'E4', 'C4', 'E4', 'D4'], [1, 1, 1, 1, 1, 1, 1, 2])],
    ['Oh Lord I want to be in that num-ber', rhythm(['E4', 'E4', 'D4', 'C4', 'C4', 'E4', 'G4', 'G4', 'G4', 'F4'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 2])],
    ['Oh when the saints go march-ing in', rhythm(['F4', 'E4', 'F4', 'G4', 'E4', 'C4', 'D4', 'C4'], [1, 1, 1, 1, 1, 1, 1, 2])],
  ]),
  song('lune', 'Au clair de la lune', 'French traditional, 18th century. Public domain.', [
    ['Au clair de la lu-ne', rhythm(['C4', 'C4', 'C4', 'D4', 'E4', 'D4'], [1, 1, 1, 1, 1, 2])],
    ['Mon a-mi Pier-rot', rhythm(['C4', 'E4', 'D4', 'D4', 'C4'], [1, 1, 1, 1, 2])],
    ['Prê-te-moi ta plu-me', rhythm(['C4', 'C4', 'C4', 'D4', 'E4', 'D4'], [1, 1, 1, 1, 1, 2])],
    ['Pour é-crire un mot', rhythm(['C4', 'E4', 'D4', 'D4', 'C4'], [1, 1, 1, 1, 2])],
  ]),
  song('joy', 'Ode to Joy', 'Melody by Ludwig van Beethoven. Words by Friedrich Schiller, 1785. Public domain.', [
    ['Freu-de schö-ner Göt-ter-fun-ken', rhythm(['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'], [1, 1, 1, 1, 1, 1, 1, 1])],
    ['Toch-ter aus E-ly-si-um', rhythm(['C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'], [1, 1, 1, 1, 1, 1, 2])],
    ['Wir be-tre-ten feu-er-trun-ken', rhythm(['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'], [1, 1, 1, 1, 1, 1, 1, 1])],
    ['Him-mli-sche dein Hei-lig-tum', rhythm(['C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4'], [1, 1, 1, 1, 1, 1, 2])],
  ]),
  song('auld', 'Auld Lang Syne', 'Words by Robert Burns, 1796. Traditional Scottish melody, 1799. Public domain.', [
    ['Should auld ac-quain-tance be for-got', rhythm(['G4', 'C5', 'C5', 'C5', 'E5', 'D5', 'C5', 'D5'], [1, 1, 1, 1, 1, 1, 1, 2])],
    ['And nev-er brought to mind', rhythm(['E5', 'C5', 'C5', 'E5', 'G5', 'A5'], [1, 1, 1, 1, 1, 2])],
    ['Should auld ac-quain-tance be for-got', rhythm(['A5', 'G5', 'E5', 'E5', 'C5', 'D5', 'C5', 'D5'], [1, 1, 1, 1, 1, 1, 1, 2])],
    ['And days of auld lang syne', rhythm(['E5', 'C5', 'A4', 'A4', 'G4', 'C5'], [1, 1, 1, 1, 1, 2])],
  ]),
  song('birthday', 'Happy Birthday', 'Melody by Mildred Hill, words by Patty Hill. Public domain.', [
    ['Hap-py birth-day to you', rhythm(['C4', 'C4', 'D4', 'C4', 'F4', 'E4'], [0.5, 0.5, 1, 1, 1, 2])],
    ['Hap-py birth-day to you', rhythm(['C4', 'C4', 'D4', 'C4', 'G4', 'F4'], [0.5, 0.5, 1, 1, 1, 2])],
    ['Hap-py birth-day dear Ma-ry', rhythm(['C4', 'C4', 'C5', 'A4', 'F4', 'E4', 'D4'], [0.5, 0.5, 1, 1, 1, 1, 2])],
    ['Hap-py birth-day to you', rhythm(['A#4', 'A#4', 'A4', 'F4', 'G4', 'F4'], [0.5, 0.5, 1, 1, 1, 2])],
  ]),
];

export const lyricsOf = (entry) => entry.rows.map((row) => row[0]).join('\n');
export const notesOf = (entry) => entry.rows.flatMap((row) => row[1]);
