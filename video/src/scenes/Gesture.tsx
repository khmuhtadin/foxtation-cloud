import type {ReactNode} from 'react';
import {interpolate, spring} from 'remotion';
import {C, MONO, SANS} from '../theme';
import {FPS, glide, inQuint, mix, pop, prog, s} from '../anim';
import {Keycap, Pill, Window} from '../ui';
import {voLevel} from '../timeline';

export const GESTURE_PILL = {left: 975, top: 905, scale: 1.5};

const WIN = {left: 760, top: 170, width: 1000, height: 640};
const PRESS = 5.67;
const RELEASE = 7.34;
const PASTE = 7.62;
const SEND = 8.54;
const SWAPS = [9.13, 9.5, 9.89];
const MESSAGE = 'On my way, start without me. I’ll catch up on the notes.';

const keyDown = (frame: number, at: number) =>
  spring({frame: frame - s(at), fps: FPS, config: {damping: 30, stiffness: 500}});

const reveal = (text: string, frame: number, at: number, dur: number) =>
  text.slice(0, Math.round(text.length * prog(frame, at, at + dur, (t) => t)));

const Avatar = ({name, color}: {name: string; color: string}) => (
  <div style={{width: 48, height: 48, borderRadius: 14, background: color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, color: C.ink, flex: 'none'}}>
    {name[0]}
  </div>
);

const Message = ({name, color, text, style}: {name: string; color: string; text: string; style?: React.CSSProperties}) => (
  <div style={{display: 'flex', gap: 16, ...style}}>
    <Avatar name={name} color={color} />
    <div>
      <div style={{fontSize: 20, fontWeight: 700, color: C.ink}}>{name}</div>
      <div style={{fontSize: 24, color: C.muted, marginTop: 4}}>{text}</div>
    </div>
  </div>
);

const Messages = ({frame}: {frame: number}) => {
  const sent = pop(frame, SEND);
  const composer = frame < s(SEND) ? reveal(MESSAGE, frame, PASTE, 0.4) : '';
  return (
    <div style={{padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: 26, height: WIN.height - 56, boxSizing: 'border-box'}}>
      <div style={{fontSize: 22, fontWeight: 800, color: C.ink}}># product-team</div>
      <Message name="Dina" color={C.cream} text="Standup in five?" />
      <Message name="Arif" color={C.lilac} text="Joining from the train today" />
      <Message
        name="You"
        color={C.sun}
        text={MESSAGE}
        style={{opacity: Math.min(1, sent * 1.5), transform: `translateY(${(1 - sent) * 30}px)`, transformOrigin: '0 100%'}}
      />
      <div style={{marginTop: 'auto', border: `2px solid ${frame >= s(PASTE) && frame < s(SEND) ? C.periwinkle : C.line}`, borderRadius: 18, padding: '20px 24px', fontSize: 24, color: composer ? C.ink : C.faint}}>
        {composer || 'Message #product-team'}
      </div>
    </div>
  );
};

const Body = ({children}: {children: ReactNode}) => (
  <div style={{padding: '40px 48px', fontSize: 30, lineHeight: 1.5, color: C.ink}}>{children}</div>
);

const Mail = ({frame, at}: {frame: number; at: number}) => (
  <Body>
    <div style={{fontSize: 22, color: C.faint, borderBottom: `1px solid ${C.line}`, paddingBottom: 16}}>To: hiring@studio.co</div>
    <div style={{fontSize: 22, color: C.faint, borderBottom: `1px solid ${C.line}`, padding: '16px 0'}}>Subject: Thursday works</div>
    <div style={{marginTop: 26}}>{reveal('Hi Maya, Thursday at ten works for me. I’ll bring the portfolio and the case study we talked about.', frame, at + 0.05, 0.28)}</div>
  </Body>
);

const Notes = ({frame, at}: {frame: number; at: number}) => (
  <Body>
    <div style={{fontSize: 40, fontWeight: 800}}>Launch ideas</div>
    <div style={{marginTop: 20, color: C.muted}}>{reveal('Open with the fox. Show the key, then the text landing. Keep it under thirty seconds.', frame, at + 0.05, 0.28)}</div>
  </Body>
);

const Code = ({frame, at}: {frame: number; at: number}) => (
  <div style={{padding: '40px 48px', fontFamily: MONO, fontSize: 26, lineHeight: 1.7, color: C.muted}}>
    <div><span style={{color: C.faint}}>12</span>  <span style={{color: C.indigo}}>async function</span> upload(file) {'{'}</div>
    <div style={{color: '#3C8A5A'}}><span style={{color: C.faint}}>13</span>    {reveal('// retry twice when the network drops', frame, at + 0.05, 0.25)}</div>
    <div><span style={{color: C.faint}}>14</span>    <span style={{color: C.indigo}}>return</span> retry(() =&gt; send(file), 2)</div>
    <div><span style={{color: C.faint}}>15</span>  {'}'}</div>
  </div>
);

const WINDOWS = [
  {title: 'Messages', at: 5.55, Content: Messages},
  {title: 'Mail', at: SWAPS[0], Content: Mail},
  {title: 'Notes', at: SWAPS[1], Content: Notes},
  {title: 'Code', at: SWAPS[2], Content: Code},
];

const STEPS: [string, number][] = [['Hold', PRESS], ['Talk', 6.54], ['Let go', RELEASE]];

export const Gesture = ({frame}: {frame: number}) => {
  const exit = prog(frame, 10.55, 10.9, inQuint);
  const keyIn = pop(frame, 5.5);
  let pressed = keyDown(frame, PRESS) - keyDown(frame, RELEASE);
  for (const t of SWAPS) pressed += 0.7 * (keyDown(frame, t - 0.1) - keyDown(frame, t));
  const grow = glide(frame, 5.72) - prog(frame, 8.9, 9.1, inQuint);
  const state = frame < s(RELEASE) ? 'listening' : frame < s(PASTE) ? 'processing' : 'success';
  const seconds = Math.max(1, Math.ceil((frame - s(PRESS)) / FPS));

  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translateY(${exit * 60}px)`}}>
      <div style={{position: 'absolute', left: 275, top: 330, opacity: Math.min(1, keyIn * 1.4), transform: `translateY(${(1 - keyIn) * 80}px)`}}>
        <Keycap pressed={Math.max(0, Math.min(1, pressed))} size={1.3} />
        <div style={{display: 'flex', gap: 26, justifyContent: 'center', marginTop: 46, fontFamily: MONO, fontSize: 24, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
          {STEPS.map(([label, at]) => {
            const on = prog(frame, at, at + 0.2);
            return (
              <span key={label} style={{color: on > 0.5 ? C.ink : C.faint, transform: `translateY(${-6 * on * (1 - prog(frame, at + 0.2, at + 0.5))}px)`, display: 'inline-block'}}>
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {WINDOWS.map(({title, at, Content}, i) => {
        const next = WINDOWS[i + 1]?.at ?? 99;
        if (frame < s(at) || frame > s(next + 0.4)) return null;
        const inP = i === 0 ? glide(frame, at) : prog(frame, at, at + 0.35);
        const outP = prog(frame, next, next + 0.3);
        return (
          <Window
            key={title}
            title={title}
            style={{
              ...WIN,
              opacity: Math.min(1, inP * 1.5) * (1 - outP),
              transform: `translateX(${mix(i === 0 ? 140 : 90, 0, inP) - outP * 70}px) scale(${1 - outP * 0.05})`,
              zIndex: i,
            }}
          >
            <Content frame={frame} at={at} />
          </Window>
        );
      })}

      {frame >= s(5.72) && (
        <Pill
          frame={frame}
          {...GESTURE_PILL}
          grow={interpolate(grow, [0, 1], [0, 1], {extrapolateLeft: 'clamp'})}
          opacity={1 - prog(frame, 9.0, 9.12)}
          state={state}
          label={state === 'listening' ? 'Listening' : state === 'processing' ? 'Writing' : 'Pasted'}
          detail={state === 'listening' ? `0:0${seconds}` : state === 'success' ? '· Messages' : ''}
          level={voLevel(frame)}
        />
      )}
    </div>
  );
};
