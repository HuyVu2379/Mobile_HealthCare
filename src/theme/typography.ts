import { TextStyle } from 'react-native';

// Font family configuration
export const fontFamily = {
  montserrat: {
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
    extraBold: 'Montserrat-ExtraBold',
  },
};

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Line heights
export const lineHeight = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Typography styles
export const typography: Record<string, TextStyle> = {
  // Headers
  h1: {
    fontFamily: fontFamily.montserrat.bold,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
  },
  h2: {
    fontFamily: fontFamily.montserrat.bold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  h3: {
    fontFamily: fontFamily.montserrat.semiBold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.snug,
  },
  h4: {
    fontFamily: fontFamily.montserrat.semiBold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
  },
  h5: {
    fontFamily: fontFamily.montserrat.medium,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  h6: {
    fontFamily: fontFamily.montserrat.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  
  // Body text
  body1: {
    fontFamily: fontFamily.montserrat.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  body2: {
    fontFamily: fontFamily.montserrat.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  
  // Special text styles
  subtitle1: {
    fontFamily: fontFamily.montserrat.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  subtitle2: {
    fontFamily: fontFamily.montserrat.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  
  // Button text
  button: {
    fontFamily: fontFamily.montserrat.semiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
    textTransform: 'uppercase' as const,
  },
  
  // Caption and overline
  caption: {
    fontFamily: fontFamily.montserrat.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  overline: {
    fontFamily: fontFamily.montserrat.medium,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    textTransform: 'uppercase' as const,
  },
};