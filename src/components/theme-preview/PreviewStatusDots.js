/**
 * Static status indicator dots for theme previews.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ITEMS = [
    { label: 'Location', active: true },
    { label: 'Background', active: true },
    { label: 'Geofencing', active: true },
];

/**
 * PreviewStatusDots component.
 *
 * Args:
 *     colors: Theme colors object.
 */
export default function PreviewStatusDots({ colors }) {
    return (
        <View style={styles.container}>
            {ITEMS.map((item) => (
                <View key={item.label} style={styles.item}>
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: item.active
                                    ? colors.dotActive
                                    : colors.dotInactive,
                            },
                        ]}
                    />
                    <Text style={[styles.label, { color: colors.muted }]}>
                        {item.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    label: {
        fontSize: 11,
    },
});
