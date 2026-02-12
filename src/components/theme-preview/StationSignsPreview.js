/**
 * Station Signs theme preview page.
 *
 * Bold chunky Oswald font, high-contrast white-on-black, thick bordered
 * sections. Staggered fade-in entrance animation when the page becomes active.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { THEMES, THEME_IDS } from '../../theme/definitions';
import PreviewCompassMock from './PreviewCompassMock';
import PreviewButtonMock from './PreviewButtonMock';
import PreviewStatusDots from './PreviewStatusDots';

const theme = THEMES[THEME_IDS.STATION_SIGNS];
const { colors, typography, effects } = theme;

/**
 * StationSignsPreview component.
 *
 * Args:
 *     isActive: Whether this page is currently visible (triggers entrance).
 *     isSelected: Whether this theme is currently the saved selection.
 *     onSelect: Callback when "Select This Theme" is pressed.
 */
export default function StationSignsPreview({ isActive, isSelected, onSelect }) {
    const fadeAnims = useRef(
        Array.from({ length: 7 }, () => new Animated.Value(0))
    ).current;
    const slideAnims = useRef(
        Array.from({ length: 7 }, () => new Animated.Value(20))
    ).current;

    useEffect(() => {
        if (isActive) {
            // Reset
            fadeAnims.forEach((a) => a.setValue(0));
            slideAnims.forEach((a) => a.setValue(20));

            // Staggered entrance
            const animations = fadeAnims.map((fade, i) =>
                Animated.parallel([
                    Animated.timing(fade, {
                        toValue: 1,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnims[i], {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ])
            );

            Animated.stagger(80, animations).start();
        }
    }, [isActive, fadeAnims, slideAnims]);

    const animStyle = (index) => ({
        opacity: fadeAnims[index],
        transform: [{ translateY: slideAnims[index] }],
    });

    return (
        <View style={styles.container}>
            {/* Theme name */}
            <Animated.View style={animStyle(0)}>
                <Text style={styles.themeName}>STATION SIGNS</Text>
            </Animated.View>

            {/* Title */}
            <Animated.View style={[styles.titleSection, animStyle(1)]}>
                <Text style={styles.title}>LIRR REMINDER</Text>
            </Animated.View>

            {/* Status */}
            <Animated.View style={[styles.statusSection, animStyle(2)]}>
                <Text style={styles.statusText}>MONITORING ACTIVE</Text>
            </Animated.View>

            {/* Compass */}
            <Animated.View style={[styles.compassWrapper, animStyle(3)]}>
                <PreviewCompassMock colors={colors} />
            </Animated.View>

            {/* Button */}
            <Animated.View style={[styles.buttonWrapper, animStyle(4)]}>
                <PreviewButtonMock colors={colors} typography={typography} />
            </Animated.View>

            {/* Secondary text */}
            <Animated.View style={[styles.secondarySection, animStyle(5)]}>
                <Text style={styles.secondaryText}>APPROACHING JAMAICA</Text>
            </Animated.View>

            {/* Status dots */}
            <Animated.View style={[styles.dotsWrapper, animStyle(6)]}>
                <PreviewStatusDots colors={colors} />
            </Animated.View>

            {/* Select button */}
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    isSelected && styles.selectButtonSelected,
                ]}
                onPress={onSelect}
            >
                <Text style={styles.selectButtonText}>
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
        fontFamily: typography.fontFamily,
        fontSize: typography.smallSize,
        color: colors.muted,
        letterSpacing: typography.letterSpacing,
        marginBottom: 12,
    },
    titleSection: {
        borderWidth: effects.borderWidth,
        borderColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    title: {
        fontFamily: typography.fontFamily,
        fontSize: typography.titleSize,
        color: colors.primary,
        letterSpacing: typography.letterSpacing,
        textAlign: 'center',
    },
    statusSection: {
        borderWidth: 2,
        borderColor: colors.accent,
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statusText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.headingSize,
        color: colors.accent,
        letterSpacing: typography.letterSpacing,
        textAlign: 'center',
    },
    compassWrapper: {
        marginBottom: 16,
    },
    buttonWrapper: {
        marginBottom: 16,
    },
    secondarySection: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: colors.secondary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    secondaryText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.bodySize,
        color: colors.secondary,
        letterSpacing: typography.letterSpacing,
        textAlign: 'center',
    },
    dotsWrapper: {
        marginBottom: 16,
    },
    selectButton: {
        borderWidth: 2,
        borderColor: colors.accent,
        paddingVertical: 14,
        paddingHorizontal: 32,
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
        textAlign: 'center',
    },
});
