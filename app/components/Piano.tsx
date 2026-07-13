"use client";

import { NoteName } from "@/lib/chordEngine";
import { audioEngine } from "@/lib/audioEngine";

const WHITE_KEYS: NoteName[] = ["C","D","E","F","G","A","B"];
const BLACK_KEYS: { note: NoteName; offset: number }[] = [
  { note: "Db", offset: 1 },
  { note: "Eb", offset: 2 },
  { note: "Gb", offset: 4 },
  { note: "Ab", offset: 5 },
  { note: "Bb", offset: 6 },
];

const OCTAVES: { label: number; audioOctave: number }[] = [
  { label: 3, audioOctave: 3 },
  { label: 4, audioOctave: 4 },
];

interface PianoProps {
  selected: Set<NoteName>;
  onToggle: (note: NoteName) => void;
}

export default function Piano({ selected, onToggle }: PianoProps) {
  const handleKey = (note: NoteName, audioOctave: number) => {
    audioEngine.play(`/audio/${note}${audioOctave}.mp3`).catch(() => {});
    onToggle(note);
  };

  return (
    <div className="flex justify-center select-none overflow-x-auto">
      <div className="flex gap-1">
        {OCTAVES.map(({ label, audioOctave }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="relative flex" style={{ height: 120 }}>
              {/* White keys */}
              {WHITE_KEYS.map((note) => (
                <button
                  key={note}
                  onClick={() => handleKey(note, audioOctave)}
                  className={`
                    relative z-10 w-10 border border-[var(--border)] rounded-b-md transition-all duration-100
                    ${selected.has(note)
                      ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
                      : "bg-white hover:bg-gray-100 active:bg-gray-200"}
                  `}
                  style={{ height: 120 }}
                  aria-label={`${note}${label}`}
                  aria-pressed={selected.has(note)}
                >
                  <span
                    className={`absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-semibold
                      ${selected.has(note) ? "text-white" : "text-gray-500"}`}
                  >
                    {note}
                  </span>
                </button>
              ))}

              {/* Black keys */}
              {BLACK_KEYS.map(({ note, offset }) => (
                <button
                  key={note}
                  onClick={() => handleKey(note, audioOctave)}
                  className={`
                    absolute z-20 top-0 w-6 rounded-b-md transition-all duration-100
                    ${selected.has(note)
                      ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
                      : "bg-gray-900 hover:bg-gray-700 active:bg-gray-600"}
                  `}
                  style={{
                    height: 74,
                    left: `calc(${offset} * 2.5rem - 0.75rem)`,
                  }}
                  aria-label={`${note}${label}`}
                  aria-pressed={selected.has(note)}
                >
                  <span
                    className={`absolute bottom-1 left-0 right-0 text-center text-[8px] font-semibold
                      ${selected.has(note) ? "text-white" : "text-gray-400"}`}
                  >
                    {note}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>oct {label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
