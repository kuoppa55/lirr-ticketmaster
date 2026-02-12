/**
 * Simplified static radar visual for theme previews.
 *
 * Renders a circular radar with range rings, crosshairs, a center dot,
 * an "N" indicator, and mock station dots — all styled to the given theme.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SIZE = 200;
const CENTER = SIZE / 2;
const MAX_R = CENTER - 24;

const MOCK_STATIONS = [
    { angle: -30, dist: 0.3, label: 'Jamaica' },
    { angle: 45, dist: 0.55, label: 'Mineola' },
    { angle: 160, dist: 0.75, label: 'Hicksville' },
    { angle: -120, dist: 0.45, label: 'Woodside' },
    { angle: 80, dist: 0.9, label: 'Babylon' },
];

/**
 * Get station dot color based on distance ratio.
 */
function getDotColor(ratio, colors) {
    if (ratio < 0.4) return colors.radarStationNear;
    if (ratio < 0.7) return colors.radarStationMid;
    return colors.radarStationFar;
}

/**
 * PreviewCompassMock component.
 *
 * Args:
 *     colors: Theme colors object.
 */
export default function PreviewCompassMock({ colors }) {
    // "N" position (static, pointing up-right)
    const nAngleRad = (-20 * Math.PI) / 180;
    const nRadius = CENTER - 12;
    const nX = CENTER + nRadius * Math.sin(nAngleRad);
    const nY = CENTER - nRadius * Math.cos(nAngleRad);

    return (
        <View style={[styles.container, { width: SIZE, height: SIZE }]}>
            {/* Background circle */}
            <View
                style={[
                    styles.background,
                    {
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE / 2,
                        backgroundColor: colors.radarBg,
                    },
                ]}
            />

            {/* Range rings */}
            {[0.33, 0.66, 1.0].map((fraction) => {
                const ringSize = MAX_R * 2 * fraction;
                return (
                    <View
                        key={fraction}
                        style={[
                            styles.ring,
                            {
                                width: ringSize,
                                height: ringSize,
                                borderRadius: ringSize / 2,
                                left: CENTER - ringSize / 2,
                                top: CENTER - ringSize / 2,
                                borderColor: colors.radarRing,
                            },
                        ]}
                    />
                );
            })}

            {/* Crosshairs */}
            <View
                style={[
                    styles.crosshairH,
                    {
                        width: MAX_R * 2,
                        left: CENTER - MAX_R,
                        top: CENTER - 0.5,
                        backgroundColor: colors.radarCrosshair,
                    },
                ]}
            />
            <View
                style={[
                    styles.crosshairV,
                    {
                        height: MAX_R * 2,
                        left: CENTER - 0.5,
                        top: CENTER - MAX_R,
                        backgroundColor: colors.radarCrosshair,
                    },
                ]}
            />

            {/* Center dot */}
            <View
                style={[
                    styles.centerDot,
                    {
                        left: CENTER - 4,
                        top: CENTER - 4,
                        backgroundColor: colors.radarCenter,
                    },
                ]}
            />

            {/* N indicator */}
            <View style={[styles.northContainer, { left: nX - 10, top: nY - 10 }]}>
                <Text style={[styles.northText, { color: colors.radarNorth }]}>
                    N
                </Text>
            </View>

            {/* Mock station dots */}
            {MOCK_STATIONS.map((station) => {
                const angleRad = (station.angle * Math.PI) / 180;
                const r = MAX_R * 0.85 * station.dist;
                const x = CENTER + r * Math.sin(angleRad);
                const y = CENTER - r * Math.cos(angleRad);
                const dotColor = getDotColor(station.dist, colors);

                return (
                    <View
                        key={station.label}
                        style={[styles.stationDot, {
                            left: x - 4,
                            top: y - 4,
                            backgroundColor: dotColor,
                        }]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    background: {
        position: 'absolute',
    },
    ring: {
        position: 'absolute',
        borderWidth: 1,
    },
    crosshairH: {
        position: 'absolute',
        height: 1,
    },
    crosshairV: {
        position: 'absolute',
        width: 1,
    },
    centerDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    northContainer: {
        position: 'absolute',
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    northText: {
        fontSize: 11,
        fontWeight: '700',
    },
    stationDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
