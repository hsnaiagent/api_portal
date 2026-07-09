import { BRAND_COLORS, BRAND_COLOR_SOURCE, BRAND_DERIVED } from './brand-colors';
import greenLogoSvg from '../../public/portal-logo(t).svg?url';

export const BRAND = {
  name: 'API Portal',
  logoPath: '/portal-logo.webp',
  greenLogoPath: greenLogoSvg,
  colorSource: BRAND_COLOR_SOURCE,
  colors: BRAND_COLORS,
  tagline: 'Discover. Govern. Connect.',
  /** Primary action color — Dark Green from brand palette */
  primaryColor: BRAND_COLORS.darkGreen,
  /** Hover / pressed state for primary actions */
  primaryDark: '#006830',
  /** Subtle green background for active nav, chips, etc. */
  primaryLight: BRAND_DERIVED.darkGreenLight,
  /** Accent — Green from brand palette (highlights, metrics) */
  accentColor: BRAND_COLORS.green,
  /** Links and secondary interactive text */
  linkColor: BRAND_COLORS.blue,
  linkHoverColor: BRAND_COLORS.darkBlue,
} as const;
