"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { computeScore, formatTime, toFa } from "@/lib/scoring";
import { endings } from "@/lib/puzzles";
import SceneBackground from "@/components/SceneBackground";
import HatefOrb from "@/components/HatefOrb";

export default function Win() {
  const router = useRouter();
  const solvedLayers = useGame((s) => s.solvedLayers);
  const finalRemaining = useGame((s) => s.finalRemaining);
  const hintsUsed = useGame((s) => s.hintsUsed);
  const reset = useGame((s) => s.reset);

  const score = computeScore(solvedLayers, finalRemaining, hintsUsed);

  const playAgain = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <SceneBackground name="win" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-lg flex-col items-center text-center"
      >
        <HatefOrb size={120} />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-4xl font-black text-cyanGlow text-glow sm:text-5xl"
        >
          تو ذهن هاتف را گشودی!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 max-w-md text-base leading-8 text-cyanGlow/85"
        >
          «{endings.win}»
        </motion.p>

        {/* امتیاز و زمان */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="panel mt-8 grid w-full grid-cols-3 gap-3 p-5"
        >
          <Stat label="امتیاز نهایی" value={toFa(score.total)} highlight />
          <Stat
            label="زمان باقی‌مانده"
            value={formatTime(finalRemaining)}
          />
          <Stat label="راهنماها" value={toFa(hintsUsed)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 w-full text-xs text-white/40"
        >
          پایه: {toFa(score.base)} + پاداش زمان: {toFa(score.timeBonus)} − جریمه‌ی
          راهنما: {toFa(score.hintPenalty)}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          onClick={playAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="btn-glow mt-8 rounded-xl px-10 py-3 text-lg font-bold"
        >
          بازی دوباره
        </motion.button>
      </motion.div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-mono text-2xl tabular-nums ${
          highlight ? "text-amberGlow text-glow-amber" : "text-cyanGlow"
        }`}
      >
        {value}
      </span>
      <span className="mt-1 text-xs text-white/50">{label}</span>
    </div>
  );
}
