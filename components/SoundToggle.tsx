"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/store";
import { setMuted } from "@/lib/audio";

export default function SoundToggle() {
  const soundOn = useGame((s) => s.soundOn);
  const toggleSound = useGame((s) => s.toggleSound);

  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);

  return (
    <button
      onClick={toggleSound}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-lg transition hover:border-cyanGlow hover:text-cyanGlow"
      aria-label={soundOn ? "قطع صدا" : "وصل صدا"}
      title={soundOn ? "قطع صدا" : "وصل صدا"}
    >
      {soundOn ? "🔊" : "🔇"}
    </button>
  );
}
