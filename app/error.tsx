"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p style={{ marginBottom: "1rem", color: "#cc2222" }}>エラーが発生しました: {error.message}</p>
      <button onClick={reset} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        再読み込み
      </button>
    </div>
  );
}
