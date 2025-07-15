import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    ToastAndroid
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getColors } from '../constants';
import { transactionService, categoryService } from '../services';

const AddTransactionScreen = ({ navigation, route }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const colors = getColors(isDarkMode);

    const editingTransaction = route?.params?.transaction || null;
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        type: 'income'
    });
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const descriptionRef = useRef(null);

    const resetForm = () => {
        setFormData({
            amount: '',
            description: '',
            category: '',
            type: 'income'
        });
        setSelectedCategory(null);
        setFormErrors({});
    };

    useFocusEffect(
        React.useCallback(() => {
            const editingTransaction = route?.params?.transaction || null;

            if (editingTransaction) {
                setFormData({
                    amount: editingTransaction.amount.toString(),
                    description: editingTransaction.description || '',
                    category: editingTransaction.category?.name || '',
                    type: editingTransaction.type
                });
                setSelectedCategory(editingTransaction.category);
            } else {
                resetForm();
            }

            loadCategories();
        }, [route?.params?.transaction])
    );

    useEffect(() => {
        const unsubscribeBlur = navigation.addListener('blur', () => {
            navigation.setParams({ transaction: undefined });
        });

        const unsubscribeTabPress = navigation.addListener('tabPress', (e) => {
            if (route?.params?.transaction) {
                navigation.setParams({ transaction: undefined });
            }
        });

        return () => {
            unsubscribeBlur();
            unsubscribeTabPress();
        };
    }, [navigation, route?.params?.transaction]);

    const loadCategories = async () => {
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.amount.trim()) {
            errors.amount = 'Tutar gerekli';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            errors.amount = 'Geçerli bir tutar girin';
        }

        if (!formData.category) {
            errors.category = 'Kategori seçimi gerekli';
        }

        if (!formData.type) {
            errors.type = 'Tür seçimi gerekli';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveTransaction = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const transactionData = {
                amount: parseFloat(formData.amount),
                description: formData.description.trim() || null,
                category: formData.category,
                type: formData.type
            };

            let result;
            if (editingTransaction) {
                result = await transactionService.updateTransaction(editingTransaction.id, transactionData);
            } else {
                result = await transactionService.addTransaction(transactionData);
            }

            if (result.success) {
                ToastAndroid.show(`İşlem başarıyla ${editingTransaction ? 'güncellendi' : 'eklendi'}`, ToastAndroid.LONG);
                navigation.navigate('Home', { refresh: true });
                navigation.setParams({ transaction: undefined });
                resetForm();
            } else {
                ToastAndroid.show(`Hata: ${result.message || "İşlem başarısız"}`, ToastAndroid.LONG);
            }
        } catch (error) {
            ToastAndroid.show(`Hata: ${result.message || "İşlem sırasında bir hata oluştu"}`, ToastAndroid.LONG);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setFormData(prev => ({ ...prev, category: category.name }));
        setShowCategoryModal(false);
        if (category.type !== formData.type) {
            setFormData(prev => ({ ...prev, type: category.type }));
        }
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 20,
        },
        formContainer: {
            flex: 1,
        },
        inputContainer: {
            marginBottom: 20,
        },
        inputLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.textPrimary,
            backgroundColor: colors.cardBackground,
        },
        inputError: {
            borderColor: colors.danger,
        },
        descriptionInput: {
            height: 80,
            textAlignVertical: 'top',
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
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            backgroundColor: colors.cardBackground,
        },
        typeOptionText: {
            fontSize: 16,
            color: colors.textPrimary,
        },
        selectedTypeText: {
            color: colors.white,
        },
        categorySelector: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.cardBackground,
        },
        categoryDisplay: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        categoryColor: {
            width: 16,
            height: 16,
            borderRadius: 8,
            marginRight: 10,
        },
        categoryText: {
            fontSize: 16,
            color: colors.textPrimary,
        },
        placeholderText: {
            color: colors.textSecondary,
        },
        dropdownArrow: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        saveButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        buttonDisabled: {
            backgroundColor: colors.disabled,
        },
        saveButtonText: {
            color: colors.white,
            fontSize: 18,
            fontWeight: '600',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContainer: {
            backgroundColor: colors.cardBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textPrimary,
        },
        modalCloseButton: {
            padding: 4,
        },
        modalCloseText: {
            fontSize: 18,
            color: colors.textSecondary,
        },
        categoryList: {
            paddingHorizontal: 20,
        },
        categoryModalItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        categoryModalName: {
            fontSize: 16,
            color: colors.textPrimary,
            marginLeft: 12,
            flex: 1,
        },
        categoryModalBadge: {
            fontSize: 12,
            color: colors.textSecondary,
            backgroundColor: colors.background,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        sectionHeader: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: 20,
            marginTop: 20,
        },
    });

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryModalItem}
            onPress={() => handleCategorySelect(item)}
        >
            <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
            <Text style={styles.categoryModalName}>{item.name}</Text>
            {item.isDefault && (
                <Text style={styles.categoryModalBadge}>Varsayılan</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <KeyboardAvoidingView
                behavior={'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.sectionHeader}>{editingTransaction ? 'İşlemi Düzenle' : 'Yeni İşlem Ekle'}</Text>
                    <View style={styles.formContainer}>

                        {/* Tür Seçimi */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Tür</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption, { borderColor: colors.softGreen, borderWidth: 1.5 },
                                        formData.type === 'income' && { borderColor: colors.border, backgroundColor: colors.success }
                                    ]}
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, type: 'income' }));
                                        setSelectedCategory(null);
                                        setFormData(prev => ({ ...prev, category: '' }));
                                    }}
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
                                        styles.typeOption, { borderColor: colors.softRed, borderWidth: 1.5 },
                                        formData.type === 'expense' && { borderColor: colors.border, backgroundColor: colors.error }
                                    ]}
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, type: 'expense' }));
                                        setSelectedCategory(null);
                                        setFormData(prev => ({ ...prev, category: '' }));
                                    }}
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

                        {/* Tutar */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Tutar (₺)</Text>
                            <TextInput
                                style={[styles.input, formErrors.amount && styles.inputError]}
                                value={formData.amount}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                                placeholder="0.00"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                returnKeyType="next"
                                onSubmitEditing={() => descriptionRef.current?.focus()}
                                blurOnSubmit={false}
                            />
                            {formErrors.amount && <Text style={styles.errorText}>{formErrors.amount}</Text>}
                        </View>

                        {/* Kategori */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Kategori</Text>
                            <TouchableOpacity
                                style={[styles.categorySelector, formErrors.category && styles.inputError]}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <View style={styles.categoryDisplay}>
                                    {selectedCategory && (
                                        <View style={[styles.categoryColor, { backgroundColor: selectedCategory.color }]} />
                                    )}
                                    <Text style={[
                                        styles.categoryText,
                                        !formData.category && styles.placeholderText
                                    ]}>
                                        {formData.category || 'Kategori seçin'}
                                    </Text>
                                </View>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>
                            {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
                        </View>

                        {/* Açıklama */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Açıklama (Opsiyonel)</Text>
                            <TextInput
                                ref={descriptionRef}
                                style={[styles.input, styles.descriptionInput]}
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                placeholder="Açıklama girin..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                returnKeyType="done"
                                blurOnSubmit={true}
                            />
                        </View>

                        {/* Kaydet Butonu */}
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.buttonDisabled]}
                            onPress={handleSaveTransaction}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Kaydediliyor...' : (editingTransaction ? 'Güncelle' : 'Kaydet')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Kategori Seçim Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCategoryModal}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kategori Seç</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredCategories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id}
                            style={styles.categoryList}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AddTransactionScreen;
