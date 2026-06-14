"use client";

import { useEffect, useRef, useState } from "react";
import { NoteName } from "@/lib/chordEngine";
import { audioEngine } from "@/lib/audioEngine";

const NOTE_INTERVAL = 0.7;       // seconds between notes
const LOOKAHEAD = 0.15;          // schedule this many seconds ahead
const SCHEDULER_TICK_MS = 30;    // how often to run the scheduler (ms)

export function useArpeggio(notes: NoteName[]) {
  const [playing, setPlaying] = useState(false);
  const notesRef = useRef<NoteName[]>([]);
  const buffersRef = useRef<(AudioBuffer | null)[]>([]);
  const indexRef = useRef(0);
  const nextTimeRef = useRef(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingRef = useRef(false);

  notesRef.current = notes;

  // Preload buffers whenever selected notes change
  useEffect(() => {
    if (notes.length === 0) return;
    Promise.all(
      notes.map(n => audioEngine.load(`/audio/${n}4.mp3`).catch(() => null))
    ).then(bufs => {
      buffersRef.current = bufs;
    });
  }, [notes.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function schedule() {
    const bufs = buffersRef.current;
    const len = notesRef.current.length;
    if (!len || !bufs.length) return;

    const now = audioEngine.currentTime;
    while (nextTimeRef.current < now + LOOKAHEAD) {
      const idx = indexRef.current % len;
      const buf = bufs[idx];
      if (buf) audioEngine.schedulePlay(buf, nextTimeRef.current);
      nextTimeRef.current += NOTE_INTERVAL;
      indexRef.current = (indexRef.current + 1) % len;
    }
  }

  function start() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    indexRef.current = 0;
    // Initialize nextTime slightly ahead so first note plays immediately
    audioEngine.ensureStarted().then(() => {
      nextTimeRef.current = audioEngine.currentTime + 0.05;
      schedule();
      tickerRef.current = setInterval(schedule, SCHEDULER_TICK_MS);
      playingRef.current = true;
      setPlaying(true);
    });
  }

  function stop() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    playingRef.current = false;
    setPlaying(false);
  }

  // Restart loop when notes change (if already playing)
  useEffect(() => {
    if (notes.length === 0) {
      stop();
      return;
    }
    // Re-preload then restart
    Promise.all(
      notes.map(n => audioEngine.load(`/audio/${n}4.mp3`).catch(() => null))
    ).then(bufs => {
      buffersRef.current = bufs;
      start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.join(",")]);

  useEffect(() => () => stop(), []);

  return { playing, stop, start };
}
