"use client";

import { memo, useState, useCallback } from "react";
import { ChordResult, NoteName } from "@/lib/chordEngine";
import { audioEngine } from "@/lib/audioEngine";
import { getDiatonicLabel, Mode } from "@/lib/keyFunction";

function playChord(audioFile: string) {
  audioEngine.play(`/${audioFile}`).catch(() => {});
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (r > 200 && g > 200 && b > 200) return "#111";
  if (r < 20 && g < 20 && b < 20) return "#aaa";
  return "#fff";
}

function badgeColorForBg(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // 赤系セル（赤が支配的）→ イエロー
  if (r > 150 && g < 100 && b < 100) return "#ffdd00";
  return "#f97316";
}

interface ChordGridProps {
  chords: ChordResult[];
  keyRoot: NoteName | null;
  keyMode: Mode;
}

const SUFFIX_ORDER = ["M","M7","7","6","m","mM7","m7","m6","m7-5","dim","aug","augM7","aug7","7-5","7sus4"];
const ROOT_ORDER = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

export default memo(function ChordGrid({ chords, keyRoot, keyMode }: ChordGridProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const handleMouseEnter = useCallback((e: { currentTarget: Element }, tensions: string[]) => {
    if (tensions.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 4, text: tensions.join(", ") });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

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
        <thead></thead>
        <tbody>
          {SUFFIX_ORDER.map(suffix => (
            <tr key={suffix}>
              <td className="px-2 py-0.5 text-[var(--text-muted)] text-[10px]">
                {suffix === "M" ? "maj" : suffix === "m7-5" ? "ø" : suffix}
              </td>
              {ROOT_ORDER.map(root => {
                const chord = byRoot[`${root}-${suffix}`];
                if (!chord) return <td key={root} />;
                const isWhite = chord.color === "ffffff";
                const textColor = textColorForBg(chord.color);
                const diatonicLabel = keyRoot
                  ? getDiatonicLabel(chord.root, chord.suffix, keyRoot, keyMode)
                  : null;
                const badgeColor = diatonicLabel ? badgeColorForBg(chord.color) : null;
                return (
                  <td key={root} className="p-0.5">
                    <div
                      className={`
                        relative cursor-pointer rounded text-center px-0.5 py-1 transition-opacity
                        ${isWhite ? "opacity-10 hover:opacity-30" : "hover:opacity-80"}
                      `}
                      style={{
                        backgroundColor: `#${chord.color}`,
                        outline: badgeColor ? `2px solid ${badgeColor}` : "none",
                        outlineOffset: "-1px",
                      }}
                      onClick={() => playChord(chord.audioFile)}
                      onMouseEnter={(e) => handleMouseEnter(e, chord.tensions)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* 案B: 右上に小さなローマ数字ラベル */}
                      {diatonicLabel && (
                        <span
                          className="absolute top-0.5 right-0.5 text-[9px] font-bold leading-none"
                          style={{ color: badgeColor ?? "#f97316" }}
                        >
                          {diatonicLabel}
                        </span>
                      )}
                      <span className="font-bold text-[11px] leading-none" style={{ color: textColor }}>
                        {chord.displayName}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

{/* Legend */}
      <div className="mt-5 text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        <p className="mb-2 font-semibold text-[11px]" style={{ color: "var(--foreground)", opacity: 0.7 }}>色の見かた / How to read the colors</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded flex-shrink-0 mt-0.5" style={{background:"#ff0000"}}/>
            <span>赤 Red — 選択した音がすべてコードトーン。コードの響きに完全にマッチ。<br/>All selected notes are chord tones — a perfect fit.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded flex-shrink-0 mt-0.5" style={{background:"#111",border:"1px solid #444"}}/>
            <span>黒 Black — コードトーンを含まず、ナチュラルテンションのみ。複雑な響きになる。<br/>No chord tones — natural tensions only; a more complex, ambiguous sound.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded flex-shrink-0 mt-0.5" style={{background:"#0000ff"}}/>
            <span>青 Blue — 選択した音がすべてオルタードテンション。緊張感・不安定感のある響き。<br/>All selected notes are altered tensions — a tense, unstable sound.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5" style={{display:"inline-flex", gap:2}}>
              <span className="inline-block w-3 h-3 rounded" style={{background:"#aa0000"}}/>
              <span className="inline-block w-3 h-3 rounded" style={{background:"#8800aa"}}/>
              <span className="inline-block w-3 h-3 rounded" style={{background:"#0044ff"}}/>
            </span>
            <span>赤〜紫〜青のグラデーション Red–Purple–Blue gradient — コードトーンとオルタードテンションが混在するとき、その比率に応じて色が変化。赤に近いほどコードトーンの割合が高く安定、青に近いほどオルタードが多く緊張感が増す。<br/>When chord tones and altered tensions are mixed, the color blends between red and blue according to their ratio — redder means more stable, bluer means more tension.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5" style={{display:"inline-flex", gap:2}}>
              <span className="inline-block w-3 h-3 rounded" style={{background:"#00ff00"}}/>
              <span className="inline-block w-3 h-3 rounded" style={{background:"#88ff88"}}/>
            </span>
            <span>緑 Green — ケアノート（コードの役割や色彩を変えてしまう音）を含む。コードトーンの割合が高いほど濃い緑、低いほど薄い緑。使い方に注意が必要。<br/>Contains a "care note" — a note that alters the chord's character. Deeper green = more chord tones alongside; lighter green = use with extra care.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded flex-shrink-0 mt-0.5 border border-gray-600"/>
            <span>白 White（非表示 hidden) — アヴォイドノートを含む、または禁止テンションの組み合わせ。不協和になるため非推奨。<br/>Contains an avoid note or a forbidden tension combination — these chords clash and are not recommended.</span>
          </div>
        </div>
      </div>
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x,
          top: tooltip.y,
          transform: "translate(-50%, -100%) translateY(-4px)",
          zIndex: 9999,
          background: "#ffd700",
          color: "#111",
          fontSize: "10px",
          borderRadius: "4px",
          padding: "2px 8px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
});
