import {continueRender, delayRender, staticFile} from 'remotion';

// Same tokens as the landing page (site/assets/site.css).
export const C = {
  ink: '#151A33',
  muted: '#4B5170',
  faint: '#8A90AD',
  page: '#F5F7FF',
  card: '#FFFFFF',
  lilac: '#E6EAFF',
  line: '#DDE2FB',
  indigo: '#4A56E2',
  periwinkle: '#6C7BFF',
  sun: '#FFD66B',
  cream: '#FFF3CF',
  onDark: '#C3C8E4',
  pill: '#141A3A',
};

export const SANS = '"DM Sans", system-ui, sans-serif';
export const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
export const SERIF = '"Fraunces", Georgia, serif';

const fonts: [string, string, FontFaceDescriptors][] = [
  ['DM Sans', 'fonts/dm-sans.woff2', {weight: '400 800'}],
  ['DM Mono', 'fonts/dm-mono-400.woff2', {weight: '400'}],
  ['DM Mono', 'fonts/dm-mono-500.woff2', {weight: '500'}],
  ['Fraunces', 'fonts/fraunces-italic.woff2', {weight: '500 800', style: 'italic'}],
];

const handle = delayRender('fonts');
Promise.all(
  fonts.map(([family, file, desc]) => {
    const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, desc);
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));

// Text width for words that collapse in the cleanup scene.
const ctx = document.createElement('canvas').getContext('2d')!;
export const textWidth = (text: string, font: string) => {
  ctx.font = font;
  return ctx.measureText(text).width;
};
