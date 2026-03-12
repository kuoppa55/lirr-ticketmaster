/**
 * Animated LED-style text component with flicker and scroll effects.
 *
 * Provides a subtle opacity flicker animation and an optional horizontal
 * marquee scroll. Text renders in the pixel font with a configurable glow.
 */

import React, { useEffect, useRef, useCallback } from 'react';
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
 *     onScrollCycleStart: Optional callback fired when a marquee pass starts.
 *     onDebugLifecycleEvent: Optional callback for marquee lifecycle debug events.
 *     resetToken: Increment to force marquee restart from the initial position.
 */
export default function LEDText({
    text,
    style,
    scroll = false,
    flicker = true,
    glowColor = COLORS.primary,
    containerWidth = 300,
    onScrollCycleStart,
    onDebugLifecycleEvent,
    resetToken = 0,
}) {
    const flickerAnim = useRef(new Animated.Value(1)).current;
    const scrollAnim = useRef(new Animated.Value(containerWidth)).current;
    const measuredWidthRef = useRef(0);
    const scrollLoopRef = useRef(null);
    const scrollCycleStartRef = useRef(onScrollCycleStart);
    const debugLifecycleRef = useRef(onDebugLifecycleEvent);

    useEffect(() => {
        scrollCycleStartRef.current = onScrollCycleStart;
    }, [onScrollCycleStart]);

    useEffect(() => {
        debugLifecycleRef.current = onDebugLifecycleEvent;
    }, [onDebugLifecycleEvent]);

    useEffect(() => {
        debugLifecycleRef.current?.('mounted');
        return () => {
            debugLifecycleRef.current?.('unmounted');
        };
    }, []);

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
            scrollLoopRef.current.stopped = true;
            scrollLoopRef.current.animation?.stop();
            scrollLoopRef.current = null;
        }
    }, []);

    const startScrollLoop = useCallback(() => {
        const initialWidth = measuredWidthRef.current;
        if (initialWidth <= 0) {
            return;
        }

        stopScrollLoop();

        const loopState = { stopped: false, animation: null };
        scrollLoopRef.current = loopState;

        const runCycle = () => {
            if (loopState.stopped) {
                return;
            }

            const width = measuredWidthRef.current;
            if (width <= 0) {
                return;
            }

            const pixelsPerSecond = 50;
            const totalDistance = containerWidth + width;
            const duration = Math.max(
                1000,
                (totalDistance / pixelsPerSecond) * 1000
            );

            scrollCycleStartRef.current?.();
            scrollAnim.setValue(containerWidth);

            const animation = Animated.timing(scrollAnim, {
                toValue: -width,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            });

            loopState.animation = animation;
            animation.start(({ finished }) => {
                if (!finished || loopState.stopped) {
                    return;
                }
                runCycle();
            });
        };

        runCycle();
    }, [containerWidth, scrollAnim, stopScrollLoop]);

    // Keep marquee loop resilient across text updates and layout jitter.
    useEffect(() => {
        if (!scroll) {
            stopScrollLoop();
            return;
        }

        debugLifecycleRef.current?.('scroll_effect_run', {
            resetToken,
            containerWidth,
            measuredWidth: measuredWidthRef.current,
        });

        if (measuredWidthRef.current > 0) {
            startScrollLoop();
        }

        return stopScrollLoop;
    }, [
        scroll,
        containerWidth,
        resetToken,
        startScrollLoop,
        stopScrollLoop,
        onDebugLifecycleEvent,
    ]);

    const handleTextLayout = (e) => {
        const width = Math.round(e.nativeEvent.layout.width);
        if (width > 0 && width !== measuredWidthRef.current) {
            measuredWidthRef.current = width;
            if (scroll && !scrollLoopRef.current) {
                startScrollLoop();
            }
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
