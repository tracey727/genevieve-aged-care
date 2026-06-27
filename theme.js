// ===========================================================================
// GENEVIEVE · DIVISION COLOUR FILE — KIDS (Childcare)
// One colour file per division. Any childcare sub-app imports THEME from here,
// so the whole division shares one look. Dark border + light background.
// To re-skin a division, edit this file only.
// ===========================================================================

export const THEME = {
  name: 'Kids',
  tagline: 'Centre Command',

  // Frame + surfaces (dark border, light background)
  frame:    '#9c2d54',   // dark border around the app
  headerA:  '#8e2247',   // header gradient start (dark)
  headerB:  '#c0436f',   // header gradient end
  pageBg:   '#fbe1ec',   // light background
  card:     '#ffffff',
  cardSoft: '#fdeef4',

  // Accent (division colour)
  accent:     '#9c2d54',
  accentDeep: '#7a1f40',
  accentSoft: '#fbe1ec',
  onAccent:   '#ffffff',

  // Text
  ink:   '#4a1f30',
  slate: '#8a6470',
  line:  '#f1cdd9',

  // Status traffic lights (shared across all divisions)
  green: '#2f9e44', amber: '#d69e2e', red: '#e03131',
  greenSoft: '#e8f5ec', amberSoft: '#fbf3da', redSoft: '#ffe3e3',
  greenText: '#1c6e30', amberText: '#8a6300', redText: '#b01818',
}
