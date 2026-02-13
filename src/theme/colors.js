/**
 * Centralized LED Display theme constants.
 *
 * Orange/amber on pure black with PressStart2P pixel font.
 * Single source of truth for all colors, glow effects, and font references.
 */

export const COLORS = {
    background: '#000000',
    surface: '#0A0A00',
    surfaceElevated: '#111100',
    primary: '#FF8C00',
    secondary: '#CC7000',
    muted: '#664600',
    dimmed: '#332200',
    border: '#332200',
    textPrimary: '#FF8C00',
    textSecondary: '#CC7000',
    textMuted: '#664600',
    error: '#FF5500',
    cooldownBg: 'rgba(255, 140, 0, 0.12)',
    cooldownBorder: 'rgba(255, 140, 0, 0.25)',
    insideBg: 'rgba(255, 140, 0, 0.2)',
    selectedBg: 'rgba(255, 140, 0, 0.15)',
    majorBg: 'rgba(204, 112, 0, 0.15)',
    countBg: 'rgba(255, 140, 0, 0.2)',
    // Radar
    radarBg: '#050500',
    radarRing: 'rgba(255, 140, 0, 0.15)',
    radarCrosshair: 'rgba(255, 140, 0, 0.08)',
};

export const LED_GLOW = {
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
};

export const FONTS = {
    pixel: 'PressStart2P_400Regular',
};

export const TYPOGRAPHY = {
    titleSize: 16,
    headingSize: 12,
    bodySize: 10,
    smallSize: 8,
    letterSpacing: 1,
};
