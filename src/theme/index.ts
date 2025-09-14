import { colors } from './colors';
import { typography, fontFamily, fontSize } from './typography';
import { spacing, borderRadius, shadows, dimensions } from './spacing';

// Main theme object combining all theme elements
export const theme = {
  colors,
  typography,
  fontFamily,
  fontSize,
  spacing,
  borderRadius,
  shadows,
  dimensions,

  layout: {
    dflexRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
  },
  text: {
    bannerTitleText: {
      ...typography.h3,
      color: colors.primary[900],
      fontWeight: '700',
      marginBottom: spacing[2],
    }
  },
  // Component-specific styles
  components: {
    // Input field styles
    input: {
      default: {
        height: dimensions.inputHeight.lg,
        borderRadius: borderRadius.xl,
        borderWidth: dimensions.borderWidth.base,
        borderColor: colors.glassmorphism.border,
        backgroundColor: colors.glassmorphism.background,
        paddingHorizontal: spacing[4],
        ...typography.body1,
        color: colors.text.primary,
      },
      focused: {
        borderColor: colors.primary[500],
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      },
      error: {
        borderColor: colors.error,
      },
    },

    //Header styles
    header: {
      height: 60,
      width: '100%',
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: spacing[4],
    },
    // Button styles
    button: {
      primary: {
        height: dimensions.buttonHeight.lg,
        borderRadius: borderRadius['2xl'],
        backgroundColor: colors.primary[600],
        paddingHorizontal: spacing[8],
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...shadows.md,
      },
      primaryText: {
        ...typography.button,
        color: colors.white,
        textTransform: 'none' as const,
      },
    },

    // Card/Form container styles
    card: {
      glassmorphism: {
        backgroundColor: colors.glassmorphism.background,
        borderRadius: borderRadius['3xl'],
        borderWidth: dimensions.borderWidth.thin,
        borderColor: colors.glassmorphism.border,
        padding: spacing[8],
        ...shadows.glassmorphism,
      },
    },

    // Checkbox styles
    checkbox: {
      container: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginVertical: spacing[2],
      },
      box: {
        width: spacing[5],
        height: spacing[5],
        borderRadius: borderRadius.sm,
        borderWidth: dimensions.borderWidth.base,
        borderColor: colors.primary[400],
        marginRight: spacing[3],
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      checked: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
      },
      text: {
        ...typography.body2,
        color: colors.text.secondary,
        flex: 1,
      },
    },
  },
} as const;

// Export individual theme parts for convenience
export { colors, typography, fontFamily, fontSize, spacing, borderRadius, shadows, dimensions };

// Type definitions for theme
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;