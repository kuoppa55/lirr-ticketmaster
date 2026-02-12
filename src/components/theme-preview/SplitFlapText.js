/**
 * Split-flap (Solari board) animated text component.
 *
 * Each character is rendered in its own cell with a horizontal split line.
 * Characters flip in sequence with staggered rotateX animations, simulating
 * a mechanical departure board.
 *
 * Uses useNativeDriver: false because rotateX transform interpolation
 * requires non-native animation on Android.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

const CELL_WIDTH = 22;
const CELL_HEIGHT = 32;
const STAGGER_DELAY = 60;
const FLIP_DURATION = 300;

/**
 * Single character cell with flip animation.
 *
 * Args:
 *     char: The character to display.
 *     delay: Animation start delay in ms.
 *     colors: Theme colors for cell styling.
 *     animate: Whether to trigger the flip animation.
 */
function FlapCell({ char, delay, colors, animate }) {
    const flipAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!animate) {
            flipAnim.setValue(1);
            return;
        }

        flipAnim.setValue(0);
        const timeout = setTimeout(() => {
            Animated.timing(flipAnim, {
                toValue: 1,
                duration: FLIP_DURATION,
                useNativeDriver: false,
            }).start();
        }, delay);

        return () => clearTimeout(timeout);
    }, [animate, delay, flipAnim]);

    // Top half: rotates from 0 to -90deg (first half of animation)
    const topRotate = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '-90deg', '-90deg'],
    });

    // Bottom half: rotates from 90deg to 0 (second half of animation)
    const bottomRotate = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['90deg', '90deg', '0deg'],
    });

    // Revealed character opacity (shows after flip completes)
    const revealOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    // Flipping character opacity (hides after first half)
    const hideOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });

    const cellBg = colors.cellBackground || '#333333';
    const borderColor = colors.cellBorder || '#444444';
    const textColor = colors.primary || '#F5F0E1';
    const splitColor = colors.splitLineColor || 'rgba(0, 0, 0, 0.4)';

    return (
        <View
            style={[
                styles.cell,
                {
                    backgroundColor: cellBg,
                    borderColor: borderColor,
                },
            ]}
        >
            {/* Static final character (always rendered behind) */}
            <View style={styles.charLayer}>
                <Text style={[styles.charText, { color: textColor }]}>
                    {char}
                </Text>
            </View>

            {/* Top flap (flips away) */}
            <Animated.View
                style={[
                    styles.halfTop,
                    {
                        backgroundColor: cellBg,
                        transform: [
                            { perspective: 400 },
                            { rotateX: topRotate },
                        ],
                        opacity: hideOpacity,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.charText,
                        styles.topText,
                        { color: textColor },
                    ]}
                >
                    {char}
                </Text>
            </Animated.View>

            {/* Bottom flap (flips in) */}
            <Animated.View
                style={[
                    styles.halfBottom,
                    {
                        backgroundColor: cellBg,
                        transform: [
                            { perspective: 400 },
                            { rotateX: bottomRotate },
                        ],
                        opacity: revealOpacity,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.charText,
                        styles.bottomText,
                        { color: textColor },
                    ]}
                >
                    {char}
                </Text>
            </Animated.View>

            {/* Split line */}
            <View
                style={[
                    styles.splitLine,
                    { backgroundColor: splitColor },
                ]}
            />
        </View>
    );
}

/**
 * SplitFlapText component.
 *
 * Args:
 *     text: The string to display (keep under ~15 chars per line).
 *     colors: Theme effects/colors object containing cell styling.
 *     animate: If true, triggers the staggered flip animation.
 */
export default function SplitFlapText({ text, colors, animate = true }) {
    const chars = text.split('');

    return (
        <View style={styles.container}>
            {chars.map((char, index) => (
                <FlapCell
                    key={`${index}-${char}`}
                    char={char}
                    delay={index * STAGGER_DELAY}
                    colors={colors}
                    animate={animate}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 3,
    },
    cell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderRadius: 3,
        borderWidth: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    charLayer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    charText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    halfTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: CELL_HEIGHT / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-end',
        transformOrigin: 'bottom',
    },
    halfBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: CELL_HEIGHT / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        transformOrigin: 'top',
    },
    topText: {
        marginBottom: -(CELL_HEIGHT / 4),
    },
    bottomText: {
        marginTop: -(CELL_HEIGHT / 4),
    },
    splitLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        top: CELL_HEIGHT / 2 - 0.5,
    },
});
