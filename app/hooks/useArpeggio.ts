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
  const userStoppedRef = useRef(false);

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

  function startScheduler(resetIndex = true) {
    if (tickerRef.current) clearInterval(tickerRef.current);
    if (resetIndex) indexRef.current = 0;
    audioEngine.ensureStarted().then(() => {
      nextTimeRef.current = audioEngine.currentTime + 0.05;
      schedule();
      tickerRef.current = setInterval(schedule, SCHEDULER_TICK_MS);
      setPlaying(true);
    });
  }

  // ユーザーが明示的に停止。次に notes が変わっても自動再開しない。
  function stop() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    userStoppedRef.current = true;
    setPlaying(false);
  }

  // notes が空になったときの自動停止。userStoppedRef は変えない。
  function stopByEmpty() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    setPlaying(false);
  }

  useEffect(() => {
    if (notes.length === 0) {
      stopByEmpty();
      return;
    }
    let cancelled = false;
    const wasPlaying = !!tickerRef.current; // バッファ更新前の再生状態を保持

    Promise.all(
      notes.map(n => audioEngine.load(`/audio/${n}4.mp3`).catch(() => null))
    ).then(bufs => {
      if (cancelled) return;
      buffersRef.current = bufs;
      if (!userStoppedRef.current) {
        // 再生中なら index をリセットせず継続、停止中なら新規スタート
        startScheduler(!wasPlaying);
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.join(",")]);

  useEffect(() => () => stop(), []);

  function start() {
    if (buffersRef.current.length === 0) return;
    userStoppedRef.current = false;
    startScheduler(true);
  }

  return { playing, stop, start };
}
