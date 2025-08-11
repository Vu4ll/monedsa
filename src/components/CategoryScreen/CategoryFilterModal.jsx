import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const CategoryFilterModal = ({
    visible,
    onClose,
    colors,
    selectedFilter,
    onFilterChange
}) => {
    const { t, i18n } = useTranslation();
    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        filterModalContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            width: '90%',
            padding: 20,
            paddingTop: 0,
            maxWidth: 400,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 4,
            marginBottom: 16,
            paddingTop: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalCloseButton: {
            padding: 4,
        },
        filterOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            marginBottom: 8,
        },
        filterOptionActive: {
            backgroundColor: colors.primary + '15',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        filterOptionInactive: {
            backgroundColor: colors.background,
        },
        radioButton: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioButtonActive: {
            borderColor: colors.primary,
        },
        radioButtonInactive: {
            borderColor: colors.border,
        },
        radioButtonInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
        },
        filterOptionContent: {
            flex: 1,
        },
        filterOptionTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        filterOptionDescription: {
            fontSize: 14,
            color: colors.textSecondary,
        },
    });

    const filterOptions = [
        {
            key: 'all',
            title: t("categoryScreen.filterModal.all.title"),
            description: t("categoryScreen.filterModal.all.description")
        },
        {
            key: 'income',
            title: t("categoryScreen.filterModal.income.title"),
            description: t("categoryScreen.filterModal.income.description")
        },
        {
            key: 'expense',
            title: t("categoryScreen.filterModal.expense.title"),
            description: t("categoryScreen.filterModal.expense.description")
        }
    ];

    const getFilterStyles = (filterKey) => {
        if (filterKey === 'all') {
            return selectedFilter === 'all' ? styles.filterOptionActive : styles.filterOptionInactive;
        } else if (filterKey === 'income') {
            return selectedFilter === 'income'
                ? { backgroundColor: colors.transparentGreen, borderWidth: 1, borderColor: colors.softGreen }
                : styles.filterOptionInactive;
        } else if (filterKey === 'expense') {
            return selectedFilter === 'expense'
                ? { backgroundColor: colors.transparentRed, borderWidth: 1, borderColor: colors.softRed }
                : styles.filterOptionInactive;
        }
    };

    const getRadioButtonStyles = (filterKey) => {
        if (filterKey === 'all') {
            return selectedFilter === 'all' ? styles.radioButtonActive : styles.radioButtonInactive;
        } else if (filterKey === 'income') {
            return selectedFilter === 'income'
                ? { borderColor: colors.softGreen }
                : styles.radioButtonInactive;
        } else if (filterKey === 'expense') {
            return selectedFilter === 'expense'
                ? { borderColor: colors.softRed }
                : styles.radioButtonInactive;
        }
    };

    const getRadioButtonInnerStyles = (filterKey) => {
        if (filterKey === 'income') {
            return { backgroundColor: colors.softGreen };
        } else if (filterKey === 'expense') {
            return { backgroundColor: colors.softRed };
        }
        return styles.radioButtonInner;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.filterModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t("categoryScreen.filterModal.title")}</Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={onClose}
                        >
                            <Icon name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {filterOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.filterOption,
                                getFilterStyles(option.key)
                            ]}
                            onPress={() => onFilterChange(option.key)}
                        >
                            <View style={[
                                styles.radioButton,
                                getRadioButtonStyles(option.key)
                            ]}>
                                {selectedFilter === option.key && (
                                    <View style={[
                                        styles.radioButtonInner,
                                        getRadioButtonInnerStyles(option.key)
                                    ]} />
                                )}
                            </View>
                            <View style={styles.filterOptionContent}>
                                <Text style={styles.filterOptionTitle}>{option.title}</Text>
                                <Text style={styles.filterOptionDescription}>{option.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
};

export default CategoryFilterModal;
