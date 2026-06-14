"use client";

import { useState, useMemo } from "react";
import Piano from "./components/Piano";
import ChordGrid from "./components/ChordGrid";
import { suggestChords, NoteName } from "@/lib/chordEngine";

export default function Home() {
  const [selected, setSelected] = useState<Set<NoteName>>(new Set());

  const toggle = (note: NoteName) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(note)) next.delete(note);
      else next.add(note);
      return next;
    });
  };

  const chords = useMemo(
    () => suggestChords([...selected] as NoteName[]),
    [selected]
  );

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Note<span style={{ color: "var(--accent)" }}>2</span>Chord
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          鍵盤で音を選ぶと、マッチするコードをリアルタイムで表示します
        </p>
      </header>

      <section className="mb-6 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
        <Piano selected={selected} onToggle={toggle} />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {selected.size === 0
              ? "音を選択してください"
              : `選択中: ${[...selected].join(", ")}`}
          </p>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs underline transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              クリア
            </button>
          )}
        </div>
      </section>

      <section className="p-4 rounded-xl" style={{ background: "var(--surface)" }}>
        <ChordGrid chords={chords} />
      </section>

      <footer className="mt-8 text-center" style={{ fontSize: 10, color: "var(--text-muted)" }}>
        コードネームをクリックすると音が出ます &nbsp;·&nbsp; 音量にご注意ください
      </footer>
    </main>
  );
}
