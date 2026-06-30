/**
 * Canonical brand palette — sourced from `portal/public/Brand Colors.csv`.
 * Do not hardcode these hex values in components; use Tailwind `brand-*` classes
 * or import from this module for inline styles.
 */
export const BRAND_COLOR_SOURCE = '/Brand Colors.csv' as const;

export const BRAND_COLORS = {
  green: '#84BD00',
  darkGreen: '#00843D',
  blue: '#00A3E0',
  darkBlue: '#0033A0',
  gray: '#5F6369',
  neutralGray: '#C0C0C0',
  lightGray: '#DADADA',
  darkGray: '#323232',
  white: '#FFFFFF',
} as const;

/** Light tints derived from the palette (not in CSV — for backgrounds only). */
export const BRAND_DERIVED = {
  darkGreenLight: '#E6F2EC',
  greenLight: '#EEF6DC',
  blueLight: '#E6F4FB',
  pageBackground: '#FAFAFA',
} as const;

export type BrandColorName = keyof typeof BRAND_COLORS;
