export type NoteName = "C"|"Db"|"D"|"Eb"|"E"|"F"|"Gb"|"G"|"Ab"|"A"|"Bb"|"B";
export type NoteRole = "c"|"i"|"t"|"k"|"o";

export interface ChordType {
  suffix: string;
  roles: NoteRole[]; // index 0-11 = semitones from root
}

export interface ChordResult {
  root: NoteName;
  suffix: string;
  displayName: string;
  color: string;
  audioFile: string;
  tensions: string[];
}

const NOTE_NAMES: NoteName[] = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
const NOTE_NO: Record<NoteName, number> = {C:0,Db:1,D:2,Eb:3,E:4,F:5,Gb:6,G:7,Ab:8,A:9,Bb:10,B:11};

// data.csv をTypeScriptに直接移植
const CHORD_TYPES: ChordType[] = [
  { suffix: "M",      roles: ["c","o","i","o","c","k","i","c","o","i","i","i"] },
  { suffix: "M7",     roles: ["c","o","i","o","c","k","i","c","o","i","o","c"] },
  { suffix: "7",      roles: ["c","t","i","t","c","k","t","c","t","i","c","o"] },
  { suffix: "6",      roles: ["c","o","i","o","c","k","i","c","o","c","o","i"] },
  { suffix: "m",      roles: ["c","o","i","c","o","i","o","c","k","i","i","i"] },
  { suffix: "mM7",    roles: ["c","o","i","c","o","i","o","c","o","i","o","c"] },
  { suffix: "m7",     roles: ["c","o","i","c","o","i","o","c","k","i","c","o"] },
  { suffix: "m6",     roles: ["c","o","i","c","o","i","o","c","o","c","o","i"] },
  { suffix: "m7-5",   roles: ["c","k","i","c","o","i","c","o","k","o","c","o"] },
  { suffix: "dim",    roles: ["c","o","i","c","o","i","c","o","i","c","o","i"] },
  { suffix: "aug",    roles: ["c","t","i","t","c","o","t","o","c","o","i","i"] },
  { suffix: "aug7",   roles: ["c","t","i","t","c","o","t","o","c","o","c","o"] },
  { suffix: "augM7",  roles: ["c","t","i","t","c","o","t","o","c","i","o","c"] },
  { suffix: "7-5",    roles: ["c","t","i","t","c","o","c","o","t","i","c","o"] },
  { suffix: "7sus4",  roles: ["c","t","i","t","o","c","o","c","t","i","c","o"] },
];

function getTensionMap(suffix: string): Record<number, string> {
  const base: Record<number, string> = {
    0: "Root", 1: "b9", 2: "9", 4: "3", 7: "P5", 10: "7", 11: "M7",
  };
  if (["7","7-5"].includes(suffix)) {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"b13", 9:"13" };
  } else if (suffix === "augM7") {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"#5", 9:"13", 10:"b7", 11:"M7" };
  } else if (["M","M7"].includes(suffix)) {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"b13", 9:"13" };
  } else if (suffix === "aug") {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"#5", 9:"13", 10:"b7", 11:"M7" };
  } else if (suffix === "aug7") {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"#5", 9:"13" };
  } else if (suffix === "6") {
    return { ...base, 3:"#9", 5:"11", 6:"#11", 8:"b13", 9:"M6" };
  } else if (suffix === "m6") {
    return { ...base, 3:"m3", 5:"11", 6:"#11", 8:"b13", 9:"M6" };
  } else if (["m","mM7","m7"].includes(suffix)) {
    return { ...base, 3:"m3", 5:"11", 6:"#11", 8:"b13", 9:"13" };
  } else if (suffix === "m7-5") {
    return { ...base, 3:"m3", 5:"11", 6:"b5", 8:"b13", 9:"13" };
  } else if (suffix === "dim") {
    return { ...base, 3:"m3", 5:"11", 6:"b5", 8:"b13", 9:"bb7" };
  } else if (suffix === "7sus4") {
    return { ...base, 3:"#9", 5:"P4", 6:"#11", 8:"b13", 9:"13" };
  }
  return base;
}

function toAudioFilename(root: NoteName, suffix: string): string {
  const suffixMap: Record<string, string> = {
    "M": "", "M7": "M7", "7": "7", "6": "6",
    "m": "min", "mM7": "minM7", "m7": "min7", "m6": "min6", "m7-5": "min7-5",
    "dim": "dim", "aug": "aug", "aug7": "aug7", "augM7": "augM7", "7-5": "7-5", "7sus4": "7sus4",
  };
  return `audio/${root}${suffixMap[suffix] ?? suffix}.mp3`;
}

function calcColor(
  cMatch: number, iMatch: number, tMatch: number, kMatch: number, oMatch: number,
  noteCount: number,
  suffix: string,
  ctensions: string[]
): string {
  const match = `${cMatch}${iMatch}${tMatch}${kMatch}${oMatch}`;

  // avoid & care
  if (oMatch >= 1) return "ffffff";
  if (kMatch >= 2) return "ffffff";

  // forbidden tension combos
  if (["7","7-5","augM7"].includes(suffix)) {
    if (ctensions.includes("#11") && ctensions.includes("b13")) return "ffffff";
    if (
      (ctensions.includes("b9") && ctensions.includes("9")) ||
      (ctensions.includes("9") && ctensions.includes("#9")) ||
      (ctensions.includes("b13") && ctensions.includes("13"))
    ) return "ffffff";
    if (ctensions.includes("#9") && ctensions.includes("11")) return "ffffff";
  }
  if (["M","6"].includes(suffix)) {
    if (ctensions.includes("11") && ctensions.includes("#11")) return "ffffff";
  }
  if (["M","m"].includes(suffix)) {
    if (ctensions.includes("7") && ctensions.includes("M7")) return "ffffff";
  }
  if (suffix === "aug") {
    if (ctensions.includes("b7") && ctensions.includes("M7")) return "ffffff";
  }

  if (noteCount === 1) {
    if (cMatch === 1) return "ff0000";
    if (iMatch === 1) return "000000";
    if (tMatch === 1) return "0000ff";
    if (kMatch === 1) return "00ff00";
    return "ffffff";
  }

  if (noteCount === 2) {
    if (cMatch === 2) return "ff0000";
    if (iMatch === 2) return "000000";
    if (tMatch === 2) return "0000ff";
    if (match === "11000") return "c00000";
    if (match === "10100") return "c060ff";
    if (match === "10010") return "a0ffa0";
    if (match === "01100") return "c0c0ff";
    if (match === "01010") return "d0ffd0";
    return "ffffff";
  }

  // 3+ notes
  const total = cMatch + iMatch + tMatch + kMatch;
  if (total === 0) return "000000";

  let r = "00", g = "00", b = "00";
  const cPer = cMatch / total;
  const tPer = tMatch / total;

  if (kMatch === 1) {
    const rr = Math.round(255 * (1 - cPer));
    const hex = rr.toString(16).padStart(2, "0");
    return `${hex}ff${hex}`;
  }

  if (cMatch) {
    r = Math.round(255 * cPer).toString(16).padStart(2, "0");
  }
  if (tMatch) {
    b = Math.round(255 * tPer).toString(16).padStart(2, "0");
  }

  if (!cMatch && iMatch && tMatch) {
    return `${b}c0ff`;
  }

  return `${r}${g}${b}`;
}

export function suggestChords(selectedNotes: NoteName[]): ChordResult[] {
  if (selectedNotes.length === 0) return [];

  const results: ChordResult[] = [];
  const noteNos = selectedNotes.map(n => NOTE_NO[n]);

  for (let rootIdx = 0; rootIdx < 12; rootIdx++) {
    const root = NOTE_NAMES[rootIdx];

    for (const ct of CHORD_TYPES) {
      let cMatch = 0, iMatch = 0, tMatch = 0, kMatch = 0, oMatch = 0;

      for (const note of selectedNotes) {
        const noteIdx = NOTE_NO[note];
        const semitones = (noteIdx - rootIdx + 12) % 12;
        const role = ct.roles[semitones];
        if (role === "c") cMatch++;
        else if (role === "i") iMatch++;
        else if (role === "t") tMatch++;
        else if (role === "k") kMatch++;
        else if (role === "o") oMatch++;
      }

      // tension names
      const tensionMap = getTensionMap(ct.suffix);
      const ctensions: string[] = selectedNotes.map(note => {
        const semitones = (NOTE_NO[note] - rootIdx + 12) % 12;
        return tensionMap[semitones] ?? "";
      }).filter(Boolean);

      const color = calcColor(cMatch, iMatch, tMatch, kMatch, oMatch, selectedNotes.length, ct.suffix, ctensions);

      const displaySuffix = ct.suffix === "M" ? "" : ct.suffix === "m7-5" ? "ø" : ct.suffix;
      const displayName = root + displaySuffix;

      results.push({
        root,
        suffix: ct.suffix,
        displayName,
        color,
        audioFile: toAudioFilename(root, ct.suffix),
        tensions: ctensions,
      });
    }
  }

  return results;
}
