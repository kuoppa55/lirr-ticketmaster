/**
 * Reusable preset chips component with optional custom input.
 * Displays tappable chip options in a row with a "Custom" chip
 * that reveals a text input when selected.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
} from 'react-native';

/**
 * PresetChips component.
 *
 * Args:
 *     presets: Array of { label, value, isDefault? } objects.
 *     selectedValue: Currently selected value.
 *     onSelect: Callback when a value is selected (receives the value).
 *     customLabel: Label for the custom chip (default "Custom").
 *     customPlaceholder: Placeholder for the custom input field.
 *     customUnit: Unit label shown next to the custom input (e.g., "ft", "min").
 *     parseCustom: Function to parse custom input text into a value.
 *     useMetric: If true, use metric labels for presets that have them.
 */
export default function PresetChips({
    presets,
    selectedValue,
    onSelect,
    customLabel = 'Custom',
    customPlaceholder = 'Enter value',
    customUnit = '',
    parseCustom,
    useMetric = false,
}) {
    const [isCustom, setIsCustom] = useState(false);
    const [customText, setCustomText] = useState('');

    const isPresetSelected = (preset) =>
        !isCustom && selectedValue === preset.value;

    const handlePresetPress = (preset) => {
        setIsCustom(false);
        setCustomText('');
        onSelect(preset.value);
    };

    const handleCustomPress = () => {
        setIsCustom(true);
    };

    const handleCustomSubmit = () => {
        if (parseCustom && customText.trim()) {
            const parsed = parseCustom(customText.trim());
            if (!isNaN(parsed) && parsed > 0) {
                onSelect(parsed);
            }
        }
    };

    const handleCustomChange = (text) => {
        setCustomText(text);
        if (parseCustom && text.trim()) {
            const parsed = parseCustom(text.trim());
            if (!isNaN(parsed) && parsed > 0) {
                onSelect(parsed);
            }
        }
    };

    const getLabel = (preset) => {
        if (useMetric && preset.labelMetric) {
            return preset.labelMetric;
        }
        return preset.label;
    };

    return (
        <View style={styles.container}>
            <View style={styles.chipsRow}>
                {presets.map((preset, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.chip,
                            isPresetSelected(preset) && styles.chipSelected,
                        ]}
                        onPress={() => handlePresetPress(preset)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                isPresetSelected(preset) &&
                                    styles.chipTextSelected,
                            ]}
                        >
                            {getLabel(preset)}
                            {preset.isDefault ? ' *' : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[styles.chip, isCustom && styles.chipSelected]}
                    onPress={handleCustomPress}
                >
                    <Text
                        style={[
                            styles.chipText,
                            isCustom && styles.chipTextSelected,
                        ]}
                    >
                        {customLabel}
                    </Text>
                </TouchableOpacity>
            </View>
            {isCustom && (
                <View style={styles.customInputRow}>
                    <TextInput
                        style={styles.customInput}
                        placeholder={customPlaceholder}
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={customText}
                        onChangeText={handleCustomChange}
                        onSubmitEditing={handleCustomSubmit}
                        returnKeyType="done"
                    />
                    {customUnit ? (
                        <Text style={styles.customUnit}>{customUnit}</Text>
                    ) : null}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
    },
    chipSelected: {
        backgroundColor: '#0066CC',
        borderColor: '#0066CC',
    },
    chipText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    customInput: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#0066CC',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#FFFFFF',
    },
    customUnit: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
});
