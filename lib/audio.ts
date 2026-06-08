"use client";

// سیستم صدای تولیدشونده با Tone.js.
// drone pad محیطی + آرپژ که با کاهش زمان، تنش بیشتر می‌شود.
// اگر public/audio/ambient.mp3 موجود باشد، به‌جای موسیقی تولیدشونده پخش می‌شود.
// صدا فقط بعد از اولین تعامل کاربر آغاز می‌شود (سیاست autoplay).

let started = false;
let muted = false;
let usingFile = false;

// نگه‌داری اشیای Tone برای dispose و کنترل
type AnyTone = any;
let Tone: AnyTone = null;
let droneSynth: AnyTone = null;
let arpSynth: AnyTone = null;
let arpLoop: AnyTone = null;
let reverb: AnyTone = null;
let filePlayer: AnyTone = null;
let sfxSynth: AnyTone = null;
let masterGain: AnyTone = null;

// ملودی پنتاتونیک آرام و دلنشین (Am pentatonic، اکتاو بالا و ملایم)
const ARP_NOTES = ["A4", "C5", "D5", "E5", "G5", "E5", "D5", "C5"];
const PAD_CHORD = ["A2", "E3", "A3", "C4"];

async function fileExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function startAudio(): Promise<void> {
  if (started) return;
  started = true;

  try {
    Tone = await import("tone");
    await Tone.start();

    masterGain = new Tone.Gain(0.0).toDestination();

    // تلاش برای استفاده از فایل دلخواه
    usingFile = await fileExists("/audio/ambient.mp3");
    if (usingFile) {
      filePlayer = new Tone.Player({
        url: "/audio/ambient.mp3",
        loop: true,
        autostart: true,
      }).connect(masterGain);
    } else {
      // فضای محیطیِ نرم و سینمایی — پدِ سینوسی + ملودیِ پراکنده‌ی دلنشین
      reverb = new Tone.Reverb({ decay: 12, wet: 0.65 }).connect(masterGain);
      const delay = new Tone.FeedbackDelay({
        delayTime: "4n.",
        feedback: 0.35,
        wet: 0.25,
      }).connect(reverb);

      // پدِ آرام و گرم (سینوسی، attack/release بلند)
      droneSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 6, decay: 3, sustain: 0.85, release: 10 },
        volume: -18,
      }).connect(reverb);
      droneSynth.triggerAttack(PAD_CHORD);

      // ملودیِ زنگ‌مانندِ نرم و پراکنده
      arpSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 0.6, sustain: 0.0, release: 1.6 },
        volume: -24,
      }).connect(delay);

      let i = 0;
      arpLoop = new Tone.Loop((time: number) => {
        // فقط گاهی نتی می‌نوازد تا شلوغ و آزاردهنده نباشد
        if (i % 2 === 0) {
          arpSynth.triggerAttackRelease(
            ARP_NOTES[(i / 2) % ARP_NOTES.length],
            "2n",
            time
          );
        }
        i++;
      }, "2n");

      Tone.Transport.bpm.value = 52;
      Tone.Transport.start();
      arpLoop.start("2m");
    }

    // SFX synth جدا
    sfxSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 },
    }).toDestination();
    sfxSynth.volume.value = -8;

    // fade-in نرم (صدای پس‌زمینه‌ی ملایم)
    masterGain.gain.rampTo(muted ? 0 : 0.55, 4);
  } catch (e) {
    // اگر Tone بارگذاری نشد، بازی بدون صدا ادامه می‌یابد
    console.warn("Audio init failed", e);
  }
}

export function setMuted(m: boolean): void {
  muted = m;
  if (masterGain) masterGain.gain.rampTo(m ? 0 : 0.55, 0.5);
}

// تنش بر اساس کسر زمان باقی‌مانده (۰ تا ۱، ۱ = تازه شروع)
export function updateTension(fractionRemaining: number): void {
  if (!Tone || usingFile) return;
  try {
    const f = Math.max(0, Math.min(1, fractionRemaining));
    // هرچه زمان کمتر، کمی تنش بیشتر (ملایم، نه آزاردهنده)
    const bpm = 52 + (1 - f) * 26; // 52 → 78
    Tone.Transport.bpm.rampTo(bpm, 6);
    if (reverb) reverb.wet.rampTo(0.65 - (1 - f) * 0.25, 3);
  } catch {
    /* noop */
  }
}

type Sfx = "unlock" | "error" | "door" | "tick";

export function playSfx(kind: Sfx): void {
  if (!Tone || muted) return;
  try {
    const now = Tone.now();
    switch (kind) {
      case "unlock":
        sfxSynth.triggerAttackRelease("C5", "16n", now);
        sfxSynth.triggerAttackRelease("G5", "16n", now + 0.09);
        sfxSynth.triggerAttackRelease("C6", "8n", now + 0.18);
        break;
      case "error":
        sfxSynth.triggerAttackRelease("A2", "16n", now);
        sfxSynth.triggerAttackRelease("F2", "8n", now + 0.08);
        break;
      case "door":
        sfxSynth.triggerAttackRelease("C3", "2n", now);
        sfxSynth.triggerAttackRelease("G3", "2n", now + 0.2);
        sfxSynth.triggerAttackRelease("C4", "1n", now + 0.4);
        break;
      case "tick":
        sfxSynth.triggerAttackRelease("C6", "32n", now);
        break;
    }
  } catch {
    /* noop */
  }
}

export function isUsingFile(): boolean {
  return usingFile;
}
