import {interpolate} from 'remotion';
import {C, MONO, SANS, SERIF} from '../theme';
import {glide, inQuint, pop, prog, s} from '../anim';
import {Pill} from '../ui';
import {voLevel} from '../timeline';

// Where the pill sits; Brand picks up the fox face from here.
export const HOOK_PILL = {left: 637, top: 744, scale: 1.7};

// Slow, hesitant typing with a typo: "slwo" → "slow."
const KEYS: [number, string][] = [];
{
  let t = 0.15;
  for (const ch of 'Typing is slwo') KEYS.push([(t += 0.075), ch]);
  t += 0.15;
  KEYS.push([(t += 0.07), '⌫'], [(t += 0.07), '⌫']);
  for (const ch of 'ow.') KEYS.push([(t += 0.08), ch]);
}

const typed = (frame: number) => {
  let text = '';
  for (const [t, ch] of KEYS) {
    if (frame < s(t)) break;
    text = ch === '⌫' ? text.slice(0, -1) : text + ch;
  }
  return text;
};

const Word = ({frame, at, children}: {frame: number; at: number; children: string}) => {
  const p = pop(frame, at);
  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: 22,
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      {children}
    </span>
  );
};

export const Hook = ({frame}: {frame: number}) => {
  const enter = glide(frame, 0);
  const exit = prog(frame, 3.28, 3.6, inQuint);
  const typing = frame < s(1.75);
  const caretOn = typing || Math.floor(frame / 30) % 2 === 0;
  const grow = interpolate(glide(frame, 1.95) - prog(frame, 3.3, 3.58, inQuint), [0, 1], [0, 1], {extrapolateLeft: 'clamp'});
  const state = frame < s(3.0) ? 'listening' : 'success';

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 400,
          top: 250,
          width: 1120,
          height: 380,
          background: C.card,
          borderRadius: 32,
          border: `1px solid ${C.line}`,
          boxShadow: '0 40px 80px rgba(21,26,51,0.08)',
          padding: '34px 56px',
          boxSizing: 'border-box',
          opacity: enter * (1 - exit),
          transform: `translateY(${(1 - enter) * 30 - exit * 40}px) scale(${1 - exit * 0.04})`,
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 22, color: C.faint, display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: '#30D158'}} />
          message #product-team
        </div>
        <div style={{fontFamily: SANS, fontSize: 92, fontWeight: 800, letterSpacing: '-0.035em', color: C.ink, marginTop: 40, lineHeight: 1.1}}>
          {typed(frame)}
          {frame < s(2.0) && (
            <span style={{display: 'inline-block', width: 6, height: 84, marginLeft: 6, background: C.indigo, verticalAlign: '-10px', opacity: caretOn ? 1 : 0}} />
          )}
        </div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 96, fontWeight: 700, color: C.indigo, lineHeight: 1.1, letterSpacing: '-0.02em'}}>
          <Word frame={frame} at={2.08}>Talking</Word>
          <Word frame={frame} at={2.55}>isn’t.</Word>
        </div>
      </div>
      {frame >= s(1.95) && (
        <Pill
          frame={frame}
          {...HOOK_PILL}
          grow={grow}
          state={state}
          label={state === 'success' ? 'Pasted' : 'Listening'}
          detail={state === 'success' ? '· #product-team' : '0:01'}
          level={voLevel(frame)}
        />
      )}
    </>
  );
};
