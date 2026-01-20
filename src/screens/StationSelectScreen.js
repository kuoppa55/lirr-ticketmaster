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
import { LIRR_STATIONS, getBranches } from '../data/stations';
import { useStationSelection } from '../hooks/useStationSelection';

/**
 * Station selection screen component.
 *
 * Args:
 *     onComplete: Callback function when selection is complete.
 *     isOnboarding: Whether this is the initial onboarding flow.
 */
export default function StationSelectScreen({ onComplete, isOnboarding }) {
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
            data: LIRR_STATIONS.filter((s) => s.branch === branch),
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
                <View style={styles.stationInfo}>
                    <Text
                        style={[
                            styles.stationName,
                            selected && styles.stationNameSelected,
                        ]}
                    >
                        {station.name}
                    </Text>
                    {isMajor && (
                        <Text style={styles.majorLabel}>Always monitored</Text>
                    )}
                </View>
                <View
                    style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                        isMajor && styles.checkboxMajor,
                    ]}
                >
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
            </View>
        );
    }

    const remainingSlots = getRemainingSlots();
    const userCount = getUserSelectionCount();
    const totalCount = getTotalMonitoredCount();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isOnboarding
                        ? 'Select Your Stations'
                        : 'Edit Monitored Stations'}
                </Text>
                <Text style={styles.subtitle}>
                    {isOnboarding
                        ? 'Choose which stations you frequently use. Major junctions are always monitored.'
                        : 'Tap stations to add or remove them from monitoring.'}
                </Text>
                <View style={styles.countContainer}>
                    {Platform.OS === 'ios' ? (
                        <Text style={styles.countText}>
                            {userCount} of {remainingSlots + userCount} custom
                            stations selected ({totalCount} total)
                        </Text>
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
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#0066CC',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 16,
    },
    countContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    countText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        backgroundColor: '#E8E8E8',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',
    },
    stationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    stationItemSelected: {
        backgroundColor: '#E6F2FF',
    },
    stationItemMajor: {
        backgroundColor: '#FFF9E6',
    },
    stationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: 16,
        color: '#333333',
    },
    stationNameSelected: {
        fontWeight: '600',
        color: '#0066CC',
    },
    majorLabel: {
        fontSize: 12,
        color: '#CC8800',
        marginTop: 2,
        fontWeight: '500',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#0066CC',
        borderColor: '#0066CC',
    },
    checkboxMajor: {
        backgroundColor: '#CC8800',
        borderColor: '#CC8800',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    saveButton: {
        backgroundColor: '#0066CC',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
