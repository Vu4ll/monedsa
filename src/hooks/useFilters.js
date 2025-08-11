import { useState, useCallback } from 'react';
import { ToastAndroid } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useFilters = () => {
    const { t, i18n } = useTranslation();
    const [filters, setFilters] = useState({});
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        category: '',
        type: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
    });
    const [sortOptions, setSortOptions] = useState({
        sortBy: 'date',
        sortOrder: 'desc'
    });

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

    const convertServerDateToUI = (serverDate) => {
        if (!serverDate) return '';
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(serverDate)) {
            const [year, month, day] = serverDate.split('-');
            const separator = getDateSeparator();

            switch (i18n.language) {
                case 'tr':
                case 'nl':
                    return `${day}${separator}${month}${separator}${year}`;
                case 'en':
                default:
                    return `${month}${separator}${day}${separator}${year}`;
            }
        }
        return serverDate;
    };

    const convertUIDateToServer = (uiDate) => {
        if (!uiDate) return '';

        const separator = getDateSeparator();
        const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const dateRegex = new RegExp(`^\\d{2}${escapedSeparator}\\d{2}${escapedSeparator}\\d{4}$`);

        if (dateRegex.test(uiDate)) {
            const parts = uiDate.split(separator);
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

            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return uiDate;
    };

    const handleSort = useCallback(() => {
        setSortModalVisible(true);
    }, []);

    const applySorting = useCallback((sortBy, sortOrder, fetchFunction) => {
        const newSortOptions = { sortBy, sortOrder };
        setSortOptions(newSortOptions);
        const newFilters = { ...filters, ...newSortOptions };
        setFilters(newFilters);

        if (fetchFunction) {
            fetchFunction(newFilters);
        }

        setSortModalVisible(false);

        const sortTypeText = sortBy === 'amount' ? t("homeScreen.filterModal.applySorting.amount") : t("homeScreen.filterModal.applySorting.date");
        const sortOrderText = sortOrder === 'asc' ? t("homeScreen.filterModal.applySorting.asc") : t("homeScreen.filterModal.applySorting.desc");
        ToastAndroid.show(t("homeScreen.filterModal.applySorting.final", { type: sortTypeText, order: sortOrderText }), ToastAndroid.SHORT);
    }, [filters]);

    const handleFilter = useCallback(() => {
        setTempFilters({
            category: filters.category || '',
            type: filters.type || '',
            minAmount: filters.minAmount || '',
            maxAmount: filters.maxAmount || '',
            startDate: convertServerDateToUI(filters.startDate) || '',
            endDate: convertServerDateToUI(filters.endDate) || '',
        });
        setFilterModalVisible(true);
    }, [filters]);

    const applyFilters = useCallback((fetchFunction) => {
        const cleanFilters = {};
        Object.keys(tempFilters).forEach(key => {
            if (tempFilters[key] && tempFilters[key].toString().trim() !== '') {
                let value = tempFilters[key];

                if ((key === 'startDate' || key === 'endDate') && value) {
                    value = convertUIDateToServer(value);
                }

                cleanFilters[key] = value;
            }
        });

        const newFilters = { ...cleanFilters, ...sortOptions };
        setFilters(newFilters);

        if (fetchFunction) {
            fetchFunction(newFilters);
        }

        setFilterModalVisible(false);
        ToastAndroid.show(t("homeScreen.filterModal.applyFilters.applyed"), ToastAndroid.SHORT);
    }, [tempFilters, sortOptions]);

    const clearFilters = useCallback((fetchFunction) => {
        setTempFilters({
            category: '',
            type: '',
            minAmount: '',
            maxAmount: '',
            startDate: '',
            endDate: '',
        });
        setFilters({ ...sortOptions });

        if (fetchFunction) {
            fetchFunction({ ...sortOptions });
        }

        setFilterModalVisible(false);
        ToastAndroid.show(t("homeScreen.filterModal.clearFilters.cleared"), ToastAndroid.SHORT);
    }, [sortOptions]);

    const closeSortModal = useCallback(() => {
        setSortModalVisible(false);
    }, []);

    const closeFilterModal = useCallback(() => {
        setFilterModalVisible(false);
    }, []);

    return {
        filters,
        sortModalVisible,
        filterModalVisible,
        tempFilters,
        setTempFilters,
        sortOptions,

        handleSort,
        applySorting,
        handleFilter,
        applyFilters,
        clearFilters,
        closeSortModal,
        closeFilterModal,
    };
};
