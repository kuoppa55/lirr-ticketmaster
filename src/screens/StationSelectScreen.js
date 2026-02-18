/**
 * Station selection screen for choosing which LIRR stations to monitor.
 */

import React, { useMemo } from 'react';
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { getBranches, getStationsByBranch } from '../data/stations';
import { useStationSelection } from '../hooks/useStationSelection';
import { COLORS, LED_GLOW, FONTS } from '../theme/colors';

/**
 * Station selection screen component.
 *
 * Args:
 *     onComplete: Callback function when selection is complete.
 *     isOnboarding: Whether this is the initial onboarding flow.
 */
export default function StationSelectScreen({ onComplete, isOnboarding, onBack }) {
    const {
        loading,
        toggleStation,
        isSelected,
        isMajorJunction,
        getUserSelectionCount,
        getTotalMonitoredCount,
        getRemainingSlots,
        saveAndApply,
    } = useStationSelection();

    // Organize stations by branch for SectionList
    const sections = useMemo(() => {
        const branches = getBranches();
        return branches.map((branch) => ({
            title: branch,
            data: getStationsByBranch(branch),
        }));
    }, []);

    const handleStationPress = (station) => {
        if (isMajorJunction(station.identifier)) {
            Alert.alert(
                'Major Junction',
                `${station.name} is a major junction and is always monitored.`
            );
            return;
        }

        const remainingSlots = getRemainingSlots();
        const currentlySelected = isSelected(station.identifier);

        if (!currentlySelected && remainingSlots === 0) {
            Alert.alert(
                'Selection Limit Reached',
                'You have reached the maximum number of stations for iOS. ' +
                    'Deselect another station to add this one.'
            );
            return;
        }

        toggleStation(station.identifier);
    };

    const handleSave = async () => {
        const success = await saveAndApply();
        if (success) {
            onComplete?.();
        } else {
            Alert.alert('Error', 'Failed to save station selections.');
        }
    };

    const renderStationItem = ({ item: station }) => {
        const selected = isSelected(station.identifier);
        const isMajor = isMajorJunction(station.identifier);

        return (
            <TouchableOpacity
                style={[
                    styles.stationItem,
                    selected && styles.stationItemSelected,
                    isMajor && styles.stationItemMajor,
                ]}
                onPress={() => handleStationPress(station)}
                activeOpacity={isMajor ? 1 : 0.7}
            >
                <Text
                    style={[
                        styles.stationName,
                        selected && styles.stationNameSelected,
                        isMajor && styles.stationNameMajor,
                    ]}
                >
                    {station.name}
                </Text>
                {isMajor && (
                    <Text style={styles.majorLabel}>ALWAYS MONITORED</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const remainingSlots = getRemainingSlots();
    const userCount = getUserSelectionCount();
    const totalCount = getTotalMonitoredCount();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>
                    {isOnboarding
                        ? 'SELECT YOUR STATIONS'
                        : 'EDIT STATIONS'}
                </Text>
                <Text style={styles.subtitle}>
                    {isOnboarding
                        ? 'Choose which stations you frequently use. Major junctions are always monitored.'
                        : 'Tap stations to add or remove them from monitoring.'}
                </Text>
                <View style={styles.countContainer}>
                    {Platform.OS === 'ios' ? (
                        <>
                            <Text style={styles.countText}>
                                {userCount} of {remainingSlots + userCount} custom stations selected
                            </Text>
                            <Text style={styles.countSubtext}>
                                {totalCount} stations total
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.countText}>
                            {totalCount} stations monitored
                        </Text>
                    )}
                </View>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.identifier}
                renderItem={renderStationItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={true}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>
                        {isOnboarding ? 'Start Monitoring' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.background,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    backButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    backButtonText: {
        fontFamily: FONTS.pixel,
        fontSize: 10,
        color: COLORS.primary,
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.pixel,
        color: COLORS.primary,
        ...LED_GLOW,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.secondary,
        marginBottom: 16,
    },
    countContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    countText: {
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.primary,
    },
    countSubtext: {
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.primary,
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        backgroundColor: COLORS.background,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        alignItems: 'center',
    },
    sectionTitle: {
        fontFamily: FONTS.pixel,
        fontSize: 12,
        letterSpacing: 1,
        color: COLORS.primary,
        textAlign: 'center',
    },
    stationItem: {
        backgroundColor: COLORS.background,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.muted,
    },
    stationItemSelected: {
        backgroundColor: COLORS.primary,
    },
    stationItemMajor: {
        backgroundColor: COLORS.secondary,
    },
    stationName: {
        fontFamily: FONTS.pixel,
        fontSize: 10,
        color: COLORS.primary,
    },
    stationNameSelected: {
        color: COLORS.background,
    },
    stationNameMajor: {
        color: COLORS.background,
    },
    majorLabel: {
        fontFamily: FONTS.pixel,
        fontSize: 7,
        color: COLORS.background,
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        paddingVertical: 16,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.primary,
    },
    saveButton: {
        backgroundColor: COLORS.background,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.pixel,
        fontSize: 12,
        letterSpacing: 1,
    },
});
