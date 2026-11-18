/**
 * Zamana Market brand assets (public/brand/zamana-logo-pack).
 *
 * The pack has four logo directions: A-exchange-z, B-open-stall, C-damota-road, D-z-cart.
 * To switch the whole site to another one, change DIRECTION below, then re-create the PNG
 * icons (public/brand/icons, app/apple-icon.png, app/opengraph-image.png) and app/icon.svg.
 */
const DIRECTION = 'A-exchange-z';

const file = (variant: string) => `/brand/zamana-logo-pack/${DIRECTION}/${DIRECTION}_${variant}.svg`;

export const brand = {
  /** Symbol + "Zamana Market", for light backgrounds. 341.4 × 64. */
  horizontalOnWhite: file('horizontal_colour-on-white'),
  /** Symbol + "Zamana Market", for the navy hero, footer and panels. */
  horizontalOnNavy: file('horizontal_colour-on-navy'),
  /** Symbol + "ዛማና ማርኬት" for when Amharic opens. 275.7 × 64. */
  geezOnWhite: file('geez_colour-on-white'),
  geezOnNavy: file('geez_colour-on-navy'),
  /** Symbol alone, 64 × 64. */
  symbolOnWhite: file('symbol_colour-on-white'),
  symbolOnNavy: file('symbol_colour-on-navy'),
  /** Rounded-square app icon, 64 × 64. */
  appIcon: file('app-icon_blue'),
  /** PNG icons for phones (generated from the SVGs above). */
  icon192: '/brand/icons/icon-192.png',
  icon512: '/brand/icons/icon-512.png',
  iconMaskable512: '/brand/icons/icon-maskable-512.png',
  colors: { blue: '#2557eb', navy: '#0c1a47', gold: '#e9aa2b', white: '#ffffff' },
} as const;

/** Width ÷ height of the horizontal and Ge'ez lockups, so <img> reserves the right space. */
export const LOCKUP_RATIO = { latin: 341.4 / 64, geez: 275.7 / 64 } as const;
