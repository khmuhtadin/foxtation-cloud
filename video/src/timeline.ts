import env from '../public/audio/vo-env.json';
import {FPS} from './anim';

// The VO is one take, cut at its pauses and placed on the timeline.
// from/to: seconds in vo-jessica.mp3. at: seconds in the video.
export const VO = [
  {from: 0.0, to: 2.55, at: 0.8}, //   Typing is slow. Talking isn't.
  {from: 2.6, to: 4.12, at: 3.7}, //   Meet Foxtation.
  {from: 4.12, to: 9.1, at: 5.6}, //   Hold Option, speak, let go... and it's typed, in any app on your Mac.
  {from: 9.15, to: 12.5, at: 11.0}, // Twenty-three languages. Even two in one sentence.
  {from: 12.55, to: 13.85, at: 14.6}, // Ramble a little?
  {from: 14.2, to: 17.1, at: 16.1}, // Pro cleans it up, in the right tone for every app.
  {from: 17.15, to: 19.7, at: 20.0}, // Free, open source, and private.
  {from: 19.75, to: 23.55, at: 23.4}, // Foxtation. Hold Option, and say hello.
];

/** How loud the voice is at a video time, 0..1. */
export const voLevel = (frame: number) => {
  const t = frame / FPS;
  const seg = VO.find((v) => t >= v.at && t < v.at + (v.to - v.from));
  if (!seg) return 0;
  return env[Math.round((seg.from + t - seg.at) * FPS)] ?? 0;
};

// Scene boundaries, in seconds.
export const SCENES = {
  hook: [0, 3.6],
  brand: [3.6, 5.75],
  gesture: [5.6, 10.95],
  languages: [10.9, 14.5],
  cleanup: [14.45, 19.75],
  private: [19.6, 23.75],
  outro: [23.25, 30],
} as const;
