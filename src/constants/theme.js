import { Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const BASE_W = 390;
const scale  = Math.min(1.25, Math.max(0.78, SCREEN_W / BASE_W));
const fscale = Math.min(1.15, Math.max(0.82, SCREEN_W / BASE_W));

export const rs = n => Math.round(n * scale);
export const fs = n => Math.round(n * fscale);
export const SCREEN_W_VAL = SCREEN_W;
export const CARD_W = (SCREEN_W - rs(48)) / 2;

export const C = {
  // Primary — warm rose
  rose:      '#B5546A',
  roseLight: '#D4849A',
  rosePale:  '#F5E6EA',
  roseDeep:  '#7A2840',

  // Secondary — sage green
  sage:      '#5A7A5E',
  sagePale:  '#E6EFE6',
  sageDeep:  '#2E4D32',

  // Accent — amber
  amber:     '#C4853A',
  amberPale: '#FDF0E0',
  amberDeep: '#7A4A10',

  // Accent — lavender
  lavender:  '#7A6AAA',
  lavPale:   '#EEE8F5',

  // Accent — teal (sewing)
  teal:      '#3A7D8A',
  tealPale:  '#E0F0F3',
  tealDeep:  '#1F4D56',

  // Neutrals
  slate:      '#3A3040',
  slateMid:   '#6A5E70',
  slateLight: '#A898B0',
  bgPage:     '#FDF6F8',
  bgCard:     '#FFFFFF',
  bgMuted:    '#F5EEF0',
  border:     '#E8D8DC',
  white:      '#FFFFFF',
  red:        '#C0392B',
};

// Font families — Playfair Display for elegant headings
export const FONTS = {
  heading:        'PlayfairDisplay_700Bold',
  headingRegular: 'PlayfairDisplay_400Regular',
  headingItalic:  'PlayfairDisplay_400Regular_Italic',
};

export const DIFF_COLORS = {
  beginner:     C.sage,
  intermediate: C.amber,
  advanced:     C.rose,
};

export const CRAFT_COLORS = {
  crochet: C.rose,
  knitting: C.lavender,
  sewing: C.teal,
};