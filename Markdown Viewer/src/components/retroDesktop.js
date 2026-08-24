/**
 * Desktop colours for the Retro theme.
 *
 * Windows 3.1 ran on a fixed sixteen-colour VGA palette, and its Control Panel
 * let you set the desktop to any of them. These are the eight that shipped in
 * the named colour schemes, under the names Windows gave them.
 *
 * Each carries the text colour that stays legible on it, because the welcome
 * screen draws its heading and subtitle straight onto this background.
 */
export const RETRO_DESKTOP_COLORS = Object.freeze({
  teal:   Object.freeze({ label: 'Teal',   value: '#008080', text: '#ffffff' }),
  gray:   Object.freeze({ label: 'Gray',   value: '#c0c0c0', text: '#000000' }),
  navy:   Object.freeze({ label: 'Navy',   value: '#000080', text: '#ffffff' }),
  green:  Object.freeze({ label: 'Green',  value: '#008000', text: '#ffffff' }),
  olive:  Object.freeze({ label: 'Olive',  value: '#808000', text: '#ffffff' }),
  maroon: Object.freeze({ label: 'Maroon', value: '#800000', text: '#ffffff' }),
  purple: Object.freeze({ label: 'Purple', value: '#800080', text: '#ffffff' }),
  black:  Object.freeze({ label: 'Black',  value: '#000000', text: '#ffffff' })
});

/** Teal is the colour the theme shipped with and what most people picture. */
export const DEFAULT_RETRO_DESKTOP = 'teal';

/** The palette entry for a name, falling back to the default. */
export function resolveRetroDesktop(name) {
  return RETRO_DESKTOP_COLORS[name] || RETRO_DESKTOP_COLORS[DEFAULT_RETRO_DESKTOP];
}

/** Every desktop name, in the order the settings swatches present them. */
export function retroDesktopNames() {
  return Object.keys(RETRO_DESKTOP_COLORS);
}
