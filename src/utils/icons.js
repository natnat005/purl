// Central icon helper. Returns the Ionicon name for a given craft type or
// difficulty. Used in place of the old emoji field on patterns.
//
// Why one helper: keeping the mapping in one file means we can change the
// visual style (outline vs filled, different icon names, etc) in one place
// instead of touching every screen that renders a pattern.

export const CRAFT_ICONS = {
  crochet:  'flower-outline',          // soft round = crochet's looped quality
  knitting: 'reorder-three-outline',   // parallel lines = stitches on needles
  sewing:   'cut-outline',             // scissors = fabric work
};

export const DIFF_ICONS = {
  beginner:     'leaf-outline',
  intermediate: 'sparkles-outline',
  advanced:     'flame-outline',
};

// Get the right icon for a pattern.
// If the pattern declares its own icon (e.g. 'shirt-outline' for a sweater),
// use that. Otherwise fall back to the craft-type icon.
export function iconForPattern(pattern) {
  if (!pattern) return 'shapes-outline';
  if (pattern.icon) return pattern.icon;
  return CRAFT_ICONS[pattern.type] || 'shapes-outline';
}

export function iconForDifficulty(cat) {
  return DIFF_ICONS[cat] || 'ellipse-outline';
}