"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { TOTAL_TIME_SECONDS } from "@/lib/puzzles";
import { formatTime } from "@/lib/scoring";
import { playSfx, updateTension } from "@/lib/audio";

// تایمر سراسری؛ هر ثانیه از store می‌خواند تا با رفرش هماهنگ بماند.
export default function Timer() {
  const remainingFn = useGame((s) => s.remainingSeconds);
  const phase = useGame((s) => s.phase);
  const loseGame = useGame((s) => s.loseGame);
  const soundOn = useGame((s) => s.soundOn);
  const [remaining, setRemaining] = useState(TOTAL_TIME_SECONDS);
  const lastTickRef = useRef<number>(-1);

  useEffect(() => {
    const tick = () => {
      const r = remainingFn();
      setRemaining(r);
      updateTension(r / TOTAL_TIME_SECONDS);

      if (phase === "playing") {
        if (r <= 0) {
          loseGame();
        } else if (r <= 60 && soundOn) {
          // تیک‌تاک زیر ۶۰ ثانیه
          const sec = Math.floor(r);
          if (sec !== lastTickRef.current) {
            lastTickRef.current = sec;
            playSfx("tick");
          }
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [remainingFn, phase, loseGame, soundOn]);

  const danger = remaining <= 120; // زیر ۲ دقیقه
  const critical = remaining <= 60;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg tabular-nums sm:text-2xl ${
        danger
          ? "text-dangerGlow"
          : "text-cyanGlow"
      } ${critical ? "shake" : danger ? "animate-pulseGlow" : ""}`}
      style={{
        textShadow: danger
          ? "0 0 10px rgba(255,77,94,0.7)"
          : "0 0 10px rgba(56,240,230,0.6)",
      }}
      aria-label="زمان باقی‌مانده"
    >
      <span className="text-base">⏱</span>
      <span>{formatTime(remaining)}</span>
    </div>
  );
}
