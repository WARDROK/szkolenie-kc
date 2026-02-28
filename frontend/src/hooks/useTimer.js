import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for a live-ticking timer.
 * @param {string|Date|null} startTime - ISO string of when the riddle was opened (server time).
 * @param {boolean} running - Whether the timer should keep ticking.
 * @returns {{ elapsed: number, formatted: string }}
 */
export default function useTimer(startTime, running = true) {
  const [elapsed, setElapsed] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!startTime || !running) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const start = new Date(startTime).getTime();

    function tick() {
      setElapsed(Date.now() - start);
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [startTime, running]);

  const formatted = formatTime(elapsed);

  return { elapsed, formatted };
}

function formatTime(ms) {
  if (ms <= 0) return '00:00.0';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${pad(minutes)}:${pad(seconds)}.${tenths}`;
}

function pad(n) {
  return n.toString().padStart(2, '0');
}
