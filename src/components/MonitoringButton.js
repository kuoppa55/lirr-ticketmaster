/**
 * Large circular toggle button for monitoring state.
 *
 * Displays a ~180px circle that glows orange when active and goes dark when
 * paused. Includes press-in/press-out scale animation using the native driver.
 */

import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

const BUTTON_SIZE = 180;

/**
 * MonitoringButton component.
 *
 * Args:
 *     isActive: Whether monitoring is currently active.
 *     onToggle: Callback fired when the button is pressed.
 *     disabled: If true, button is not pressable.
 */
export default function MonitoringButton({
    isActive,
    onToggle,
    disabled = false,
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const lastToggle = useRef(0);

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(() => {
        // Throttle: ignore taps within 600ms of each other
        const now = Date.now();
        if (now - lastToggle.current < 600) {
            return;
        }
        lastToggle.current = now;
        onToggle();
    }, [onToggle]);

    return (
        <Animated.View
            style={[
                styles.wrapper,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[
                    styles.button,
                    isActive ? styles.buttonActive : styles.buttonInactive,
                ]}
            >
                <View style={styles.innerContent}>
                    <Text
                        style={[
                            styles.powerIcon,
                            isActive
                                ? styles.iconActive
                                : styles.iconInactive,
                        ]}
                    >
                        {'\u23FB'}
                    </Text>
                    <Text
                        style={[
                            styles.label,
                            isActive
                                ? styles.labelActive
                                : styles.labelInactive,
                        ]}
                    >
                        {isActive ? 'ON' : 'OFF'}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    buttonInactive: {
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: 2,
        borderColor: COLORS.dimmed,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    innerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    powerIcon: {
        fontSize: 48,
        marginBottom: 4,
    },
    iconActive: {
        color: COLORS.background,
    },
    iconInactive: {
        color: COLORS.muted,
    },
    label: {
        fontSize: 12,
        fontFamily: FONTS.pixel,
        letterSpacing: 2,
    },
    labelActive: {
        color: COLORS.background,
    },
    labelInactive: {
        color: COLORS.muted,
    },
});
