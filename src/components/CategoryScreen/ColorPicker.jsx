import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const WheelColorPicker = require('react-native-wheel-color-picker');

const ColorPicker = ({ colors, formData, setFormData, formErrors, colorOptions }) => {
    const [customColorModalVisible, setCustomColorModalVisible] = useState(false);
    const [selectedCustomColor, setSelectedCustomColor] = useState(formData.color || '#39BE56');

    const isCustomColor = !colorOptions.includes(formData.color);

    const handleCustomColorSave = () => {
        setFormData(prev => ({ ...prev, color: selectedCustomColor }));
        setCustomColorModalVisible(false);
    };

    const openCustomColorModal = () => {
        setSelectedCustomColor(formData.color || '#39BE56');
        setCustomColorModalVisible(true);
    };
    const styles = StyleSheet.create({
        colorPickerContainer: {
            marginBottom: 20,
        },
        colorPickerLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        colorGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        colorOption: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: 'transparent',
        },
        selectedColor: {
            borderColor: colors.text,
        },
        customColorOption: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: colors.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.cardBackground,
        },
        customColorOptionSelected: {
            borderStyle: 'solid',
            borderColor: colors.text,
            borderWidth: 1.5
        },
        customColorIndicator: {
            position: 'absolute',
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: colors.cardBackground,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: 20,
            width: '90%',
            maxWidth: 350,
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            paddingBottom: 8,
        },
        selectedColorPreview: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        colorPreviewBox: {
            width: 30,
            height: 30,
            borderRadius: 15,
            marginRight: 12,
            borderWidth: 2,
            borderColor: colors.border,
        },
        colorCodeText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
        },
        modalButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        modalButtonText: {
            fontSize: 16,
            fontWeight: '500',
        },
        saveButtonText: {
            color: colors.white,
        },
        modalCloseButton: {
            padding: 4,
            paddingBottom: 8,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: 16,
        },
    });

    return (
        <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerLabel}>Renk Seçin</Text>
            <View style={styles.colorGrid}>
                {colorOptions.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            formData.color === color && styles.selectedColor
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, color }))}
                    />
                ))}

                {/* Custom Color Picker */}
                <TouchableOpacity
                    style={[
                        styles.customColorOption,
                        isCustomColor && styles.customColorOptionSelected
                    ]}
                    onPress={openCustomColorModal}
                >
                    {/* Custom renk seçildiyse arka planda renk göster */}
                    {isCustomColor && (
                        <View
                            style={[
                                styles.customColorIndicator,
                                { backgroundColor: formData.color }
                            ]}
                        />
                    )}
                    <Icon
                        name="palette"
                        size={20}
                        color={isCustomColor ? colors.white : colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
            {formErrors.color && <Text style={styles.errorText}>{formErrors.color}</Text>}

            {/* Custom Color Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={customColorModalVisible}
                onRequestClose={() => setCustomColorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Özel Renk Seçin</Text>

                            <TouchableOpacity
                                onPress={() => setCustomColorModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Seçilen rengin önizlemesi */}
                        <View style={styles.selectedColorPreview}>
                            <View style={[styles.colorPreviewBox, { backgroundColor: selectedCustomColor }]} />
                            <Text style={styles.colorCodeText}>{selectedCustomColor.toUpperCase()}</Text>
                        </View>

                        {/* Renk seçici tekerleği */}
                        <View style={[styles.colorPickerContainer, { height: 270 }]}>
                            <WheelColorPicker
                                color={selectedCustomColor}
                                onColorChange={setSelectedCustomColor}
                                thumbSize={20}
                                sliderSize={20}
                                noSnap={true}
                                row={false}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleCustomColorSave}
                            >
                                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                                    Kaydet
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ColorPicker;
