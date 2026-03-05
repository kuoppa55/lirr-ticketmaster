/**
 * Animated LED-style text component with flicker and scroll effects.
 *
 * Provides a subtle opacity flicker animation and an optional horizontal
 * marquee scroll. Text renders in the pixel font with a configurable glow.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
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
    const measuredWidthRef = useRef(0);
    const scrollLoopRef = useRef(null);

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

    const stopScrollLoop = useCallback(() => {
        if (scrollLoopRef.current) {
            scrollLoopRef.current.stop();
            scrollLoopRef.current = null;
        }
    }, []);

    const startScrollLoop = useCallback((width) => {
        if (width <= 0) {
            return;
        }

        stopScrollLoop();
        scrollAnim.setValue(containerWidth);

        const pixelsPerSecond = 50;
        const totalDistance = containerWidth + width;
        const duration = Math.max(
            1000,
            (totalDistance / pixelsPerSecond) * 1000
        );

        const loop = Animated.loop(
            Animated.timing(scrollAnim, {
                toValue: -width,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        scrollLoopRef.current = loop;
        loop.start();
    }, [containerWidth, scrollAnim, stopScrollLoop]);

    // Keep marquee loop resilient across text updates and layout jitter.
    useEffect(() => {
        if (!scroll) {
            stopScrollLoop();
            return;
        }

        const width = measuredWidthRef.current || textWidth;
        if (width > 0) {
            startScrollLoop(width);
        }

        return stopScrollLoop;
    }, [scroll, text, textWidth, containerWidth, startScrollLoop, stopScrollLoop]);

    const handleTextLayout = (e) => {
        const width = Math.round(e.nativeEvent.layout.width);
        if (width > 0 && width !== measuredWidthRef.current) {
            measuredWidthRef.current = width;
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
