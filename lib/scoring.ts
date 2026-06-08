import { HINT_PENALTY_SECONDS, layers, type LayerId } from "./puzzles";

export interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  hintPenalty: number;
  total: number;
}

// امتیاز پایه‌ی همه‌ی لایه‌ها + پاداش زمان باقی‌مانده − جریمه‌ی راهنماها
export function computeScore(
  solvedLayers: LayerId[],
  remainingSeconds: number,
  hintsUsed: number
): ScoreBreakdown {
  const base = solvedLayers.reduce((sum, id) => sum + layers[id].baseScore, 0);
  // هر ثانیه‌ی باقی‌مانده ۲ امتیاز
  const timeBonus = Math.max(0, Math.round(remainingSeconds * 2));
  // جریمه: هر راهنما معادل امتیازِ زمان از دست رفته
  const hintPenalty = hintsUsed * HINT_PENALTY_SECONDS * 2;
  const total = Math.max(0, base + timeBonus - hintPenalty);
  return { base, timeBonus, hintPenalty, total };
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${toFa(m).padStart(2, "۰")}:${toFa(sec).padStart(2, "۰")}`;
}

// تبدیل ارقام به فارسی
export function toFa(n: number | string): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/[0-9]/g, (d) => map[Number(d)]);
}
