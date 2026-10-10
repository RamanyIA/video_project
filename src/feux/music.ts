import music from './data/music.json';

export {music};

// Energy (0-1) at time t, sampled at 10 Hz.
export const energyAt = (t: number) => music.energy[Math.max(0, Math.min(music.energy.length - 1, Math.round(t * 10)))] ?? 0;

// Index of the last beat at or before t (binary search), -1 before the first beat.
export const beatIndexAt = (t: number) => {
  let lo = 0;
  let hi = music.beats.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (music.beats[mid] <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
};

// 1 right on a beat, decaying to 0 before the next one.
export const beatPulse = (t: number, decay = 0.35) => {
  const i = beatIndexAt(t);
  if (i < 0) return 0;
  return Math.exp(-(t - music.beats[i]) / (decay * 0.3));
};

// Same for downbeats (every 4th beat).
export const downbeatPulse = (t: number, decay = 0.6) => {
  const i = beatIndexAt(t);
  if (i < 0) return 0;
  const d = i - (i % 4);
  return Math.exp(-(t - music.beats[d]) / (decay * 0.3));
};
