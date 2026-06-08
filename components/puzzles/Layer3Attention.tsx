"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { layer3Sentence, layer3Answer } from "@/lib/puzzles";
import { playSfx } from "@/lib/audio";

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function Layer3Attention({ onSolved }: { onSolved: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  const pronounIds = Object.keys(layer3Answer);
  const allConnected = pronounIds.every((p) => connections[p]);

  const setWordRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) wordRefs.current.set(id, el);
    else wordRefs.current.delete(id);
  }, []);

  // محاسبه‌ی مختصات خطوط بر اساس موقعیت واقعی واژه‌ها
  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const crect = container.getBoundingClientRect();
    const next: Line[] = [];
    for (const [pid, eid] of Object.entries(connections)) {
      const pe = wordRefs.current.get(pid);
      const ee = wordRefs.current.get(eid);
      if (!pe || !ee) continue;
      const pr = pe.getBoundingClientRect();
      const er = ee.getBoundingClientRect();
      next.push({
        x1: pr.left + pr.width / 2 - crect.left,
        y1: pr.top - crect.top,
        x2: er.left + er.width / 2 - crect.left,
        y2: er.top - crect.top,
      });
    }
    setLines(next);
  }, [connections]);

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  const clickWord = (id: string, role: string) => {
    if (role === "pronoun") {
      if (connections[id]) return; // قبلاً وصل شده
      setSelected((s) => (s === id ? null : id));
      return;
    }
    if (role === "entity" && selected) {
      if (layer3Answer[selected] === id) {
        playSfx("unlock");
        setConnections((c) => ({ ...c, [selected]: id }));
        setSelected(null);
      } else {
        playSfx("error");
        setError(true);
        setSelected(null);
        setTimeout(() => setError(false), 1100);
      }
    }
  };

  return (
    <div className="panel mx-auto max-w-3xl p-5 sm:p-7">
      <p className="mb-6 text-center text-sm leading-7 text-white/65">
        ابتدا روی یک ضمیر (مثل «او» یا «میزش») کلیک کن، سپس روی واژه‌ای که به آن
        اشاره دارد. نخِ توجه را درست بکش.
      </p>

      <div ref={containerRef} className="relative py-10">
        {/* خطوط توجه */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {lines.map((l, i) => (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#38f0e6"
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(56,240,230,0.7))" }}
            />
          ))}
        </svg>

        {/* جمله */}
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-xl sm:text-2xl"
        >
          {layer3Sentence.map((w) => {
            const isPronoun = w.role === "pronoun";
            const isEntity = w.role === "entity";
            const connected = !!connections[w.id];
            const isSelected = selected === w.id;
            const clickable = isPronoun || (isEntity && selected);
            return (
              <span
                key={w.id}
                ref={(el) => setWordRef(w.id, el)}
                onClick={() =>
                  clickable && clickWord(w.id, w.role)
                }
                className={`select-none rounded-lg px-2 py-1 transition ${
                  isPronoun
                    ? connected
                      ? "border border-cyanGlow bg-cyanGlow/15 text-cyanGlow shadow-glow"
                      : isSelected
                        ? "border border-amberGlow bg-amberGlow/15 text-amberGlow"
                        : "cursor-pointer border border-amberGlow/40 text-amberGlow hover:bg-amberGlow/10"
                    : isEntity
                      ? selected
                        ? "cursor-pointer border border-cyanGlow/40 text-cyanGlow hover:bg-cyanGlow/10"
                        : "border border-white/15 text-white/80"
                      : "text-white/60"
                }`}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 min-h-[1.5rem] text-center">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-dangerGlow"
            >
              توجهت پراکنده است. نخ محو شد.
            </motion.p>
          )}
        </AnimatePresence>
        {selected && !error && (
          <p className="text-sm text-amberGlow/80">
            حالا روی مرجعِ «{layer3Sentence.find((w) => w.id === selected)?.text}» کلیک کن.
          </p>
        )}
      </div>

      <AnimatePresence>
        {allConnected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center"
          >
            <p className="mb-3 text-sm text-cyanGlow text-glow">
              نقشه‌ی توجه کامل شد. هر دو ضمیر به «مریم» اشاره دارند.
            </p>
            <button onClick={onSolved} className="btn-glow rounded-lg px-8 py-2">
              ثبت نقشه‌ی توجه
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
