/**
 * Home screen marquee transition helpers.
 */

/**
 * Determine whether marquee should hard-reset to the start position.
 *
 * Args:
 *     prevIsActive: Previous monitoring active state.
 *     nextIsActive: Next monitoring active state.
 *     prevHasStations: Whether previous frame had nearby stations.
 *     nextHasStations: Whether next frame has nearby stations.
 *
 * Returns:
 *     True when monitor mode changed (toggle) or scan/approach mode changed.
 */
export function shouldResetMarquee({
    prevIsActive,
    nextIsActive,
    prevHasStations,
    nextHasStations,
}) {
    const didToggleMonitoring = prevIsActive !== nextIsActive;
    const didTransitionBetweenScanAndApproach =
        prevIsActive &&
        nextIsActive &&
        prevHasStations !== nextHasStations;

    return didToggleMonitoring || didTransitionBetweenScanAndApproach;
}
