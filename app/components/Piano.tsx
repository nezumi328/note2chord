"use client";

import { NoteName } from "@/lib/chordEngine";

const WHITE_KEYS: NoteName[] = ["C","D","E","F","G","A","B"];
const BLACK_KEYS: { note: NoteName; offset: number }[] = [
  { note: "Db", offset: 1 },
  { note: "Eb", offset: 2 },
  { note: "Gb", offset: 4 },
  { note: "Ab", offset: 5 },
  { note: "Bb", offset: 6 },
];

interface PianoProps {
  selected: Set<NoteName>;
  onToggle: (note: NoteName) => void;
}

export default function Piano({ selected, onToggle }: PianoProps) {
  const handleKey = (note: NoteName) => {
    onToggle(note);
  };

  return (
    <div className="flex justify-center select-none">
      <div className="relative flex" style={{ height: 140 }}>
        {/* White keys */}
        {WHITE_KEYS.map((note) => (
          <button
            key={note}
            onClick={() => handleKey(note)}
            className={`
              relative z-10 w-14 border border-[var(--border)] rounded-b-md transition-all duration-100
              ${selected.has(note)
                ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
                : "bg-white hover:bg-gray-100 active:bg-gray-200"}
            `}
            style={{ height: 140 }}
            aria-label={note}
            aria-pressed={selected.has(note)}
          >
            <span
              className={`absolute bottom-2 left-0 right-0 text-center text-xs font-semibold
                ${selected.has(note) ? "text-white" : "text-gray-500"}`}
            >
              {note}
            </span>
          </button>
        ))}

        {/* Black keys — positioned absolutely over white keys */}
        {BLACK_KEYS.map(({ note, offset }) => (
          <button
            key={note}
            onClick={() => handleKey(note)}
            className={`
              absolute z-20 top-0 w-8 rounded-b-md transition-all duration-100
              ${selected.has(note)
                ? "bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
                : "bg-gray-900 hover:bg-gray-700 active:bg-gray-600"}
            `}
            style={{
              height: 88,
              left: `calc(${offset} * 3.5rem - 1rem)`,
            }}
            aria-label={note}
            aria-pressed={selected.has(note)}
          >
            <span
              className={`absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-semibold
                ${selected.has(note) ? "text-white" : "text-gray-400"}`}
            >
              {note}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
