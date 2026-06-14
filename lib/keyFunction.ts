import { NoteName } from "./chordEngine";

export type Mode = "major" | "minor";

interface DiatonicDegree {
  semitones: number;
  suffixes: string[];
  label: string;
}

const MAJOR_DEGREES: DiatonicDegree[] = [
  { semitones: 0,  suffixes: ["M","M7","6"],     label: "I" },
  { semitones: 2,  suffixes: ["m","m7"],          label: "IIm" },
  { semitones: 4,  suffixes: ["m","m7"],          label: "IIIm" },
  { semitones: 5,  suffixes: ["M","M7","6"],      label: "IV" },
  { semitones: 7,  suffixes: ["M","7","6","7sus4"], label: "V" },
  { semitones: 9,  suffixes: ["m","m7","m6"],     label: "VIm" },
  { semitones: 11, suffixes: ["m7-5"],            label: "VIIø" },
];

// ナチュラルマイナースケール
const MINOR_DEGREES: DiatonicDegree[] = [
  { semitones: 0,  suffixes: ["m","m7"],          label: "Im" },
  { semitones: 2,  suffixes: ["m7-5"],            label: "II°" },
  { semitones: 3,  suffixes: ["M","M7"],          label: "♭III" },
  { semitones: 5,  suffixes: ["m","m7"],          label: "IVm" },
  { semitones: 7,  suffixes: ["m","m7"],          label: "Vm" },
  { semitones: 8,  suffixes: ["M","M7","6"],      label: "♭VI" },
  { semitones: 10, suffixes: ["M","7"],           label: "♭VII" },
];

const NOTE_NO: Record<NoteName, number> = {
  C:0,Db:1,D:2,Eb:3,E:4,F:5,Gb:6,G:7,Ab:8,A:9,Bb:10,B:11,
};

export function getDiatonicLabel(
  chordRoot: NoteName,
  suffix: string,
  keyRoot: NoteName,
  mode: Mode,
): string | null {
  const interval = (NOTE_NO[chordRoot] - NOTE_NO[keyRoot] + 12) % 12;
  const degrees = mode === "major" ? MAJOR_DEGREES : MINOR_DEGREES;
  const degree = degrees.find(
    d => d.semitones === interval && d.suffixes.includes(suffix)
  );
  return degree?.label ?? null;
}

export const NOTE_NAMES_DISPLAY: NoteName[] = [
  "C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B",
];
