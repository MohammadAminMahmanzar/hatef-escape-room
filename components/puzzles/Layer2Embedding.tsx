"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { layer2Clusters, layer2Password } from "@/lib/puzzles";
import { playSfx } from "@/lib/audio";

// چیدمان ثابت ستاره‌ها در هر خوشه (درصدی) تا بدون hydration mismatch باشد
const STAR_POS = [
  { x: 22, y: 26 },
  { x: 74, y: 22 },
  { x: 24, y: 74 },
  { x: 72, y: 72 },
];
const CENTER = { x: 50, y: 50 };

interface ClusterState {
  solved: boolean;
  wrongId: string | null;
}

export default function Layer2Embedding({ onSolved }: { onSolved: () => void }) {
  // هر خوشه: اعضای درهم‌ریخته (۳ عضو + مزاحم) با موقعیت ثابت
  const clusters = useMemo(
    () =>
      layer2Clusters.map((c) => {
        const words = [...c.members, c.intruder];
        return { ...c, words };
      }),
    []
  );

  const [state, setState] = useState<ClusterState[]>(
    clusters.map(() => ({ solved: false, wrongId: null }))
  );

  const allSolved = state.every((s) => s.solved);

  const handleClick = (ci: number, word: string) => {
    if (state[ci].solved) return;
    const cluster = clusters[ci];
    if (word === cluster.intruder) {
      playSfx("unlock");
      setState((prev) =>
        prev.map((s, i) => (i === ci ? { solved: true, wrongId: null } : s))
      );
    } else {
      playSfx("error");
      setState((prev) =>
        prev.map((s, i) => (i === ci ? { ...s, wrongId: word } : s))
      );
      setTimeout(() => {
        setState((prev) =>
          prev.map((s, i) => (i === ci ? { ...s, wrongId: null } : s))
        );
      }, 800);
    }
  };

  return (
    <div className="panel mx-auto max-w-3xl p-5 sm:p-7">
      <p className="mb-5 text-center text-sm leading-7 text-white/65">
        در هر خوشه، سه واژه هم‌معنا کنار هم‌اند و یک واژه‌ی مزاحم از دسته بیگانه است.
        مزاحم را پیدا و حذف کن تا حرف پنهان آشکار شود.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clusters.map((cluster, ci) => {
          const cs = state[ci];
          return (
            <div
              key={cluster.id}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl border bg-ink-900/70 ${
                cs.solved
                  ? "border-cyanGlow shadow-glow"
                  : "border-white/10"
              }`}
            >
              {/* میدان ستاره */}
              <div className="absolute inset-0 opacity-40 [background:radial-gradient(1px_1px_at_20%_30%,#fff,transparent),radial-gradient(1px_1px_at_80%_60%,#fff,transparent),radial-gradient(1px_1px_at_50%_80%,#fff,transparent),radial-gradient(1px_1px_at_65%_25%,#fff,transparent)]" />

              <div className="absolute right-2 top-2 text-xs text-amberGlow/80">
                {cluster.label}
              </div>

              {/* خطوط اتصال */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                {cluster.words.map((w, i) => {
                  if (w === cluster.intruder && cs.solved) return null;
                  const p = STAR_POS[i];
                  const isMember = w !== cluster.intruder;
                  return (
                    <line
                      key={i}
                      x1={CENTER.x}
                      y1={CENTER.y}
                      x2={p.x}
                      y2={p.y}
                      stroke={
                        cs.solved && isMember
                          ? "rgba(56,240,230,0.6)"
                          : "rgba(255,255,255,0.12)"
                      }
                      strokeWidth="0.5"
                    />
                  );
                })}
              </svg>

              {/* واژه‌ها */}
              {cluster.words.map((w, i) => {
                const p = STAR_POS[i];
                const isIntruder = w === cluster.intruder;
                const removed = isIntruder && cs.solved;
                const wrong = cs.wrongId === w;
                return (
                  <AnimatePresence key={i}>
                    {!removed && (
                      <motion.button
                        initial={false}
                        exit={{ scale: 0, opacity: 0, rotate: 30 }}
                        animate={
                          wrong
                            ? { x: [0, -3, 3, 0], color: "#ff4d5e" }
                            : { x: 0 }
                        }
                        onClick={() => handleClick(ci, w)}
                        disabled={cs.solved}
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        className={`absolute whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition sm:text-sm ${
                          cs.solved
                            ? "border-cyanGlow/40 text-cyanGlow/90"
                            : "border-white/20 bg-ink-800/80 text-white/80 hover:border-amberGlow hover:text-amberGlow"
                        }`}
                      >
                        {w}
                      </motion.button>
                    )}
                  </AnimatePresence>
                );
              })}

              {/* حرف آشکارشده */}
              <AnimatePresence>
                {cs.solved && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyanGlow bg-cyanGlow/15 text-2xl font-black text-cyanGlow shadow-glow"
                  >
                    {cluster.revealLetter}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {allSolved && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center"
          >
            <p className="mb-2 text-sm text-white/65">رمز عبور لایه آشکار شد:</p>
            <div className="mb-4 flex gap-2">
              {Array.from(layer2Password).map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyanGlow bg-cyanGlow/10 text-2xl font-black text-cyanGlow shadow-glow"
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <button onClick={onSolved} className="btn-glow rounded-lg px-8 py-2">
              تأیید رمز
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
