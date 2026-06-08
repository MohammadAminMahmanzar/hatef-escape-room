"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { layer4Steps, layer4FinalSentence } from "@/lib/puzzles";
import { toFa } from "@/lib/scoring";
import { playSfx } from "@/lib/audio";

export default function Layer4Generation({ onSolved }: { onSolved: () => void }) {
  const [step, setStep] = useState(0);
  const [built, setBuilt] = useState<string[]>(["پایتخت", "ایران"]);
  const [deadEnd, setDeadEnd] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = layer4Steps[step];

  const choose = (word: string, correct: boolean, msg?: string) => {
    if (correct) {
      playSfx("unlock");
      const nextBuilt = [...built, word];
      setBuilt(nextBuilt);
      if (step + 1 >= layer4Steps.length) {
        setTimeout(() => setDone(true), 400);
      } else {
        setStep((s) => s + 1);
      }
    } else {
      playSfx("error");
      setDeadEnd(msg ?? "این مسیر به بن‌بست توهم رسید.");
      setTimeout(() => setDeadEnd(null), 1800);
    }
  };

  return (
    <div className="panel mx-auto max-w-3xl p-5 sm:p-7">
      <p className="mb-5 text-center text-sm leading-7 text-white/65">
        جمله را توکن‌به‌توکن بساز. در هر گام، واژه‌ای را برگزین که جمله را منسجم و
        درست نگه دارد — نه لزوماً پرشانس‌ترین واژه.
      </p>

      {/* جمله‌ی در حال ساخت */}
      <div
        dir="rtl"
        className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-ink-800/60 px-4 py-5 text-xl sm:text-2xl"
      >
        {built.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-cyanGlow text-glow"
          >
            {w}
          </motion.span>
        ))}
        {!done && <span className="animate-flicker text-amberGlow">▌</span>}
      </div>

      {!done ? (
        <>
          <p className="mb-3 text-center text-xs text-white/40">
            گام {toFa(step + 1)} از {toFa(layer4Steps.length)} — واژه‌ی بعدی را
            انتخاب کن:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {current.options.map((opt) => (
              <motion.button
                key={opt.word}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => choose(opt.word, opt.correct, opt.deadEnd)}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/15 bg-ink-800/70 px-4 py-4 transition hover:border-cyanGlow"
              >
                <span className="text-lg text-white/90">{opt.word}</span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-cyanGlow to-amberGlow"
                    style={{ width: `${opt.prob}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-white/50">
                  {toFa(opt.prob)}٪
                </span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {deadEnd && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 rounded-lg border border-dangerGlow/40 bg-dangerGlow/10 px-4 py-3 text-center text-sm text-dangerGlow"
              >
                ⚠ {deadEnd}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <p className="mb-2 text-center text-lg text-cyanGlow text-glow">
            {layer4FinalSentence}
          </p>
          <p className="mb-4 text-center text-sm text-white/55">
            جمله‌ای منسجم و درست ساختی — بی‌آنکه به دام توهم بیفتی.
          </p>
          <button onClick={onSolved} className="btn-glow rounded-lg px-8 py-2">
            تثبیت مسیر
          </button>
        </motion.div>
      )}
    </div>
  );
}
