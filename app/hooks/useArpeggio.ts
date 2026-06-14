"use client";

import { useEffect, useRef, useState } from "react";
import { NoteName } from "@/lib/chordEngine";
import { audioEngine } from "@/lib/audioEngine";

const NOTE_INTERVAL = 0.7;
const LOOKAHEAD = 0.15;
const SCHEDULER_TICK_MS = 30;

export function useArpeggio(notes: NoteName[]) {
  const [playing, setPlaying] = useState(false);
  const notesRef = useRef<NoteName[]>([]);
  const buffersRef = useRef<(AudioBuffer | null)[]>([]);
  const indexRef = useRef(0);
  const nextTimeRef = useRef(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  notesRef.current = notes;

  function schedule() {
    const bufs = buffersRef.current;
    const len = notesRef.current.length;
    if (!len || !bufs.length) return;

    const now = audioEngine.currentTime;
    while (nextTimeRef.current < now + LOOKAHEAD) {
      const buf = bufs[indexRef.current % len];
      if (buf) audioEngine.schedulePlay(buf, nextTimeRef.current);
      nextTimeRef.current += NOTE_INTERVAL;
      indexRef.current = (indexRef.current + 1) % len;
    }
  }

  function startScheduler() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    indexRef.current = 0;
    audioEngine.ensureStarted().then(() => {
      nextTimeRef.current = audioEngine.currentTime + 0.05;
      schedule();
      tickerRef.current = setInterval(schedule, SCHEDULER_TICK_MS);
      setPlaying(true);
    });
  }

  function stop() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    setPlaying(false);
  }

  // 音が変わったらバッファをロードしてループ再スタート
  // cancelled フラグで古い非同期処理の結果を無視し、レースコンディションを防ぐ
  useEffect(() => {
    if (notes.length === 0) {
      stop();
      return;
    }
    let cancelled = false;

    Promise.all(
      notes.map(n => audioEngine.load(`/audio/${n}4.mp3`).catch(() => null))
    ).then(bufs => {
      if (cancelled) return;
      buffersRef.current = bufs;
      startScheduler();
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.join(",")]);

  useEffect(() => () => stop(), []);

  // 手動でstart/stopするときはバッファが既にキャッシュ済みなので即座に開始できる
  function start() {
    if (buffersRef.current.length === 0) return;
    startScheduler();
  }

  return { playing, stop, start };
}
