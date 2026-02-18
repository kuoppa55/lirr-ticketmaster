/**
 * Hook for subscribing to the device compass heading.
 *
 * Uses expo-location's watchHeadingAsync which fuses GPS and magnetometer
 * data for a stable true heading. Falls back to magnetic heading when
 * true heading is unavailable.
 */

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

/**
 * Subscribe to compass heading updates.
 *
 * Args:
 *     enabled: Whether the subscription should be active.
 *     options: Optional update throttling config.
 *
 * Returns:
 *     Object with heading (0-360 degrees) and available (boolean).
 */
export function useCompass(
    enabled = true,
    { minDeltaDeg = 3, minIntervalMs = 120 } = {}
) {
    const [heading, setHeading] = useState(0);
    const [available, setAvailable] = useState(false);
    const subscriptionRef = useRef(null);
    const lastHeadingRef = useRef(null);
    const lastUpdateAtRef = useRef(0);

    useEffect(() => {
        if (!enabled) {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
            lastHeadingRef.current = null;
            lastUpdateAtRef.current = 0;
            setAvailable(false);
            return;
        }

        let mounted = true;

        const startWatching = async () => {
            try {
                const sub = await Location.watchHeadingAsync((data) => {
                    if (!mounted) return;

                    // Prefer trueHeading (GPS+magnetometer fusion) when valid
                    let nextHeading = null;
                    if (data.trueHeading >= 0) {
                        nextHeading = data.trueHeading;
                    } else if (data.magHeading >= 0) {
                        nextHeading = data.magHeading;
                    }

                    if (nextHeading === null) {
                        return;
                    }

                    const now = Date.now();
                    const lastHeading = lastHeadingRef.current;
                    const angularDelta = lastHeading === null
                        ? 360
                        : Math.abs((((nextHeading - lastHeading) + 540) % 360) - 180);

                    if (
                        lastHeading !== null &&
                        angularDelta < minDeltaDeg &&
                        now - lastUpdateAtRef.current < minIntervalMs
                    ) {
                        return;
                    }

                    lastHeadingRef.current = nextHeading;
                    lastUpdateAtRef.current = now;
                    setHeading(nextHeading);
                    setAvailable(true);
                });

                if (mounted) {
                    subscriptionRef.current = sub;
                } else {
                    sub.remove();
                }
            } catch (error) {
                console.warn('Compass not available:', error.message);
                if (mounted) {
                    setAvailable(false);
                }
            }
        };

        startWatching();

        return () => {
            mounted = false;
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
        };
    }, [enabled, minDeltaDeg, minIntervalMs]);

    return { heading, available };
}
