import { useState, useCallback } from 'react';
import { ToastAndroid } from 'react-native';

export const useFilters = () => {
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

        const sortTypeText = sortBy === 'amount' ? 'Tutara' : 'Tarihe';
        const sortOrderText = sortOrder === 'asc' ? 'artan' : 'azalan';
        ToastAndroid.show(`${sortTypeText} göre ${sortOrderText} sıralandı`, ToastAndroid.SHORT);
    }, [filters]);

    const handleFilter = useCallback(() => {
        setTempFilters({
            category: filters.category || '',
            type: filters.type || '',
            minAmount: filters.minAmount || '',
            maxAmount: filters.maxAmount || '',
            startDate: filters.startDate || '',
            endDate: filters.endDate || '',
        });
        setFilterModalVisible(true);
    }, [filters]);

    const applyFilters = useCallback((fetchFunction) => {
        const cleanFilters = {};
        Object.keys(tempFilters).forEach(key => {
            if (tempFilters[key] && tempFilters[key].toString().trim() !== '') {
                let value = tempFilters[key];
                
                // Tarih formatını backend için dönüştür (DD-MM-YYYY -> YYYY-MM-DD)
                if ((key === 'startDate' || key === 'endDate') && value) {
                    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
                    if (dateRegex.test(value)) {
                        const [day, month, year] = value.split('-');
                        value = `${year}-${month}-${day}`;
                    }
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
        ToastAndroid.show("Filtreler uygulandı", ToastAndroid.SHORT);
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
        ToastAndroid.show("Filtreler temizlendi", ToastAndroid.SHORT);
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
