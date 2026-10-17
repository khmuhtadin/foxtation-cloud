import {Img, staticFile} from 'remotion';
import {C, SANS, SERIF} from '../theme';
import {glide, inOut, inQuint, mix, pop, prog, s} from '../anim';
import {PILL_FACE_X} from '../ui';
import {HOOK_PILL} from './Hook';
import {GESTURE_PILL} from './Gesture';

const from = {x: HOOK_PILL.left + PILL_FACE_X * HOOK_PILL.scale, y: HOOK_PILL.top, size: 36 * HOOK_PILL.scale};
const mid = {x: 560, y: 470, size: 300};
const to = {x: GESTURE_PILL.left + PILL_FACE_X * GESTURE_PILL.scale, y: GESTURE_PILL.top, size: 36 * GESTURE_PILL.scale};

// The fox face leaves the pill, becomes the logo, then flies into the next pill.
export const Brand = ({frame}: {frame: number}) => {
  const a = glide(frame, 3.6);
  const grow = pop(frame, 3.62);
  const b = prog(frame, 5.25, 5.72, inOut);
  const x = mix(mix(from.x, mid.x, a), to.x, b);
  const y = mix(mix(from.y, mid.y, a), to.y, b);
  const size = mix(mix(from.size, mid.size, grow), to.size, b);
  // A small squash as it lands.
  const squash = 1 + 0.06 * Math.sin(Math.min(1, (frame - s(3.75)) / 24) * Math.PI) * (frame > s(3.75) ? 1 : 0);

  const word = prog(frame, 4.12, 4.75);
  const tag = pop(frame, 4.6);
  const out = prog(frame, 5.15, 5.45, inQuint);

  return (
    <>
      <div style={{position: 'absolute', left: 760, top: 340, opacity: 1 - out, transform: `translateX(${-out * 40}px)`}}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 200,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: C.ink,
            lineHeight: 1,
            clipPath: `inset(-20% ${(1 - word) * 100}% -20% 0)`,
            transform: `translateX(${(1 - word) * -50}px)`,
          }}
        >
          foxtation
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: C.muted,
            marginTop: 18,
            marginLeft: 8,
            opacity: Math.min(1, tag * 1.5),
            transform: `translateY(${(1 - tag) * 24}px)`,
          }}
        >
          Your Mac <span style={{fontFamily: SERIF, fontStyle: 'italic', color: C.indigo}}>types it.</span>
        </div>
      </div>
      <Img
        src={staticFile('fox/face.png')}
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          transform: `scale(${squash}, ${2 - squash})`,
          transformOrigin: '50% 90%',
        }}
      />
    </>
  );
};
