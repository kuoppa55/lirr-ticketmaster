/**
 * Compass/radar visual component showing nearby stations.
 *
 * Renders a dark circular radar with range rings, crosshair lines, a center
 * dot (user), a rotating "N" indicator, and station dots positioned by
 * bearing and logarithmic distance scaling.
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistance } from '../utils/units';
import { COLORS, FONTS } from '../theme/colors';
import LEDText from './LEDText';

const RING_COLOR = COLORS.radarRing;
const CROSSHAIR_COLOR = COLORS.radarCrosshair;
const CENTER_DOT_SIZE = 8;

/**
 * Get a color for a station dot based on relative distance.
 *
 * Args:
 *     ratio: Distance ratio (0-1) where 0 is closest, 1 is farthest.
 *
 * Returns:
 *     Color string.
 */
function getDotColor(ratio) {
    if (ratio < 0.33) return COLORS.primary;
    if (ratio < 0.66) return COLORS.secondary;
    return COLORS.muted;
}

/**
 * CompassRadar component.
 *
 * Args:
 *     heading: Device heading in degrees (0-360).
 *     stations: Array of { identifier, name, distance, bearing }.
 *     size: Diameter of the radar circle in pixels.
 *     useMetric: Whether to show distances in metric units.
 */
export default function CompassRadar({
    heading,
    stations,
    size = 250,
    useMetric = false,
}) {
    const center = size / 2;
    const maxR = center - 30; // Leave room for labels at edges

    // Stabilize maxDistance to prevent cosmetic jitter from GPS noise.
    // Only update when the raw value changes by more than 15%.
    const stableMaxDistRef = useRef(1);
    const rawMaxDistance = stations.length > 0
        ? Math.max(...stations.map((s) => s.distance), 1)
        : 1;
    const stableVal = stableMaxDistRef.current;
    if (
        stableVal === 1 ||
        Math.abs(rawMaxDistance - stableVal) / stableVal > 0.15
    ) {
        stableMaxDistRef.current = rawMaxDistance;
    }
    const maxDistance = stableMaxDistRef.current;

    // Position the "N" indicator on the ring
    const nAngleRad = ((360 - heading) * Math.PI) / 180;
    const nRadius = center - 14;
    const nX = center + nRadius * Math.sin(nAngleRad);
    const nY = center - nRadius * Math.cos(nAngleRad);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Background circle */}
            <View
                style={[
                    styles.background,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                ]}
            />

            {/* Range rings at 33%, 66%, 100% */}
            {[0.33, 0.66, 1.0].map((fraction) => {
                const ringSize = maxR * 2 * fraction;
                return (
                    <View
                        key={fraction}
                        style={[
                            styles.ring,
                            {
                                width: ringSize,
                                height: ringSize,
                                borderRadius: ringSize / 2,
                                left: center - ringSize / 2,
                                top: center - ringSize / 2,
                            },
                        ]}
                    />
                );
            })}

            {/* Crosshair lines */}
            <View
                style={[
                    styles.crosshairH,
                    {
                        width: maxR * 2,
                        left: center - maxR,
                        top: center - 0.5,
                    },
                ]}
            />
            <View
                style={[
                    styles.crosshairV,
                    {
                        height: maxR * 2,
                        left: center - 0.5,
                        top: center - maxR,
                    },
                ]}
            />

            {/* Center dot (user) */}
            <View
                style={[
                    styles.centerDot,
                    {
                        left: center - CENTER_DOT_SIZE / 2,
                        top: center - CENTER_DOT_SIZE / 2,
                    },
                ]}
            />

            {/* "N" indicator */}
            <View
                style={[
                    styles.northContainer,
                    {
                        left: nX - 10,
                        top: nY - 10,
                    },
                ]}
            >
                <LEDText text="N" style={styles.northText} flicker={true} />
            </View>

            {/* Station dots and labels */}
            {stations.map((station) => {
                // Relative bearing: rotate so phone direction = up
                const relBearing =
                    ((station.bearing - heading + 360) % 360) *
                    (Math.PI / 180);

                // Logarithmic distance scaling to avoid clustering
                const r =
                    maxR *
                    0.85 *
                    (Math.log(station.distance + 1) /
                        Math.log(maxDistance + 1));

                const x = center + r * Math.sin(relBearing);
                const y = center - r * Math.cos(relBearing);

                const distRatio = station.distance / maxDistance;
                const dotColor = getDotColor(distRatio);

                return (
                    <View
                        key={station.identifier}
                        style={[
                            styles.stationContainer,
                            { left: x - 4, top: y - 4 },
                        ]}
                    >
                        <View
                            style={[
                                styles.stationDot,
                                { backgroundColor: dotColor },
                            ]}
                        />
                        <View style={styles.stationLabel}>
                            <Text
                                style={styles.stationName}
                                numberOfLines={1}
                            >
                                {station.name}
                            </Text>
                            <Text style={styles.stationDistance}>
                                {formatDistance(station.distance, useMetric)}
                            </Text>
                        </View>
                    </View>
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
        backgroundColor: COLORS.radarBg,
    },
    ring: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: RING_COLOR,
    },
    crosshairH: {
        position: 'absolute',
        height: 1,
        backgroundColor: CROSSHAIR_COLOR,
    },
    crosshairV: {
        position: 'absolute',
        width: 1,
        backgroundColor: CROSSHAIR_COLOR,
    },
    centerDot: {
        position: 'absolute',
        width: CENTER_DOT_SIZE,
        height: CENTER_DOT_SIZE,
        borderRadius: CENTER_DOT_SIZE / 2,
        backgroundColor: COLORS.primary,
    },
    northContainer: {
        position: 'absolute',
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    northText: {
        fontSize: 10,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
    },
    stationContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    stationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stationLabel: {
        alignItems: 'center',
        marginTop: 2,
        width: 80,
    },
    stationName: {
        fontSize: 9,
        color: COLORS.secondary,
        textAlign: 'center',
    },
    stationDistance: {
        fontSize: 8,
        color: COLORS.muted,
        textAlign: 'center',
    },
});
