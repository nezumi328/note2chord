"use client";

import { useEffect, useRef, useState } from "react";
import { NoteName } from "@/lib/chordEngine";

const INTERVAL_MS = 700;

export function useArpeggio(notes: NoteName[]) {
  const [playing, setPlaying] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notesRef = useRef<NoteName[]>([]);

  notesRef.current = notes;

  function playNext() {
    const queue = notesRef.current;
    if (queue.length === 0) return;
    indexRef.current = indexRef.current % queue.length;
    const note = queue[indexRef.current];
    new Audio(`/audio/${note}4.mp3`).play().catch(() => {});
    indexRef.current = (indexRef.current + 1) % queue.length;
  }

  function start() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    indexRef.current = 0;
    playNext();
    intervalRef.current = setInterval(playNext, INTERVAL_MS);
    setPlaying(true);
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
  }

  // 音が変わったら再生中なら再スタート、止まっていたら自動再生開始
  useEffect(() => {
    if (notes.length === 0) {
      stop();
      return;
    }
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.join(",")]);

  // アンマウント時クリーンアップ
  useEffect(() => () => stop(), []);

  return { playing, stop, start };
}
