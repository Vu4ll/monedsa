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
    ToastAndroid,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from "../contexts/ThemeContext";
import { transactionService, categoryService } from '../services';
import { Header } from '../components';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts';
import { formatCurrency } from '../utils';

const AddTransactionScreen = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const { currency } = useCurrency();
    const { isDarkMode, colors } = useTheme();

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
    const [deleting, setDeleting] = useState(false);

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

    const loadCategories = async () => {
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Category load error:', error);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.amount.trim()) {
            errors.amount = t("addTransactionScreen.validateForm.amount");
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            errors.amount = t("addTransactionScreen.validateForm.invalidAmount");
        }

        if (!formData.category) {
            errors.category = t("addTransactionScreen.validateForm.category");
        }

        if (!formData.type) {
            errors.type = t("addTransactionScreen.validateForm.type");
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
                ToastAndroid.show(
                    `${t("addTransactionScreen.handleSaveTransaction.success.text")} ${editingTransaction ?
                        t("addTransactionScreen.handleSaveTransaction.success.updated") :
                        t("addTransactionScreen.handleSaveTransaction.success.added")}`,
                    ToastAndroid.SHORT);

                if (route.params?.onRefresh) {
                    await route.params.onRefresh();
                }

                resetForm();

                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('MainApp');
                }
            } else {
                ToastAndroid.show(result.error || t("addTransactionScreen.handleSaveTransaction.fail"), ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(error.error || t("addTransactionScreen.handleSaveTransaction.error"), ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async () => {
        if (!editingTransaction) return;

        Alert.alert(
            t("addTransactionScreen.handleDeleteTransaction.delete"),
            t("addTransactionScreen.handleDeleteTransaction.confirm"),
            [
                { text: t("common.cancel"), style: 'cancel' },
                {
                    text: t("common.delete"),
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        setDeleting(true);
                        try {
                            const result = await transactionService.deleteTransaction(editingTransaction.id);
                            if (result.success) {
                                ToastAndroid.show(t("addTransactionScreen.handleDeleteTransaction.success"), ToastAndroid.SHORT);

                                if (route.params?.onRefresh) {
                                    route.params.onRefresh();
                                }

                                if (navigation.canGoBack()) {
                                    navigation.goBack();
                                } else {
                                    navigation.navigate('MainApp');
                                }
                            } else {
                                ToastAndroid.show(result.message || t("addTransactionScreen.handleDeleteTransaction.fail"), ToastAndroid.SHORT);
                            }
                        } catch (error) {
                            ToastAndroid.show(error.message || t("addTransactionScreen.handleDeleteTransaction.error"), ToastAndroid.SHORT);
                        } finally {
                            setLoading(false);
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
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
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
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
            color: colors.text,
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
            color: colors.text,
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
            color: colors.text,
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
            color: colors.text,
            marginLeft: 12,
            flex: 1,
        },
    });

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryModalItem}
            onPress={() => handleCategorySelect(item)}
        >
            <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
            <Text style={styles.categoryModalName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title={editingTransaction ? t("addTransactionScreen.header.edit") : t("addTransactionScreen.header.add")}
                showLeftAction={true}
                onLeftActionPress={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.navigate('MainApp');
                    }
                }}
                showRightAction={!!editingTransaction}
                rightActionIcon="delete"
                rightIconColor={colors.softRed}
                onRightActionPress={handleDeleteTransaction}
            />

            <KeyboardAvoidingView
                behavior={'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.formContainer}>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{t("addTransactionScreen.type")}</Text>

                            {/* Type selector for expense/income*/}
                            <View style={styles.typeSelector}>
                                {/* Income button*/}
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption, { backgroundColor: colors.transparentGreen, borderColor: colors.softGreen, borderWidth: 1 },
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
                                        {t("common.income")}
                                    </Text>
                                </TouchableOpacity>

                                {/* Expense button */}
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption, { backgroundColor: colors.transparentRed, borderColor: colors.softRed, borderWidth: 1 },
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
                                        {t("common.expense")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {formErrors.type && <Text style={styles.errorText}>{formErrors.type}</Text>}
                        </View>

                        {/* Amount */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{t("addTransactionScreen.amount")}</Text>
                            <TextInput
                                style={[styles.input, formErrors.amount && styles.inputError]}
                                value={formData.amount}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                                placeholder={formatCurrency(0, currency)}
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                returnKeyType="next"
                                onSubmitEditing={() => descriptionRef.current?.focus()}
                                blurOnSubmit={false}
                            />
                            {formErrors.amount && <Text style={styles.errorText}>{formErrors.amount}</Text>}
                        </View>

                        {/* Category */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{t("addTransactionScreen.category")}</Text>
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
                                        {formData.category || t("addTransactionScreen.selectCategory")}
                                    </Text>
                                </View>
                                <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>
                            {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
                        </View>

                        {/* Description */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{t("addTransactionScreen.description.text")}</Text>
                            <TextInput
                                ref={descriptionRef}
                                style={[styles.input, styles.descriptionInput]}
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                placeholder={t("addTransactionScreen.description.placeholder")}
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                returnKeyType="done"
                                blurOnSubmit={true}
                            />
                        </View>

                        {/* Save button */}
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.buttonDisabled]}
                            onPress={handleSaveTransaction}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ?
                                    (editingTransaction ?
                                        (deleting ? t("addTransactionScreen.deleting") : t("addTransactionScreen.updating")) : t("addTransactionScreen.saving")) :
                                    (editingTransaction ? t("common.update") : t("common.save"))}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Category selecion modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCategoryModal}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("addTransactionScreen.categoryModalTitle")}</Text>
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
