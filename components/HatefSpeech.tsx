"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HatefOrb from "./HatefOrb";

// نمایش روایت هاتف خط‌به‌خط با افکت تایپ و موج صوتی کره.
interface Props {
  lines: string[];
  onDone?: () => void;
  orbSize?: number;
  compact?: boolean;
}

export default function HatefSpeech({ lines, onDone, orbSize = 120, compact }: Props) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(true);

  const current = lines[index] ?? "";

  // افکت تایپ
  useEffect(() => {
    setTyped("");
    setTyping(true);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(current.slice(0, i));
      if (i >= current.length) {
        clearInterval(id);
        setTyping(false);
      }
    }, 28);
    return () => clearInterval(id);
  }, [current]);

  const next = () => {
    if (typing) {
      // پرش به انتهای خط
      setTyped(current);
      setTyping(false);
      return;
    }
    if (index < lines.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onDone?.();
    }
  };

  const isLast = index === lines.length - 1;

  return (
    <div
      className={`flex flex-col items-center gap-5 ${compact ? "" : "py-6"}`}
    >
      <HatefOrb speaking={typing} size={orbSize} />

      <div className="panel max-w-2xl px-5 py-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[3.5rem] text-lg leading-8 text-cyanGlow/95 text-glow sm:text-xl"
          >
            {typed}
            {typing && <span className="animate-flicker">▌</span>}
          </motion.p>
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="flex gap-1">
            {lines.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-cyanGlow" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="btn-glow rounded-lg px-5 py-1.5 text-sm">
            {typing ? "..." : isLast ? "آغاز کن" : "ادامه ←"}
          </button>
        </div>
      </div>
    </div>
  );
}
