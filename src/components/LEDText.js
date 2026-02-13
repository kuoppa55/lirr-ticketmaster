/**
 * Animated LED-style text component with flicker and scroll effects.
 *
 * Provides a subtle opacity flicker animation and an optional horizontal
 * marquee scroll. Text renders in the pixel font with a configurable glow.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

/**
 * LEDText component.
 *
 * Args:
 *     text: The string to display.
 *     style: Additional text style overrides.
 *     scroll: If true, animate as a horizontal marquee.
 *     flicker: If true, apply a subtle opacity flicker loop.
 *     glowColor: Color for the text shadow glow.
 *     containerWidth: Width of the visible marquee container (scroll mode).
 */
export default function LEDText({
    text,
    style,
    scroll = false,
    flicker = true,
    glowColor = COLORS.primary,
    containerWidth = 300,
}) {
    const flickerAnim = useRef(new Animated.Value(1)).current;
    const scrollAnim = useRef(new Animated.Value(containerWidth)).current;
    const [textWidth, setTextWidth] = useState(0);
    const measuredRef = useRef(false);

    // Flicker animation: subtle 4-step opacity loop (~3.5s cycle)
    useEffect(() => {
        if (!flicker) {
            flickerAnim.setValue(1);
            return;
        }

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(flickerAnim, {
                    toValue: 0.85,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(flickerAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(flickerAnim, {
                    toValue: 0.92,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(flickerAnim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
        );

        loop.start();
        return () => loop.stop();
    }, [flicker, flickerAnim]);

    // Reset text measurement when text changes (live station data)
    useEffect(() => {
        if (scroll) {
            measuredRef.current = false;
            setTextWidth(0);
            scrollAnim.setValue(containerWidth);
        }
    }, [text, scroll, scrollAnim, containerWidth]);

    // Scroll animation: horizontal marquee
    useEffect(() => {
        if (!scroll || textWidth === 0) return;

        const duration = Math.max(4000, (containerWidth + textWidth) * 12);

        const loop = Animated.loop(
            Animated.timing(scrollAnim, {
                toValue: -textWidth,
                duration,
                useNativeDriver: true,
            }),
        );

        loop.start();
        return () => loop.stop();
    }, [scroll, textWidth, containerWidth, scrollAnim]);

    const handleTextLayout = (e) => {
        if (!measuredRef.current) {
            measuredRef.current = true;
            setTextWidth(e.nativeEvent.layout.width);
        }
    };

    const glowStyle = {
        textShadowColor: glowColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    };

    const textElement = (
        <Animated.Text
            style={[
                styles.text,
                glowStyle,
                style,
                { opacity: flickerAnim },
            ]}
            onLayout={scroll ? handleTextLayout : undefined}
        >
            {text}
        </Animated.Text>
    );

    if (scroll) {
        return (
            <View style={[styles.scrollContainer, { width: containerWidth }]}>
                <Animated.View
                    style={[
                        styles.scrollInner,
                        { transform: [{ translateX: scrollAnim }] },
                    ]}
                >
                    {textElement}
                </Animated.View>
            </View>
        );
    }

    return textElement;
}

const styles = StyleSheet.create({
    text: {
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
    },
    scrollContainer: {
        overflow: 'hidden',
        height: 24,
        justifyContent: 'center',
    },
    scrollInner: {
        flexDirection: 'row',
        width: 99999,
    },
});
