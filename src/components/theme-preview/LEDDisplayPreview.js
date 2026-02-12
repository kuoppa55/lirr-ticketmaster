/**
 * LED Platform Display theme preview page.
 *
 * Pixel font (PressStart2P), amber/orange on pure black, text glow.
 * Animations: subtle flicker on all text, scrolling marquee for secondary text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { THEMES, THEME_IDS } from '../../theme/definitions';
import LEDText from './LEDText';
import PreviewCompassMock from './PreviewCompassMock';
import PreviewButtonMock from './PreviewButtonMock';
import PreviewStatusDots from './PreviewStatusDots';

const theme = THEMES[THEME_IDS.LED_DISPLAY];
const { colors, typography, effects } = theme;

/**
 * LEDDisplayPreview component.
 *
 * Args:
 *     isActive: Whether this page is currently visible.
 *     isSelected: Whether this theme is currently the saved selection.
 *     onSelect: Callback when "Select This Theme" is pressed.
 */
export default function LEDDisplayPreview({ isActive, isSelected, onSelect }) {
    return (
        <View style={styles.container}>
            {/* Theme name */}
            <LEDText
                text="LED DISPLAY"
                style={styles.themeName}
                flicker={isActive}
                glowColor={colors.accent}
            />

            {/* Title */}
            <View style={styles.titleSection}>
                <LEDText
                    text="LIRR"
                    style={styles.titleLarge}
                    flicker={isActive}
                    glowColor={colors.accent}
                />
                <LEDText
                    text="REMINDER"
                    style={styles.titleSmall}
                    flicker={isActive}
                    glowColor={colors.accent}
                />
            </View>

            {/* Status */}
            <LEDText
                text="MONITORING ACTIVE"
                style={styles.statusText}
                flicker={isActive}
                glowColor={colors.accent}
            />

            {/* Compass */}
            <View style={styles.compassWrapper}>
                <PreviewCompassMock colors={colors} />
            </View>

            {/* Button */}
            <View style={styles.buttonWrapper}>
                <PreviewButtonMock colors={colors} typography={typography} />
            </View>

            {/* Scrolling marquee */}
            <View style={styles.marqueeWrapper}>
                <LEDText
                    text="  APPROACHING JAMAICA  ---  NEXT STOP: JAMAICA  ---  ACTIVATE YOUR TICKET  "
                    style={styles.marqueeText}
                    scroll={true}
                    flicker={isActive}
                    glowColor={colors.accent}
                    containerWidth={280}
                />
            </View>

            {/* Status dots */}
            <View style={styles.dotsWrapper}>
                <PreviewStatusDots colors={colors} />
            </View>

            {/* Select button */}
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    isSelected && styles.selectButtonSelected,
                ]}
                onPress={onSelect}
            >
                <LEDText
                    text={isSelected ? 'SELECTED' : 'SELECT THEME'}
                    style={[
                        styles.selectButtonText,
                        isSelected && styles.selectButtonTextSelected,
                    ]}
                    flicker={false}
                    glowColor={colors.accent}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 24,
    },
    themeName: {
        fontFamily: typography.fontFamily,
        fontSize: typography.smallSize,
        color: colors.muted,
        letterSpacing: typography.letterSpacing,
        marginBottom: 16,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    titleLarge: {
        fontFamily: typography.fontFamily,
        fontSize: typography.titleSize,
        color: colors.primary,
        letterSpacing: typography.letterSpacing,
        marginBottom: 6,
    },
    titleSmall: {
        fontFamily: typography.fontFamily,
        fontSize: typography.headingSize,
        color: colors.primary,
        letterSpacing: typography.letterSpacing,
    },
    statusText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.bodySize,
        color: colors.accent,
        letterSpacing: typography.letterSpacing,
        marginBottom: 16,
    },
    compassWrapper: {
        marginBottom: 16,
    },
    buttonWrapper: {
        marginBottom: 16,
    },
    marqueeWrapper: {
        width: 280,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.muted,
        paddingVertical: 6,
        marginBottom: 14,
    },
    marqueeText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.bodySize,
        color: colors.primary,
    },
    dotsWrapper: {
        marginBottom: 16,
    },
    selectButton: {
        borderWidth: 1,
        borderColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 'auto',
        marginBottom: 40,
    },
    selectButtonSelected: {
        backgroundColor: colors.accent,
    },
    selectButtonText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.bodySize,
        color: colors.primary,
        letterSpacing: typography.letterSpacing,
    },
    selectButtonTextSelected: {
        color: colors.background,
    },
});
