/**
 * Horizontal toggle switch for monitoring state.
 *
 * Displays OFF — track — ON with a sliding thumb. Orange glow when active,
 * dark when inactive. Labels use LEDText with flicker on the active side.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import LEDText from './LEDText';

const TRACK_WIDTH = 120;
const TRACK_HEIGHT = 48;
const THUMB_SIZE = 40;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 8; // 8px total padding

/**
 * MonitoringButton component (toggle switch).
 *
 * Args:
 *     isActive: Whether monitoring is currently active.
 *     onToggle: Callback fired when the switch is pressed.
 *     disabled: If true, switch is not pressable.
 */
export default function MonitoringButton({
    isActive,
    onToggle,
    disabled = false,
}) {
    const thumbAnim = useRef(
        new Animated.Value(isActive ? THUMB_TRAVEL : 0),
    ).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const lastToggle = useRef(0);

    useEffect(() => {
        Animated.spring(thumbAnim, {
            toValue: isActive ? THUMB_TRAVEL : 0,
            speed: 50,
            bounciness: 4,
            useNativeDriver: true,
        }).start();
    }, [isActive, thumbAnim]);

    const handlePress = useCallback(() => {
        const now = Date.now();
        if (now - lastToggle.current < 600) {
            return;
        }
        lastToggle.current = now;

        // Brief scale pulse for tactile feedback
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.96,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                speed: 50,
                bounciness: 4,
                useNativeDriver: true,
            }),
        ]).start();

        onToggle();
    }, [onToggle, scaleAnim]);

    return (
        <Animated.View
            style={[
                styles.wrapper,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                style={styles.row}
            >
                {/* OFF label */}
                <LEDText
                    text="OFF"
                    style={[
                        styles.label,
                        !isActive ? styles.labelBright : styles.labelDim,
                    ]}
                    flicker={!isActive}
                    glowColor={!isActive ? COLORS.primary : COLORS.dimmed}
                />

                {/* Track */}
                <View
                    style={[
                        styles.track,
                        isActive ? styles.trackActive : styles.trackInactive,
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.thumb,
                            isActive
                                ? styles.thumbActive
                                : styles.thumbInactive,
                            {
                                transform: [{ translateX: thumbAnim }],
                            },
                        ]}
                    />
                </View>

                {/* ON label */}
                <LEDText
                    text="ON"
                    style={[
                        styles.label,
                        isActive ? styles.labelBright : styles.labelDim,
                    ]}
                    flicker={isActive}
                    glowColor={isActive ? COLORS.primary : COLORS.dimmed}
                />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.pixel,
        letterSpacing: 2,
    },
    labelBright: {
        color: COLORS.primary,
    },
    labelDim: {
        color: COLORS.dimmed,
    },
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    trackActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    trackInactive: {
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: 2,
        borderColor: COLORS.dimmed,
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
    },
    thumbActive: {
        backgroundColor: COLORS.background,
    },
    thumbInactive: {
        backgroundColor: COLORS.muted,
    },
});
