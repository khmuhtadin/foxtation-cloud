import type {CSSProperties, ReactNode} from 'react';
import {Img, staticFile} from 'remotion';
import {C, MONO, SANS} from './theme';
import {mix} from './anim';

export type PillState = 'listening' | 'processing' | 'success';

const ACCENT: Record<PillState, string> = {listening: '#6C7DF2', processing: '#FF9F0A', success: '#30D158'};
const WAVE: Record<PillState, [string, string]> = {
  listening: ['#5B6FE0', '#7F8CFF'],
  processing: ['#FF8A00', '#FFB340'],
  success: ['#5B6FE0', '#7F8CFF'],
};

export const PILL_W = 380;
export const PILL_H = 52;
/** Distance from the pill's left edge to the fox face's center. */
export const PILL_FACE_X = 28;

/** Five bars, like the app's waveform. level 0..1 drives the height. */
export const Waveform = ({frame, level, state}: {frame: number; level: number; state: PillState}) => {
  const shape = [0.55, 0.85, 1, 0.75, 0.6];
  const [a, b] = WAVE[state];
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 5, height: 28}}>
      {shape.map((k, i) => {
        const wobble = 0.75 + 0.25 * Math.sin(frame * 0.33 + i * 1.3);
        const amount = state === 'processing' ? 0.45 + 0.4 * Math.sin(frame * 0.25 - i * 0.9) : level * k * wobble;
        return (
          <div
            key={i}
            style={{width: 5, height: mix(6, 28, Math.max(0, amount)), borderRadius: 3, background: i < 2 ? a : b}}
          />
        );
      })}
    </div>
  );
};

/**
 * The dictation HUD from the app (Sources/Foxtation/HUD/DictationHUDView.swift).
 * Anchored at its left edge so it can grow out of the fox face: grow 0 = only the face.
 */
export const Pill = ({
  frame,
  left,
  top,
  scale,
  grow = 1,
  state,
  label,
  detail,
  level = 0,
  opacity = 1,
}: {
  frame: number;
  left: number;
  top: number;
  scale: number;
  grow?: number;
  state: PillState;
  label: string;
  detail?: string;
  level?: number;
  opacity?: number;
}) => {
  const width = mix(56, PILL_W, grow);
  const content = Math.max(0, (grow - 0.55) / 0.45);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: PILL_H,
        transform: `translateY(-50%) scale(${scale})`,
        transformOrigin: '0 50%',
        opacity,
        borderRadius: 999,
        background: C.pill,
        border: `1.5px solid ${ACCENT[state]}`,
        boxShadow: '0 18px 40px rgba(21,26,51,0.22), 0 4px 10px rgba(21,26,51,0.12)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 10,
        paddingRight: 14,
        boxSizing: 'border-box',
        fontFamily: SANS,
      }}
    >
      <Img src={staticFile('fox/face.png')} style={{width: 36, height: 36, flex: 'none'}} />
      <div style={{flex: 1, display: 'flex', gap: 7, alignItems: 'baseline', opacity: content, whiteSpace: 'nowrap'}}>
        <span style={{color: state === 'success' ? '#30D158' : '#fff', fontSize: 15, fontWeight: 700}}>{label}</span>
        {detail ? <span style={{color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500}}>{detail}</span> : null}
      </div>
      <div style={{opacity: content, display: 'flex', alignItems: 'center', gap: 10}}>
        {state === 'success' ? <Check /> : <Waveform frame={frame} level={level} state={state} />}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 11,
            fontWeight: 800,
            display: 'grid',
            placeItems: 'center',
            opacity: state === 'listening' ? 1 : 0,
          }}
        >
          ✕
        </div>
      </div>
    </div>
  );
};

const Check = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="#30D158" />
    <path d="M7 12.4l3.3 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** The right Option key. pressed 0..1. */
export const Keycap = ({pressed, size = 1, style}: {pressed: number; size?: number; style?: CSSProperties}) => {
  return (
    <div style={{width: 300 * size, height: 236 * size, position: 'relative', ...style}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          top: 16 * size,
          borderRadius: 40 * size,
          background: '#C9D0F5',
          boxShadow: `0 ${mix(30, 12, pressed) * size}px ${mix(50, 24, pressed) * size}px rgba(21,26,51,${mix(0.16, 0.1, pressed)})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 12 * pressed * size,
          height: 220 * size,
          borderRadius: 40 * size,
          background: C.card,
          border: `${2 * size}px solid #C9D0F5`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: `${26 * size}px ${32 * size}px`,
        }}
      >
        <div style={{fontFamily: SANS, fontSize: 96 * size, lineHeight: 1, color: C.ink, fontWeight: 500, textAlign: 'right'}}>⌥</div>
        <div style={{fontFamily: MONO, fontSize: 30 * size, color: C.faint}}>option</div>
      </div>
    </div>
  );
};

/** A plain Mac window. */
export const Window = ({title, children, style}: {title: string; children: ReactNode; style?: CSSProperties}) => (
  <div
    style={{
      position: 'absolute',
      background: C.card,
      borderRadius: 24,
      boxShadow: '0 40px 80px rgba(21,26,51,0.12), 0 6px 16px rgba(21,26,51,0.06)',
      border: `1px solid ${C.line}`,
      overflow: 'hidden',
      fontFamily: SANS,
      ...style,
    }}
  >
    <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 9, padding: '0 22px', borderBottom: `1px solid ${C.line}`}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
      ))}
      <div style={{flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 600, color: C.muted, marginRight: 60}}>{title}</div>
    </div>
    {children}
  </div>
);

export const Tag = ({children, bg = C.lilac, color = C.indigo, style}: {children: ReactNode; bg?: string; color?: string; style?: CSSProperties}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '8px 16px',
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: SANS,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </span>
);

export const Fox = ({pose, size, style}: {pose: string; size: number; style?: CSSProperties}) => (
  <Img src={staticFile(`fox/${pose}.png`)} style={{position: 'absolute', width: size, height: size, ...style}} />
);
