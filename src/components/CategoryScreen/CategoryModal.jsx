import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ColorPicker from './ColorPicker';

const CategoryModal = ({
    visible,
    onClose,
    colors,
    editingCategory,
    formData,
    setFormData,
    formErrors,
    colorOptions,
    onSave,
    onDelete
}) => {
    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalContent: {
            flexGrow: 1,
            padding: 20,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalCloseButton: {
            padding: 4,
        },
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.background,
        },
        inputError: {
            borderColor: colors.danger,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
        typeSelector: {
            flexDirection: 'row',
            gap: 10,
        },
        typeOption: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            alignItems: 'center',
        },
        typeOptionText: {
            fontSize: 16,
            color: colors.text,
        },
        selectedTypeText: {
            color: colors.white,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        deleteButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: colors.danger,
            alignItems: 'center',
        },
        deleteButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        saveButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: 'center',
        },
        saveButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.modalCloseButton}
                        >
                            <Icon name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Kategori Adı</Text>
                            <TextInput
                                style={[styles.input, formErrors.name && styles.inputError]}
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    name: text.charAt(0).toUpperCase() + text.slice(1)
                                }))}
                                placeholder="Kategori adını girin"
                                placeholderTextColor={colors.textSecondary}
                            />
                            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Tür</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        {
                                            backgroundColor: colors.transparentGreen,
                                            borderColor: colors.softGreen,
                                            borderWidth: 1
                                        },
                                        formData.type === 'income' && {
                                            borderColor: colors.border,
                                            backgroundColor: colors.success
                                        }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                                >
                                    <Text style={[
                                        styles.typeOptionText,
                                        formData.type === 'income' && styles.selectedTypeText
                                    ]}>
                                        Gelir
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        {
                                            backgroundColor: colors.transparentRed,
                                            borderColor: colors.softRed,
                                            borderWidth: 1
                                        },
                                        formData.type === 'expense' && {
                                            borderColor: colors.border,
                                            backgroundColor: colors.error
                                        }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                                >
                                    <Text style={[
                                        styles.typeOptionText,
                                        formData.type === 'expense' && styles.selectedTypeText
                                    ]}>
                                        Gider
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {formErrors.type && <Text style={styles.errorText}>{formErrors.type}</Text>}
                        </View>

                        <ColorPicker
                            colors={colors}
                            formData={formData}
                            setFormData={setFormData}
                            formErrors={formErrors}
                            colorOptions={colorOptions}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={onSave}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                                </Text>
                            </TouchableOpacity>

                            {editingCategory && editingCategory.isDeletable && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        onClose();
                                        onDelete(editingCategory);
                                    }}
                                >
                                    <Text style={styles.deleteButtonText}>Sil</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default CategoryModal;
