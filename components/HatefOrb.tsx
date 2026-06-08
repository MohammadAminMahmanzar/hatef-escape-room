"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  speaking?: boolean;
  size?: number;
}

// کره‌ی نورانی هاتف با موج صوتی واکنشی.
// اگر public/images/hatef-orb.png موجود باشد روی گرادیان قرار می‌گیرد، وگرنه گرادیان تنها.
export default function HatefOrb({ speaking = false, size = 160 }: Props) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* هاله‌ی بیرونی */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle at 50% 45%, rgba(56,240,230,0.45), rgba(56,240,230,0.08) 45%, transparent 70%)",
          filter: "blur(6px)",
        }}
        animate={{
          scale: speaking ? [1, 1.12, 1.04, 1.14, 1] : [1, 1.05, 1],
          opacity: speaking ? [0.8, 1, 0.85, 1, 0.8] : [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: speaking ? 0.7 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* هسته */}
      <motion.div
        className="relative overflow-hidden rounded-full"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background:
            "radial-gradient(circle at 40% 35%, #aefff8, #38f0e6 35%, #1b7d96 70%, #ffb347 130%)",
          boxShadow:
            "0 0 40px rgba(56,240,230,0.6), inset 0 0 30px rgba(255,179,71,0.35)",
        }}
        animate={{
          scale: speaking ? [1, 1.06, 0.98, 1.05, 1] : [1, 1.02, 1],
          filter: speaking
            ? ["hue-rotate(0deg)", "hue-rotate(12deg)", "hue-rotate(0deg)"]
            : "hue-rotate(0deg)",
        }}
        transition={{
          duration: speaking ? 0.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/hatef-orb.png"
            alt="هاتف"
            className="h-full w-full object-cover mix-blend-screen"
            onError={() => setHasImage(false)}
          />
        )}

        {/* رشته‌های عصبی درون کره */}
        {!hasImage && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full opacity-60"
          >
            <g stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" fill="none">
              <path d="M20,50 Q50,20 80,50 T20,50" />
              <path d="M30,30 Q50,60 70,70" />
              <path d="M25,70 Q55,40 75,35" />
            </g>
          </svg>
        )}
      </motion.div>

      {/* موج صوتی هنگام صحبت */}
      {speaking && (
        <div className="absolute -bottom-1 flex items-end gap-[3px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={i}
              className="block w-[3px] rounded-full bg-cyanGlow"
              animate={{ height: [4, 14, 6, 18, 4] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
