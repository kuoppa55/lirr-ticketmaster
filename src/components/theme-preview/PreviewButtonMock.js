/**
 * Static monitoring button mockup for theme previews.
 *
 * Renders a circle styled to the theme's active button colors with
 * a power icon and "ON" label.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BUTTON_SIZE = 120;

/**
 * PreviewButtonMock component.
 *
 * Args:
 *     colors: Theme colors object.
 *     typography: Theme typography object.
 */
export default function PreviewButtonMock({ colors, typography }) {
    return (
        <View
            style={[
                styles.button,
                {
                    backgroundColor: colors.buttonActive,
                    shadowColor: colors.buttonActive,
                },
            ]}
        >
            <Text
                style={[
                    styles.powerIcon,
                    { color: colors.background },
                ]}
            >
                {'\u25C9'}
            </Text>
            <Text
                style={[
                    styles.label,
                    {
                        color: colors.background,
                        fontFamily: typography.fontFamily || undefined,
                        fontSize: Math.min(typography.bodySize, 14),
                    },
                ]}
            >
                ON
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    powerIcon: {
        fontSize: 32,
        marginBottom: 2,
    },
    label: {
        fontWeight: '700',
        letterSpacing: 2,
    },
});
