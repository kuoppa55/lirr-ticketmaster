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
 *
 * Returns:
 *     Object with heading (0-360 degrees) and available (boolean).
 */
export function useCompass(enabled = true) {
    const [heading, setHeading] = useState(0);
    const [available, setAvailable] = useState(false);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
            setAvailable(false);
            return;
        }

        let mounted = true;

        const startWatching = async () => {
            try {
                const sub = await Location.watchHeadingAsync((data) => {
                    if (!mounted) return;

                    // Prefer trueHeading (GPS+magnetometer fusion) when valid
                    if (data.trueHeading >= 0) {
                        setHeading(data.trueHeading);
                        setAvailable(true);
                    } else if (data.magHeading >= 0) {
                        setHeading(data.magHeading);
                        setAvailable(true);
                    }
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
    }, [enabled]);

    return { heading, available };
}
