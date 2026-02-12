/**
 * Theme preview screen with swipeable full-screen pages.
 *
 * Uses PagerView for native swipe navigation between three theme previews.
 * Loads custom fonts (Oswald Bold, PressStart2P) before rendering.
 * Tracks active page for animations and persists theme selection.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFonts, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { THEME_ORDER } from '../theme/definitions';
import { getSelectedTheme, saveSelectedTheme } from '../theme/themeStorage';
import PageDots from '../components/theme-preview/PageDots';
import StationSignsPreview from '../components/theme-preview/StationSignsPreview';
import LEDDisplayPreview from '../components/theme-preview/LEDDisplayPreview';
import SplitFlapPreview from '../components/theme-preview/SplitFlapPreview';

/**
 * ThemePreviewScreen component.
 *
 * Args:
 *     onBack: Callback to navigate back to settings.
 */
export default function ThemePreviewScreen({ onBack }) {
    const [fontsLoaded, fontError] = useFonts({
        Oswald_700Bold,
        PressStart2P_400Regular,
    });
    const [activePage, setActivePage] = useState(0);
    const [selectedThemeId, setSelectedThemeId] = useState(null);
    const pagerRef = useRef(null);

    // Load previously selected theme
    useEffect(() => {
        getSelectedTheme().then((themeId) => {
            if (themeId) {
                setSelectedThemeId(themeId);
                // Jump to the selected theme's page
                const index = THEME_ORDER.indexOf(themeId);
                if (index >= 0) {
                    setActivePage(index);
                    // PagerView needs a slight delay to be ready
                    setTimeout(() => {
                        pagerRef.current?.setPage(index);
                    }, 100);
                }
            }
        });
    }, []);

    const handlePageSelected = useCallback((e) => {
        setActivePage(e.nativeEvent.position);
    }, []);

    const handleSelect = useCallback(
        async (themeId) => {
            await saveSelectedTheme(themeId);
            setSelectedThemeId(themeId);
            onBack();
        },
        [onBack]
    );

    if (!fontsLoaded && !fontError) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Text style={styles.backButtonText}>
                        {'\u2190'} Back
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Swipeable pages */}
            <PagerView
                ref={pagerRef}
                style={styles.pager}
                initialPage={0}
                onPageSelected={handlePageSelected}
            >
                <View key="station-signs" collapsable={false} style={styles.page}>
                    <StationSignsPreview
                        isActive={activePage === 0}
                        isSelected={selectedThemeId === THEME_ORDER[0]}
                        onSelect={() => handleSelect(THEME_ORDER[0])}
                    />
                </View>
                <View key="led-display" collapsable={false} style={styles.page}>
                    <LEDDisplayPreview
                        isActive={activePage === 1}
                        isSelected={selectedThemeId === THEME_ORDER[1]}
                        onSelect={() => handleSelect(THEME_ORDER[1])}
                    />
                </View>
                <View key="split-flap" collapsable={false} style={styles.page}>
                    <SplitFlapPreview
                        isActive={activePage === 2}
                        isSelected={selectedThemeId === THEME_ORDER[2]}
                        onSelect={() => handleSelect(THEME_ORDER[2])}
                    />
                </View>
            </PagerView>

            {/* Page dots overlay */}
            <View style={styles.dotsOverlay}>
                <PageDots count={THEME_ORDER.length} activeIndex={activePage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#888888',
        fontSize: 14,
        marginTop: 12,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 16,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    pager: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    dotsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
