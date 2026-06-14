"use client";

import { useState, useMemo } from "react";
import Piano from "./components/Piano";
import ChordGrid from "./components/ChordGrid";
import { suggestChords, NoteName } from "@/lib/chordEngine";
import { useArpeggio } from "./hooks/useArpeggio";

export default function Home() {
  const [selected, setSelected] = useState<Set<NoteName>>(new Set());
  const notes = useMemo(() => [...selected] as NoteName[], [selected]);
  const { playing, stop, start } = useArpeggio(notes);

  const toggle = (note: NoteName) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(note)) next.delete(note);
      else next.add(note);
      return next;
    });
  };

  const chords = useMemo(
    () => suggestChords(notes),
    [notes]
  );

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Note<span style={{ color: "var(--accent)" }}>2</span>Chord
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          鍵盤で音を選ぶと、マッチするコードをリアルタイムで表示します
          <span className="ml-2" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            — Select notes on the keyboard to instantly find matching chords
          </span>
        </p>
      </header>

      <section className="mb-6 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
        <Piano selected={selected} onToggle={toggle} />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {selected.size === 0
              ? <>音を選択してください <span style={{opacity:0.5}}>/ Select notes</span></>
              : <>Selected: <strong>{notes.join(", ")}</strong></>}
          </p>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <button
                onClick={playing ? stop : start}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: playing ? "#fff0f0" : "#f0fff0",
                  color: playing ? "#cc2222" : "#227722",
                  border: `1px solid ${playing ? "#cc222244" : "#22772244"}`,
                }}
              >
                {playing ? "■ Stop" : "▶ Loop notes"}
              </button>
            )}
            {selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs underline transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <p className="my-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        ⚠️ 鍵盤やコードネームをクリックすると音が出ます。音量にご注意ください。
        <span className="block mt-0.5" style={{ opacity: 0.7 }}>Clicking the keyboard or a chord name plays audio — please watch your volume.</span>
      </p>

      <section className="p-4 rounded-xl" style={{ background: "var(--surface)" }}>
        <ChordGrid chords={chords} />
      </section>
    </main>
  );
}
