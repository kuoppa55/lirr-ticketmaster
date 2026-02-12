/**
 * Animated LED text component with flicker and horizontal scroll effects.
 *
 * Flicker: Animated.loop oscillating opacity between 0.85-1.0 on ~2.5s cycle.
 * Scroll: Animated.loop translating text from right to left across container.
 * Both use useNativeDriver: true.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';

/**
 * LEDText component.
 *
 * Args:
 *     text: The string to display.
 *     style: Additional text styles.
 *     scroll: If true, enables horizontal scrolling marquee.
 *     flicker: If true, enables subtle opacity flicker.
 *     glowColor: Color for the text glow shadow.
 *     containerWidth: Width of the scroll container (required if scroll=true).
 */
export default function LEDText({
    text,
    style,
    scroll = false,
    flicker = true,
    glowColor = '#FF8C00',
    containerWidth = 300,
}) {
    const flickerAnim = useRef(new Animated.Value(1)).current;
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const [textWidth, setTextWidth] = useState(0);
    const measuredRef = useRef(false);

    // Flicker animation
    useEffect(() => {
        if (!flicker) return;

        const animation = Animated.loop(
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
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [flicker, flickerAnim]);

    // Scroll animation - starts after text is measured
    useEffect(() => {
        if (!scroll || textWidth === 0) return;

        scrollAnim.setValue(containerWidth);

        const animation = Animated.loop(
            Animated.timing(scrollAnim, {
                toValue: -textWidth,
                duration: Math.max(4000, (containerWidth + textWidth) * 12),
                useNativeDriver: true,
            })
        );
        animation.start();

        return () => animation.stop();
    }, [scroll, textWidth, containerWidth, scrollAnim]);

    const glowStyle = {
        textShadowColor: glowColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    };

    // Scrolling marquee mode
    if (scroll) {
        return (
            <View
                style={[
                    styles.scrollContainer,
                    { width: containerWidth },
                ]}
            >
                <Animated.Text
                    style={[
                        style,
                        glowStyle,
                        {
                            opacity: flicker ? flickerAnim : 1,
                            transform: [{ translateX: scrollAnim }],
                        },
                    ]}
                    numberOfLines={1}
                    onLayout={(e) => {
                        if (!measuredRef.current) {
                            setTextWidth(e.nativeEvent.layout.width);
                            measuredRef.current = true;
                        }
                    }}
                >
                    {text}
                </Animated.Text>
            </View>
        );
    }

    // Static (non-scrolling) mode with flicker
    return (
        <Animated.Text
            style={[
                style,
                glowStyle,
                { opacity: flicker ? flickerAnim : 1 },
            ]}
        >
            {text}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        overflow: 'hidden',
        height: 24,
        justifyContent: 'center',
    },
});
