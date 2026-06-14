"use client";

import { ChordResult } from "@/lib/chordEngine";

function playChord(audioFile: string) {
  const audio = new Audio(`/${audioFile}`);
  audio.play().catch(() => {});
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // white bg → dark text
  if (r > 200 && g > 200 && b > 200) return "#111";
  // very dark → muted text
  if (r < 20 && g < 20 && b < 20) return "#666";
  return "#fff";
}

interface ChordGridProps {
  chords: ChordResult[];
}

const SUFFIX_ORDER = ["M","M7","7","6","m","mM7","m7","m6","m7-5","dim","aug","augM7","7-5","7sus4"];
const ROOT_ORDER = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

export default function ChordGrid({ chords }: ChordGridProps) {
  if (chords.length === 0) {
    return (
      <p className="text-center mt-8" style={{ color: "var(--text-muted)" }}>
        鍵盤で音を選択するとコードが表示されます
        <span className="block text-xs mt-1" style={{ opacity: 0.6 }}>Select notes on the keyboard to see matching chords</span>
      </p>
    );
  }

  // group by suffix row
  const byRoot: Record<string, ChordResult> = {};
  for (const c of chords) {
    byRoot[`${c.root}-${c.suffix}`] = c;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left px-2 py-1 text-[var(--text-muted)] font-normal w-16">type</th>
            {ROOT_ORDER.map(r => (
              <th key={r} className="text-center px-1 py-1 text-[var(--text-muted)] font-normal">{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SUFFIX_ORDER.map(suffix => (
            <tr key={suffix}>
              <td className="px-2 py-0.5 text-[var(--text-muted)] text-[10px]">
                {suffix === "M" ? "maj" : suffix}
              </td>
              {ROOT_ORDER.map(root => {
                const chord = byRoot[`${root}-${suffix}`];
                if (!chord) return <td key={root} />;
                const isWhite = chord.color === "ffffff";
                const textColor = textColorForBg(chord.color);
                return (
                  <td key={root} className="p-0.5">
                    <div
                      className={`
                        group relative cursor-pointer rounded text-center py-1 px-0.5 transition-opacity
                        ${isWhite ? "opacity-10 hover:opacity-30" : "hover:opacity-80"}
                      `}
                      style={{ backgroundColor: `#${chord.color}` }}
                      onClick={() => playChord(chord.audioFile)}
                      title={chord.tensions.join(", ")}
                    >
                      <span className="font-bold text-[11px] leading-none" style={{ color: textColor }}>
                        {chord.displayName}
                      </span>
                      {chord.tensions.length > 0 && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1
                          hidden group-hover:block
                          bg-black/90 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                          {chord.tensions.join(", ")}
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded flex-shrink-0" style={{background:"#ff0000"}}/>整った響き / Chord tones</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded flex-shrink-0" style={{background:"#111",border:"1px solid #444"}}/>複雑な響き / Tensions only</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded flex-shrink-0" style={{background:"#0000ff"}}/>緊張感あり / Altered tensions</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded flex-shrink-0" style={{background:"#00ff00"}}/>注意 / Use with care</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded flex-shrink-0 border border-gray-600"/>不協和 / Avoid</span>
      </div>
    </div>
  );
}
