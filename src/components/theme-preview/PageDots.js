/**
 * Page indicator dots for the theme preview swiper.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * PageDots component.
 *
 * Args:
 *     count: Total number of pages.
 *     activeIndex: Zero-based index of the current page.
 */
export default function PageDots({ count, activeIndex }) {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }, (_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === activeIndex
                            ? styles.dotActive
                            : styles.dotInactive,
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
    },
    dotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});
