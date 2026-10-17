import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const s = (sec: number) => Math.round(sec * FPS);

export const outQuint = Easing.bezier(0.22, 1, 0.36, 1);
export const inQuint = Easing.bezier(0.64, 0, 0.78, 0);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 between two times (seconds), eased. */
export const prog = (frame: number, a: number, b: number, ease = outQuint) =>
  interpolate(frame, [s(a), s(b)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Playful entrance with a little overshoot. */
export const pop = (frame: number, at: number) =>
  spring({frame: frame - s(at), fps: FPS, config: {damping: 12, mass: 0.6, stiffness: 180}});

/** Calm entrance, no overshoot. */
export const glide = (frame: number, at: number) =>
  spring({frame: frame - s(at), fps: FPS, config: {damping: 200, stiffness: 120}});

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
