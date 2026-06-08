"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { layer1Tokens, layer1LockCode } from "@/lib/puzzles";
import { toFa } from "@/lib/scoring";
import { playSfx } from "@/lib/audio";

// تبدیل اعداد انگلیسی کد ورودی به مقایسه
function faToEn(s: string): string {
  const map: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return s.replace(/[۰-۹]/g, (d) => map[d] ?? d);
}

export default function Layer1Tokenize({ onSolved }: { onSolved: () => void }) {
  // رشته‌ی به‌هم‌چسبیده و مرزهای درست
  const { chars, correctCuts, tokenAtChar } = useMemo(() => {
    const chars: string[] = [];
    const correctCuts = new Set<number>();
    const tokenAtChar: number[] = []; // اندیس توکن برای هر کاراکتر
    let pos = 0;
    layer1Tokens.forEach((t, ti) => {
      const cp = Array.from(t.text);
      cp.forEach((c) => {
        chars.push(c);
        tokenAtChar.push(ti);
      });
      pos += cp.length;
      if (ti < layer1Tokens.length - 1) correctCuts.add(pos); // مرز بعد از این توکن
    });
    return { chars, correctCuts, tokenAtChar };
  }, []);

  const [cuts, setCuts] = useState<Set<number>>(new Set());
  const [errorGap, setErrorGap] = useState<number | null>(null);
  const [tokenized, setTokenized] = useState(false);

  // مرحله ۲: کد قفل
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const clickGap = (gap: number) => {
    if (correctCuts.has(gap)) {
      const next = new Set(cuts);
      next.add(gap);
      setCuts(next);
      playSfx("unlock");
      if (next.size === correctCuts.size) {
        setTimeout(() => setTokenized(true), 400);
      }
    } else {
      // مرز اشتباه
      setErrorGap(gap);
      playSfx("error");
      setTimeout(() => setErrorGap(null), 900);
    }
  };

  const submitCode = () => {
    if (faToEn(code) === layer1LockCode) {
      playSfx("unlock");
      onSolved();
    } else {
      setCodeError(true);
      playSfx("error");
      setTimeout(() => setCodeError(false), 800);
    }
  };

  // آیا کاراکتر در توکنی است که مرز اشتباه به آن خورده؟
  const errorTokenIdx =
    errorGap != null ? tokenAtChar[Math.min(errorGap, chars.length - 1)] : null;

  return (
    <div className="panel mx-auto max-w-3xl p-5 sm:p-7">
      {!tokenized ? (
        <>
          <p className="mb-5 text-center text-sm leading-7 text-white/65">
            روی مرزهای درست میان توکن‌ها کلیک کن تا رشته شکسته شود. مرزِ اشتباه،
            توکن را قرمز می‌کند.
          </p>

          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-center gap-y-2 rounded-xl bg-ink-800/60 px-3 py-6 text-2xl leading-loose sm:text-3xl"
          >
            {chars.map((c, i) => {
              const gap = i; // مرز پیش از کاراکتر i (۰ = ابتدای رشته، نادیده)
              const showCut = cuts.has(gap);
              const isErr = errorTokenIdx != null && tokenAtChar[i] === errorTokenIdx;
              return (
                <span key={i} className="flex items-center">
                  {i > 0 && (
                    <button
                      onClick={() => clickGap(gap)}
                      className="group relative mx-[1px] h-9 w-3 cursor-pointer"
                      aria-label="مرز توکن"
                    >
                      {showCut ? (
                        <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded bg-cyanGlow shadow-glow" />
                      ) : (
                        <span className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-white/10 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </button>
                  )}
                  <motion.span
                    animate={
                      isErr
                        ? { color: "#ff4d5e", x: [0, -2, 2, 0] }
                        : { color: "#e7f6ff" }
                    }
                    className="select-none"
                  >
                    {c}
                  </motion.span>
                </span>
              );
            })}
          </div>

          <AnimatePresence>
            {errorGap != null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-sm text-dangerGlow"
              >
                این مرز توکن نیست.
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-4 text-center text-xs text-white/40">
            مرزهای یافته‌شده: {toFa(cuts.size)} از {toFa(correctCuts.size)}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="mb-2 text-center text-sm text-cyanGlow">
            رشته به توکن شکسته شد. هر توکن یک شناسه‌ی عددی دارد:
          </p>
          <p className="mb-4 text-center text-xs text-white/50">
            دقت کن: «کلیدهای» به سه توکن و «پنهان» به دو توکن شکست — یک کلمه می‌تواند
            چند توکن باشد.
          </p>

          <div dir="rtl" className="mb-6 flex flex-wrap justify-center gap-2">
            {layer1Tokens.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col items-center rounded-lg border px-3 py-2 ${
                  t.isKey
                    ? "border-cyanGlow bg-cyanGlow/10 shadow-glow"
                    : "border-white/15 bg-ink-800/60"
                }`}
              >
                <span className="text-lg">{t.text}</span>
                <span
                  className={`mt-1 font-mono text-xs ${
                    t.isKey ? "text-cyanGlow" : "text-white/40"
                  }`}
                >
                  #{toFa(t.id)}
                </span>
              </motion.div>
            ))}
          </div>

          <p className="mb-3 text-center text-sm leading-7 text-white/65">
            شناسه‌ی توکن‌های فیروزه‌ای را از راست به چپ کنار هم بگذار تا کد چهاررقمیِ
            قفل ساخته شود.
          </p>

          <div className="flex flex-col items-center gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 4))}
              onKeyDown={(e) => e.key === "Enter" && submitCode()}
              inputMode="numeric"
              placeholder="کد چهاررقمی"
              dir="ltr"
              className={`w-44 rounded-lg border bg-ink-800/80 px-4 py-2 text-center font-mono text-2xl tracking-[0.4em] outline-none transition ${
                codeError
                  ? "border-dangerGlow text-dangerGlow"
                  : "border-cyanGlow/40 text-cyanGlow focus:border-cyanGlow"
              }`}
            />
            <button onClick={submitCode} className="btn-glow rounded-lg px-8 py-2">
              باز کردن قفل
            </button>
            {codeError && (
              <p className="text-sm text-dangerGlow">کد نادرست است. دوباره تلاش کن.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
