/**
 * Theme definitions for the three visual motifs.
 *
 * Each theme object contains colors, typography config, and effects
 * settings used by the preview components.
 */

export const THEME_IDS = {
    STATION_SIGNS: 'station-signs',
    LED_DISPLAY: 'led-display',
    SPLIT_FLAP: 'split-flap',
};

/**
 * Station Signs theme.
 * Bold chunky sans-serif, high-contrast white-on-black, thick bordered sections.
 */
const stationSigns = {
    id: THEME_IDS.STATION_SIGNS,
    name: 'Station Signs',
    colors: {
        background: '#000000',
        surface: '#111111',
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        accent: '#00CC66',
        muted: '#666666',
        border: '#FFFFFF',
        buttonActive: '#00CC66',
        buttonInactive: '#333333',
        dotActive: '#00CC66',
        dotInactive: '#444444',
        radarBg: '#0A0A0A',
        radarRing: 'rgba(255, 255, 255, 0.15)',
        radarCrosshair: 'rgba(255, 255, 255, 0.08)',
        radarCenter: '#FFFFFF',
        radarNorth: '#FF4444',
        radarStationNear: '#00CC66',
        radarStationMid: '#FFCC00',
        radarStationFar: '#888888',
    },
    typography: {
        fontFamily: 'Oswald_700Bold',
        titleSize: 32,
        headingSize: 22,
        bodySize: 16,
        smallSize: 12,
        letterSpacing: 2,
    },
    effects: {
        borderWidth: 3,
        sectionPadding: 16,
    },
};

/**
 * LED Platform Display theme.
 * Pixel font, amber/orange on pure black, text glow via textShadow.
 */
const ledDisplay = {
    id: THEME_IDS.LED_DISPLAY,
    name: 'LED Display',
    colors: {
        background: '#000000',
        surface: '#0A0A00',
        primary: '#FF8C00',
        secondary: '#CC7000',
        accent: '#FF8C00',
        muted: '#664600',
        border: '#FF8C00',
        buttonActive: '#FF8C00',
        buttonInactive: '#332200',
        dotActive: '#FF8C00',
        dotInactive: '#332200',
        radarBg: '#050500',
        radarRing: 'rgba(255, 140, 0, 0.15)',
        radarCrosshair: 'rgba(255, 140, 0, 0.08)',
        radarCenter: '#FF8C00',
        radarNorth: '#FF8C00',
        radarStationNear: '#FF8C00',
        radarStationMid: '#CC7000',
        radarStationFar: '#664600',
    },
    typography: {
        fontFamily: 'PressStart2P_400Regular',
        titleSize: 16,
        headingSize: 12,
        bodySize: 10,
        smallSize: 8,
        letterSpacing: 1,
    },
    effects: {
        glowColor: '#FF8C00',
        glowRadius: 8,
        flickerEnabled: true,
        scrollEnabled: true,
    },
};

/**
 * Split-Flap (Solari Board) theme.
 * Individual character cells with horizontal split line, cream on dark gray.
 */
const splitFlap = {
    id: THEME_IDS.SPLIT_FLAP,
    name: 'Split-Flap',
    colors: {
        background: '#1A1A1A',
        surface: '#2A2A2A',
        primary: '#F5F0E1',
        secondary: '#C8C0A8',
        accent: '#F5F0E1',
        muted: '#666666',
        border: '#444444',
        buttonActive: '#F5F0E1',
        buttonInactive: '#3A3A3A',
        dotActive: '#F5F0E1',
        dotInactive: '#3A3A3A',
        radarBg: '#1E1E1E',
        radarRing: 'rgba(245, 240, 225, 0.12)',
        radarCrosshair: 'rgba(245, 240, 225, 0.06)',
        radarCenter: '#F5F0E1',
        radarNorth: '#E84040',
        radarStationNear: '#F5F0E1',
        radarStationMid: '#C8C0A8',
        radarStationFar: '#666666',
    },
    typography: {
        fontFamily: null, // Uses system monospace
        fontFallback: 'monospace',
        titleSize: 28,
        headingSize: 20,
        bodySize: 16,
        smallSize: 11,
        letterSpacing: 4,
    },
    effects: {
        cellBackground: '#333333',
        cellBorder: '#444444',
        splitLineColor: 'rgba(0, 0, 0, 0.4)',
        flipDuration: 300,
        staggerDelay: 60,
    },
};

export const THEMES = {
    [THEME_IDS.STATION_SIGNS]: stationSigns,
    [THEME_IDS.LED_DISPLAY]: ledDisplay,
    [THEME_IDS.SPLIT_FLAP]: splitFlap,
};

export const THEME_ORDER = [
    THEME_IDS.STATION_SIGNS,
    THEME_IDS.LED_DISPLAY,
    THEME_IDS.SPLIT_FLAP,
];
