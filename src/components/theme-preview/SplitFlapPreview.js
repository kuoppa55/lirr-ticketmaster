/**
 * Split-Flap (Solari Board) theme preview page.
 *
 * Individual character cells with horizontal split line, cream text on dark
 * gray. Animation: characters flip mechanically in sequence when the page
 * becomes active.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { THEMES, THEME_IDS } from '../../theme/definitions';
import SplitFlapText from './SplitFlapText';
import PreviewCompassMock from './PreviewCompassMock';
import PreviewButtonMock from './PreviewButtonMock';
import PreviewStatusDots from './PreviewStatusDots';

const theme = THEMES[THEME_IDS.SPLIT_FLAP];
const { colors, typography, effects } = theme;

/**
 * SplitFlapPreview component.
 *
 * Args:
 *     isActive: Whether this page is currently visible (triggers flip anim).
 *     isSelected: Whether this theme is currently the saved selection.
 *     onSelect: Callback when "Select This Theme" is pressed.
 */
export default function SplitFlapPreview({ isActive, isSelected, onSelect }) {
    // Re-key animations when page becomes active
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        if (isActive) {
            setAnimKey((k) => k + 1);
        }
    }, [isActive]);

    const flapColors = {
        cellBackground: effects.cellBackground,
        cellBorder: effects.cellBorder,
        splitLineColor: effects.splitLineColor,
        primary: colors.primary,
    };

    return (
        <View style={styles.container}>
            {/* Theme name */}
            <Text style={styles.themeName}>SPLIT-FLAP</Text>

            {/* Title */}
            <View key={`title-${animKey}`} style={styles.titleSection}>
                <SplitFlapText
                    text="LIRR REMINDER"
                    colors={flapColors}
                    animate={isActive}
                />
            </View>

            {/* Status */}
            <View key={`status-${animKey}`} style={styles.statusSection}>
                <SplitFlapText
                    text="MONITORING"
                    colors={flapColors}
                    animate={isActive}
                />
            </View>

            {/* Compass */}
            <View style={styles.compassWrapper}>
                <PreviewCompassMock colors={colors} />
            </View>

            {/* Button */}
            <View style={styles.buttonWrapper}>
                <PreviewButtonMock colors={colors} typography={typography} />
            </View>

            {/* Secondary text */}
            <View key={`secondary-${animKey}`} style={styles.secondarySection}>
                <SplitFlapText
                    text="JAMAICA"
                    colors={flapColors}
                    animate={isActive}
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
                <Text
                    style={[
                        styles.selectButtonText,
                        isSelected && styles.selectButtonTextSelected,
                    ]}
                >
                    {isSelected ? 'SELECTED' : 'SELECT THIS THEME'}
                </Text>
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
        fontSize: typography.smallSize,
        color: colors.muted,
        letterSpacing: typography.letterSpacing,
        fontFamily: 'monospace',
        marginBottom: 16,
    },
    titleSection: {
        marginBottom: 12,
        paddingVertical: 8,
    },
    statusSection: {
        marginBottom: 16,
        paddingVertical: 4,
    },
    compassWrapper: {
        marginBottom: 16,
    },
    buttonWrapper: {
        marginBottom: 16,
    },
    secondarySection: {
        marginBottom: 14,
        paddingVertical: 6,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
    },
    dotsWrapper: {
        marginBottom: 16,
    },
    selectButton: {
        borderWidth: 1,
        borderColor: colors.accent,
        borderRadius: 4,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 'auto',
        marginBottom: 40,
    },
    selectButtonSelected: {
        backgroundColor: colors.accent,
    },
    selectButtonText: {
        fontSize: typography.bodySize,
        color: colors.primary,
        letterSpacing: typography.letterSpacing,
        fontFamily: 'monospace',
        fontWeight: '700',
        textAlign: 'center',
    },
    selectButtonTextSelected: {
        color: colors.background,
    },
});
