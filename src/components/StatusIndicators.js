/**
 * Subtle permission and status indicator dots.
 *
 * Displays a horizontal row of small status items showing whether location
 * permissions are granted and geofencing is active. Intended for the bottom
 * of the home screen.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

/**
 * StatusIndicators component.
 *
 * Args:
 *     permissions: Object with foreground and background boolean fields.
 *     isGeofencing: Whether geofencing is currently active.
 */
export default function StatusIndicators({ permissions, isGeofencing }) {
    const items = [
        { label: 'Location', active: permissions.foreground },
        { label: 'Background', active: permissions.background },
        { label: 'Geofencing', active: isGeofencing },
    ];

    return (
        <View style={styles.container}>
            {items.map((item) => (
                <View key={item.label} style={styles.item}>
                    <View
                        style={[
                            styles.dot,
                            item.active ? styles.dotActive : styles.dotInactive,
                        ]}
                    />
                    <Text style={styles.label}>{item.label}</Text>
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
        gap: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: COLORS.primary,
    },
    dotInactive: {
        backgroundColor: COLORS.dimmed,
    },
    label: {
        fontSize: 12,
        color: COLORS.muted,
    },
});
