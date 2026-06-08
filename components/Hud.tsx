"use client";

import { useGame } from "@/lib/store";
import Timer from "./Timer";
import ProgressLocks from "./ProgressLocks";
import HintButton from "./HintButton";
import SoundToggle from "./SoundToggle";
import RestartButton from "./RestartButton";

// نوار بالای صفحه: تایمر، پیشرفت، راهنما، صدا.
export default function Hud() {
  const layer = useGame((s) => s.currentLayer);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cyanGlow/10 bg-ink-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-4">
          <Timer />
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <ProgressLocks />
        </div>
        <div className="flex items-center gap-2">
          <HintButton layerId={layer} />
          <SoundToggle />
          <RestartButton />
        </div>
      </div>
    </header>
  );
}
