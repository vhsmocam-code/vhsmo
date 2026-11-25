/**
 * Soundtrack for the unboxing story viewer.
 *
 * One shared <audio>, created lazily so nothing downloads until someone taps a
 * story. start() must be called from the tap itself (a user gesture) or mobile
 * browsers refuse to play. The clip in public/reviews is already trimmed to
 * begin 15s into the track, so every open starts at the hook, not the intro.
 */

const SRC = "/reviews/story-music.mp3";
const VOLUME = 0.7;
const MUTE_KEY = "vhsmo:story-muted";

let audio: HTMLAudioElement | null = null;
let fade = 0;
let muted = false;

try {
  muted = sessionStorage.getItem(MUTE_KEY) === "1";
} catch {
  /* storage can throw in private windows - default to sound on */
}

function el(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio(SRC);
    audio.preload = "none";
    audio.loop = true;
  }
  return audio;
}

function fadeTo(target: number, ms: number, done?: () => void) {
  const a = audio;
  if (!a) return;
  cancelAnimationFrame(fade);
  const from = a.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    a.volume = from + (target - from) * k;
    if (k < 1) fade = requestAnimationFrame(step);
    else done?.();
  };
  fade = requestAnimationFrame(step);
}

/** Begin from the top of the clip with a soft fade-in. Call inside a click. */
export function startStoryMusic() {
  const a = el();
  if (!a) return;
  cancelAnimationFrame(fade);
  a.currentTime = 0;
  a.volume = 0;
  a.muted = muted;
  void a.play().then(() => fadeTo(VOLUME, 600)).catch(() => {});
}

/** Hold-to-pause / hidden tab: freeze in place. */
export function pauseStoryMusic() {
  audio?.pause();
}

/** Resume from exactly where it froze. */
export function resumeStoryMusic() {
  const a = audio;
  if (!a) return;
  a.muted = muted;
  void a.play().then(() => fadeTo(VOLUME, 250)).catch(() => {});
}

/** Viewer closed: fade out, then rewind so the next open starts fresh. */
export function stopStoryMusic() {
  const a = audio;
  if (!a) return;
  fadeTo(0, 350, () => {
    a.pause();
    a.currentTime = 0;
  });
}

export function isStoryMusicMuted() {
  return muted;
}

export function setStoryMusicMuted(next: boolean) {
  muted = next;
  if (audio) audio.muted = next;
  try {
    sessionStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
}
