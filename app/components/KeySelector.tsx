"use client";

import { NoteName } from "@/lib/chordEngine";
import { Mode, NOTE_NAMES_DISPLAY } from "@/lib/keyFunction";

interface KeySelectorProps {
  keyRoot: NoteName | null;
  mode: Mode;
  onKeyChange: (root: NoteName | null) => void;
  onModeChange: (mode: Mode) => void;
}

const selectStyle = {
  background: "var(--surface2, #eeeef4)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.35rem 0.6rem",
  fontSize: "0.8rem",
  outline: "none",
  cursor: "pointer",
};

export default function KeySelector({ keyRoot, mode, onKeyChange, onModeChange }: KeySelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        Key filter
      </span>
      <select
        style={selectStyle}
        value={keyRoot ?? ""}
        onChange={e => onKeyChange(e.target.value ? e.target.value as NoteName : null)}
      >
        <option value="">— off —</option>
        {NOTE_NAMES_DISPLAY.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <select
        style={selectStyle}
        value={mode}
        onChange={e => onModeChange(e.target.value as Mode)}
        disabled={!keyRoot}
      >
        <option value="major">Major</option>
        <option value="minor">Minor (Natural)</option>
      </select>
      {keyRoot && (
        <span className="text-xs" style={{ color: "var(--accent)" }}>
          {keyRoot} {mode === "major" ? "Major" : "Natural Minor"}
        </span>
      )}
    </div>
  );
}
