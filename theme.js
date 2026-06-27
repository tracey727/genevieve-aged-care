// ===========================================================================
// GENEVIEVE · DIVISION COLOUR FILE — HEALTH (Aged Care)
// One colour file per division. Any health sub-app imports THEME from here.
// Chosen division colour: deep teal (calm, clinical). Dark border + light bg.
// To re-skin a division, edit this file only.
// ===========================================================================

export const THEME = {
  name: 'Health',
  tagline: 'Care Command',

  // Frame + surfaces (dark border, light background)
  frame:    '#0f5e57',   // dark teal border around the app
  headerA:  '#0c4a45',   // header gradient start (dark)
  headerB:  '#159487',   // header gradient end
  pageBg:   '#e3f1ef',   // light teal background
  card:     '#ffffff',
  cardSoft: '#effaf8',

  // Accent (division colour)
  accent:     '#0f5e57',
  accentDeep: '#0a3f3a',
  accentSoft: '#d8ece9',
  onAccent:   '#ffffff',

  // Text
  ink:   '#143a36',
  slate: '#5f7a76',
  line:  '#cfe5e1',

  // Status traffic lights (shared across all divisions)
  green: '#2f9e44', amber: '#d69e2e', red: '#e03131',
  greenSoft: '#e8f5ec', amberSoft: '#fbf3da', redSoft: '#ffe3e3',
  greenText: '#1c6e30', amberText: '#8a6300', redText: '#b01818',
}
