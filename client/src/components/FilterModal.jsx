import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { categoryService } from '../services';

const FilterModal = ({
    visible,
    onClose,
    tempFilters,
    setTempFilters,
    onApplyFilters,
    onClearFilters,
    colors
}) => {
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (visible) {
            loadCategories();
        }
    }, [visible]);

    useEffect(() => {
        if (tempFilters.category && categories.length > 0) {
            const category = categories.find(cat => cat.name === tempFilters.category);
            setSelectedCategory(category);
        } else {
            setSelectedCategory(null);
        }
    }, [tempFilters.category, categories]);

    useEffect(() => {
        if (selectedCategory && tempFilters.type && selectedCategory.type !== tempFilters.type) {
            clearCategorySelection();
        }
    }, [tempFilters.type, selectedCategory]);

    const loadCategories = async () => {
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata oluştu:', error);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setTempFilters(prev => ({ ...prev, category: category.name }));
        setShowCategoryModal(false);
    };

    const clearCategorySelection = () => {
        setSelectedCategory(null);
        setTempFilters(prev => ({ ...prev, category: '' }));
    };

    const validateDateFormat = (dateString) => {
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(dateString)) return false;

        const [day, month, year] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date instanceof Date && !isNaN(date) &&
            date.getDate() == day &&
            date.getMonth() == month - 1 &&
            date.getFullYear() == year;
    };

    const getTodayString = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getFilteredCategories = () => {
        if (!tempFilters.type) {
            return categories;
        }
        return categories.filter(category => category.type === tempFilters.type);
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContainer: {
            maxHeight: '80%',
            backgroundColor: colors.cardBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalContent: {
            padding: 20,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.text,
        },
        typeContainer: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 8,
        },
        typeButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
        },
        typeText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 8,
            backgroundColor: colors.background,
            color: colors.text,
        },
        amountContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
        },
        amountInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: colors.background,
            color: colors.text,
        },
        amountSeparator: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.textSecondary,
        },
        filterButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
        },
        filterButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
        },
        clearButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        applyButton: {
            backgroundColor: colors.primary,
        },
        filterButtonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        clearButtonText: {
            color: colors.textSecondary,
        },
        applyButtonText: {
            color: colors.white,
        },
        categorySelector: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 8,
            backgroundColor: colors.background,
        },
        categorySelectorContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        categoryColor: {
            width: 16,
            height: 16,
            borderRadius: 8,
            marginRight: 8,
        },
        categoryText: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
        categoryPlaceholder: {
            fontSize: 16,
            color: colors.textSecondary,
            flex: 1,
        },
        clearCategoryButton: {
            padding: 4,
            marginRight: 8,
        },
        categoryModalItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        categoryModalName: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
            marginLeft: 8,
        },
        categoryType: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        categoryList: {
            maxHeight: 400,
        },
        dateInputContainer: {
            marginBottom: 12,
        },
        dateLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 6,
        },
        dateInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.background,
        },
        dateTextInput: {
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
        },
        dateIcon: {
            paddingHorizontal: 12,
        },
        invalidDate: {
            borderColor: colors.danger,
        },
        dateError: {
            fontSize: 12,
            color: colors.danger,
            marginTop: 4,
        },
        quickDateContainer: {
            marginTop: 8,
            marginBottom: 16,
        },
        quickDateLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 8,
        },
        quickDateButtons: {
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
        },
        quickDateButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.primary + '20',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primary + '40',
        },
        quickDateText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '500',
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
                        <Text style={styles.modalTitle}>Filtreler</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Tip Filtresi */}
                        <Text style={styles.sectionTitle}>İşlem Tipi</Text>
                        <View style={styles.typeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor: colors.transparentGreen,
                                        borderColor: colors.softGreen
                                    },
                                    tempFilters.type === 'income' && { backgroundColor: colors.success }
                                ]}
                                onPress={() => setTempFilters(prev => ({
                                    ...prev,
                                    type: prev.type === 'income' ? '' : 'income'
                                }))}
                            >
                                <Text style={[styles.typeText, { color: colors.white }]}>Gelir</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor: colors.transparentRed,
                                        borderColor: colors.softRed
                                    },
                                    tempFilters.type === 'expense' && { backgroundColor: colors.error }
                                ]}
                                onPress={() => setTempFilters(prev => ({
                                    ...prev,
                                    type: prev.type === 'expense' ? '' : 'expense'
                                }))}
                            >
                                <Text style={styles.typeText}>Gider</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Kategori Filtresi */}
                        <Text style={styles.sectionTitle}>Kategori</Text>
                        <TouchableOpacity
                            style={styles.categorySelector}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <View style={styles.categorySelectorContent}>
                                {selectedCategory ? (
                                    <>
                                        <View style={[styles.categoryColor, { backgroundColor: selectedCategory.color }]} />
                                        <Text style={styles.categoryText}>{selectedCategory.name}</Text>
                                        <TouchableOpacity
                                            style={styles.clearCategoryButton}
                                            onPress={clearCategorySelection}
                                        >
                                            <Icon name="close" size={16} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={styles.categoryPlaceholder}>Kategori seçin</Text>
                                )}
                                <Icon name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>

                        {/* Tutar Filtresi */}
                        <Text style={styles.sectionTitle}>Tutar Aralığı</Text>
                        <View style={styles.amountContainer}>
                            <TextInput
                                style={styles.amountInput}
                                value={tempFilters.minAmount}
                                onChangeText={(text) => setTempFilters(prev => ({ ...prev, minAmount: text }))}
                                placeholder="Min tutar"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                            />
                            <Text style={styles.amountSeparator}>-</Text>
                            <TextInput
                                style={styles.amountInput}
                                value={tempFilters.maxAmount}
                                onChangeText={(text) => setTempFilters(prev => ({ ...prev, maxAmount: text }))}
                                placeholder="Max tutar"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Tarih Filtresi */}
                        <Text style={styles.sectionTitle}>Tarih Aralığı</Text>

                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>Başlangıç Tarihi</Text>
                            <View style={styles.dateInputWrapper}>
                                <TextInput
                                    style={[
                                        styles.dateTextInput,
                                        tempFilters.startDate && !validateDateFormat(tempFilters.startDate) && styles.invalidDate
                                    ]}
                                    value={tempFilters.startDate}
                                    onChangeText={(text) => setTempFilters(prev => ({ ...prev, startDate: text }))}
                                    placeholder={`Örn: ${getTodayString()}`}
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Icon name="date-range" size={20} color={colors.textSecondary} style={styles.dateIcon} />
                            </View>
                            {tempFilters.startDate && !validateDateFormat(tempFilters.startDate) && (
                                <Text style={styles.dateError}>Geçerli format: DD-MM-YYYY</Text>
                            )}
                        </View>

                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>Bitiş Tarihi</Text>
                            <View style={styles.dateInputWrapper}>
                                <TextInput
                                    style={[
                                        styles.dateTextInput,
                                        tempFilters.endDate && !validateDateFormat(tempFilters.endDate) && styles.invalidDate
                                    ]}
                                    value={tempFilters.endDate}
                                    onChangeText={(text) => setTempFilters(prev => ({ ...prev, endDate: text }))}
                                    placeholder={`Örn: ${getTodayString()}`}
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Icon name="date-range" size={20} color={colors.textSecondary} style={styles.dateIcon} />
                            </View>
                            {tempFilters.endDate && !validateDateFormat(tempFilters.endDate) && (
                                <Text style={styles.dateError}>Geçerli format: DD-MM-YYYY</Text>
                            )}
                        </View>

                        {/* Hızlı tarih seçenekleri */}
                        <View style={styles.quickDateContainer}>
                            <Text style={styles.quickDateLabel}>Hızlı Seçim:</Text>
                            <View style={styles.quickDateButtons}>
                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = getTodayString();
                                        setTempFilters(prev => ({ ...prev, startDate: today, endDate: today }));
                                    }}
                                >
                                    <Text style={styles.quickDateText}>Bugün</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

                                        const todayFormatted = getTodayString();
                                        const sevenDaysAgoFormatted = `${String(sevenDaysAgo.getDate()).padStart(2, '0')}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${sevenDaysAgo.getFullYear()}`;

                                        setTempFilters(prev => ({
                                            ...prev,
                                            startDate: sevenDaysAgoFormatted,
                                            endDate: todayFormatted
                                        }));
                                    }}
                                >
                                    <Text style={styles.quickDateText}>Son 7 Gün</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

                                        const todayFormatted = getTodayString();
                                        const thirtyDaysAgoFormatted = `${String(thirtyDaysAgo.getDate()).padStart(2, '0')}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${thirtyDaysAgo.getFullYear()}`;

                                        setTempFilters(prev => ({
                                            ...prev,
                                            startDate: thirtyDaysAgoFormatted,
                                            endDate: todayFormatted
                                        }));
                                    }}
                                >
                                    <Text style={styles.quickDateText}>Son 30 Gün</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Butonlar */}
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[styles.filterButton, styles.applyButton]}
                                onPress={onApplyFilters}
                            >
                                <Text style={[styles.filterButtonText, styles.applyButtonText]}>Uygula</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.filterButton, styles.clearButton]}
                                onPress={onClearFilters}
                            >
                                <Text style={[styles.filterButtonText, styles.clearButtonText]}>Temizle</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Kategori Seçimi Modal */}
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
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={getFilteredCategories()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.categoryModalItem}
                                    onPress={() => handleCategorySelect(item)}
                                >
                                    <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                                    <Text style={styles.categoryModalName}>{item.name}</Text>
                                    <Text style={styles.categoryType}>
                                        {item.type === 'income' ? 'Gelir' : 'Gider'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                            style={styles.categoryList}
                        />
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

export default FilterModal;
