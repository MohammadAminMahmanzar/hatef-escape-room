"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";

// دکمه‌ی شروع دوباره‌ی بازی از ابتدا (با تأیید، تا تصادفی زده نشود).
export default function RestartButton() {
  const router = useRouter();
  const reset = useGame((s) => s.reset);
  const [confirming, setConfirming] = useState(false);

  const restart = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setConfirming((c) => !c)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-base transition hover:border-amberGlow hover:text-amberGlow"
        aria-label="شروع از ابتدا"
        title="شروع از ابتدا"
      >
        ⟲
      </button>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="panel absolute left-0 top-12 z-50 w-60 p-4 text-sm"
          >
            <p className="mb-3 leading-7 text-white/80">
              مطمئنی؟ بازی از ابتدا شروع می‌شود و پیشرفت فعلی پاک می‌گردد.
            </p>
            <div className="flex gap-2">
              <button
                onClick={restart}
                className="flex-1 rounded-lg border border-dangerGlow/50 py-2 text-dangerGlow transition hover:bg-dangerGlow/10"
              >
                شروع از ابتدا
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-lg border border-white/15 py-2 text-white/60"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
