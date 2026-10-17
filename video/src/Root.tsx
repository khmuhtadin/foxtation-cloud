import {Composition} from 'remotion';
import {Intro} from './Intro';
import {FPS, s} from './anim';

export const Root = () => (
  <Composition id="Intro" component={Intro} width={1920} height={1080} fps={FPS} durationInFrames={s(30)} />
);
