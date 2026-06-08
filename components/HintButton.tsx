"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { layers, MAX_HINTS_PER_LAYER, type LayerId } from "@/lib/puzzles";
import { toFa } from "@/lib/scoring";

// دکمه‌ی راهنما؛ هر راهنما ۹۰ ثانیه جریمه دارد.
export default function HintButton({ layerId }: { layerId: LayerId }) {
  const used = useGame((s) => s.hintsUsedThisLayer);
  const useHint = useGame((s) => s.useHint);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const layer = layers[layerId];
  const remaining = MAX_HINTS_PER_LAYER - used;
  const revealed = layer.hints.slice(0, used);

  const handleReveal = () => {
    if (remaining <= 0) return;
    useHint();
    setConfirming(false);
    setOpen(true);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-amberGlow/40 px-2.5 text-sm text-amberGlow transition hover:bg-amberGlow/10"
        aria-label="راهنما"
        title="راهنما"
      >
        <span>💡</span>
        <span className="hidden sm:inline">راهنما</span>
        <span className="tabular-nums">({toFa(remaining)})</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="panel absolute left-0 top-12 z-50 w-72 p-4 text-sm sm:w-80"
          >
            <div className="mb-2 font-bold text-amberGlow">راهنماها</div>

            {revealed.length === 0 && (
              <p className="mb-3 text-white/60">
                هنوز راهنمایی نگرفته‌ای. هر راهنما ۹۰ ثانیه از وقتت کم می‌کند.
              </p>
            )}

            <ul className="mb-3 space-y-2">
              {revealed.map((h, i) => (
                <li
                  key={i}
                  className="rounded-md border border-amberGlow/20 bg-amberGlow/5 p-2 leading-6"
                >
                  <span className="ml-1 text-amberGlow">{toFa(i + 1)}.</span> {h}
                </li>
              ))}
            </ul>

            {remaining > 0 ? (
              !confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="btn-glow w-full rounded-lg py-2 text-sm"
                >
                  گرفتن راهنمای بعدی (−۹۰ ثانیه)
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleReveal}
                    className="flex-1 rounded-lg border border-dangerGlow/50 py-2 text-dangerGlow transition hover:bg-dangerGlow/10"
                  >
                    تأیید
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-lg border border-white/15 py-2 text-white/60"
                  >
                    انصراف
                  </button>
                </div>
              )
            ) : (
              <p className="text-center text-white/40">
                راهنمای دیگری باقی نمانده.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
