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
import { COLORS, FONTS } from '../theme/colors';

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
    const [hasCustomError, setHasCustomError] = useState(false);

    const getPresetValue = (preset) => {
        if (!useMetric && preset.valueImperial !== undefined) {
            return preset.valueImperial;
        }
        return preset.value;
    };

    const isPresetSelected = (preset) =>
        !isCustom && selectedValue === getPresetValue(preset);

    const handlePresetPress = (preset) => {
        setIsCustom(false);
        setCustomText('');
        setHasCustomError(false);
        onSelect(getPresetValue(preset));
    };

    const handleCustomPress = () => {
        setIsCustom(true);
        setHasCustomError(false);
    };

    const handleCustomSubmit = () => {
        if (parseCustom && customText.trim()) {
            const parsed = parseCustom(customText.trim());
            if (!isNaN(parsed) && parsed > 0) {
                setHasCustomError(false);
                onSelect(parsed);
                return;
            }
            setHasCustomError(true);
        }
    };

    const handleCustomChange = (text) => {
        setCustomText(text);
        if (!text.trim()) {
            setHasCustomError(false);
            return;
        }

        if (parseCustom && text.trim()) {
            const parsed = parseCustom(text.trim());
            if (!isNaN(parsed) && parsed > 0) {
                setHasCustomError(false);
                onSelect(parsed);
                return;
            }
            setHasCustomError(true);
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
                        placeholderTextColor={COLORS.muted}
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
            {isCustom && hasCustomError && (
                <Text style={styles.customError}>
                    Enter a value within the allowed range.
                </Text>
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
        borderRadius: 0,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.primary,
    },
    chipTextSelected: {
        color: COLORS.background,
    },
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    customInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontFamily: FONTS.pixel,
        fontSize: 10,
        color: COLORS.primary,
        backgroundColor: COLORS.background,
    },
    customUnit: {
        marginLeft: 8,
        fontFamily: FONTS.pixel,
        fontSize: 9,
        color: COLORS.primary,
    },
    customError: {
        marginTop: 6,
        fontSize: 12,
        color: COLORS.secondary,
    },
});
