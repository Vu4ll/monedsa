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
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { categoryService } from '../services';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils';

const FilterModal = ({
    visible,
    onClose,
    tempFilters,
    setTempFilters,
    onApplyFilters,
    onClearFilters,
    colors
}) => {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

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

    const getDateFormat = () => {
        switch (i18n.language) {
            case 'tr':
                return 'DD.MM.YYYY';
            case 'nl':
                return 'DD-MM-YYYY';
            case 'en':
            default:
                return 'MM/DD/YYYY';
        }
    };

    const getDateSeparator = () => {
        switch (i18n.language) {
            case 'tr':
                return '.';
            case 'nl':
                return '-';
            case 'en':
            default:
                return '/';
        }
    };

    const formatDateToString = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const separator = getDateSeparator();

        switch (i18n.language) {
            case 'tr':
            case 'nl':
                return `${day}${separator}${month}${separator}${year}`;
            case 'en':
            default:
                return `${month}${separator}${day}${separator}${year}`;
        }
    };

    const parseStringToDate = (dateString) => {
        if (!dateString || !validateDateFormat(dateString)) return new Date();

        const separator = getDateSeparator();
        const parts = dateString.split(separator);

        let day, month, year;

        switch (i18n.language) {
            case 'tr':
            case 'nl':
                [day, month, year] = parts;
                break;
            case 'en':
            default:
                [month, day, year] = parts;
                break;
        }

        return new Date(year, month - 1, day);
    };

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
            const formattedDate = formatDateToString(selectedDate);
            setTempFilters(prev => ({ ...prev, startDate: formattedDate }));
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEndDate(selectedDate);
            const formattedDate = formatDateToString(selectedDate);
            setTempFilters(prev => ({ ...prev, endDate: formattedDate }));
        }
    };

    const openStartDatePicker = () => {
        if (tempFilters.startDate && validateDateFormat(tempFilters.startDate)) {
            setStartDate(parseStringToDate(tempFilters.startDate));
        }
        setShowStartDatePicker(true);
    };

    const openEndDatePicker = () => {
        if (tempFilters.endDate && validateDateFormat(tempFilters.endDate)) {
            setEndDate(parseStringToDate(tempFilters.endDate));
        }
        setShowEndDatePicker(true);
    };

    const setQuickDate = (startDateObj, endDateObj) => {
        setTempFilters(prev => ({
            ...prev,
            startDate: formatDateToString(startDateObj),
            endDate: formatDateToString(endDateObj)
        }));
    };

    const validateDateFormat = (dateString) => {
        const separator = getDateSeparator();
        const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const dateRegex = new RegExp(`^\\d{2}${escapedSeparator}\\d{2}${escapedSeparator}\\d{4}$`);

        if (!dateRegex.test(dateString)) return false;

        const parts = dateString.split(separator);
        let day, month, year;

        switch (i18n.language) {
            case 'tr':
            case 'nl':
                [day, month, year] = parts;
                break;
            case 'en':
            default:
                [month, day, year] = parts;
                break;
        }

        const date = new Date(year, month - 1, day);
        return date instanceof Date && !isNaN(date) &&
            date.getDate() == day &&
            date.getMonth() == month - 1 &&
            date.getFullYear() == year;
    };

    const getTodayString = () => {
        const today = new Date();
        return formatDateToString(today);
    };

    const getDateExample = () => {
        const today = new Date();
        return formatDateToString(today);
    };

    const getDatePlaceholder = () => {
        return t("homeScreen.filterModal.eg", { date: getDateExample() });
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
            marginTop: 8,
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
        datePlaceholder: {
            color: colors.textSecondary,
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
                        <Text style={styles.modalTitle}>{t("homeScreen.filterModal.filter")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Type Filter */}
                        <Text style={styles.sectionTitle}>{t("homeScreen.filterModal.type")}</Text>
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
                                <Text style={[styles.typeText, tempFilters.type === 'income' && { color: colors.white }]}>
                                    {t("common.income")}
                                </Text>
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
                                <Text style={[styles.typeText, tempFilters.type === 'expense' && { color: colors.white }]}>
                                    {t("common.expense")}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Category Filter */}
                        <Text style={styles.sectionTitle}>{t("homeScreen.filterModal.category")}</Text>
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
                                    <Text style={styles.categoryPlaceholder}>
                                        {t("homeScreen.filterModal.selectCategory")}
                                    </Text>
                                )}
                                <Icon name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>

                        {/* Amount Filter */}
                        <Text style={styles.sectionTitle}>{t("homeScreen.filterModal.amount")}</Text>
                        <View style={styles.amountContainer}>
                            <TextInput
                                style={styles.amountInput}
                                value={tempFilters.minAmount}
                                onChangeText={(text) => setTempFilters(prev => ({ ...prev, minAmount: text }))}
                                placeholder={t("homeScreen.filterModal.minAmount")}
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                            />
                            <Text style={styles.amountSeparator}>-</Text>
                            <TextInput
                                style={styles.amountInput}
                                value={tempFilters.maxAmount}
                                onChangeText={(text) => setTempFilters(prev => ({ ...prev, maxAmount: text }))}
                                placeholder={t("homeScreen.filterModal.maxAmount")}
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Date Filter */}
                        <Text style={styles.sectionTitle}>{t("homeScreen.filterModal.date")}</Text>

                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>{t("homeScreen.filterModal.startDate")}</Text>
                            <TouchableOpacity
                                style={[
                                    styles.dateInputWrapper,
                                    tempFilters.startDate && !validateDateFormat(tempFilters.startDate) && styles.invalidDate
                                ]}
                                onPress={openStartDatePicker}
                            >
                                <Text style={[
                                    styles.dateTextInput,
                                    !tempFilters.startDate && styles.datePlaceholder
                                ]}>
                                    {tempFilters.startDate || getDatePlaceholder()}
                                </Text>
                                <Icon name="date-range" size={20} color={colors.textSecondary} style={styles.dateIcon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateInputContainer}>
                            <Text style={styles.dateLabel}>{t("homeScreen.filterModal.endDate")}</Text>
                            <TouchableOpacity
                                style={[
                                    styles.dateInputWrapper,
                                    tempFilters.endDate && !validateDateFormat(tempFilters.endDate) && styles.invalidDate
                                ]}
                                onPress={openEndDatePicker}
                            >
                                <Text style={[
                                    styles.dateTextInput,
                                    !tempFilters.endDate && styles.datePlaceholder
                                ]}>
                                    {tempFilters.endDate || getDatePlaceholder()}
                                </Text>
                                <Icon name="date-range" size={20} color={colors.textSecondary} style={styles.dateIcon} />
                            </TouchableOpacity>
                        </View>

                        {/* Quick Date Filters */}
                        <View style={styles.quickDateContainer}>
                            <Text style={styles.quickDateLabel}>{t("homeScreen.filterModal.quick.title")}</Text>
                            <View style={styles.quickDateButtons}>
                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        setQuickDate(today, today);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.today")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const dayOfWeek = today.getDay();
                                        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                                        const monday = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000);
                                        const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);

                                        setQuickDate(monday, sunday);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.thisWeek")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                        setQuickDate(sevenDaysAgo, today);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.last7day")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                                        setQuickDate(firstDayOfMonth, lastDayOfMonth);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.thisMonth")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                        setQuickDate(thirtyDaysAgo, today);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.last30day")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.quickDateButton}
                                    onPress={() => {
                                        const today = new Date();
                                        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

                                        setQuickDate(firstDayOfLastMonth, lastDayOfLastMonth);
                                    }}
                                >
                                    <Text style={styles.quickDateText}>{t("homeScreen.filterModal.quick.lastMonth")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[styles.filterButton, styles.applyButton]}
                                onPress={onApplyFilters}
                            >
                                <Text style={[styles.filterButtonText, styles.applyButtonText]}>{t("homeScreen.filterModal.buttons.apply")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.filterButton, styles.clearButton]}
                                onPress={onClearFilters}
                            >
                                <Text style={[styles.filterButtonText, styles.clearButtonText]}>{t("homeScreen.filterModal.buttons.clear")}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Select Category Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCategoryModal}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("homeScreen.filterModal.categoryModal")}</Text>
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
                                        {item.type === 'income' ? t("common.income") : t("common.expense")}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                            style={styles.categoryList}
                        />
                    </View>
                </View>
            </Modal>

            {/* DateTimePicker's */}
            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartDateChange}
                    minimumDate={new Date(2000, 0, 1)}
                    maximumDate={new Date(2030, 11, 31)}
                />
            )}

            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndDateChange}
                    minimumDate={new Date(2000, 0, 1)}
                    maximumDate={new Date(2030, 11, 31)}
                />
            )}
        </Modal>
    );
};

export default FilterModal;
