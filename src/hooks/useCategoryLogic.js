import React, { useState, useEffect } from 'react';
import { Alert, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { categoryService } from '../services';

export const useCategoryLogic = (route, navigation) => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#39BE56',
        type: 'income',
    });
    const [formErrors, setFormErrors] = useState({});

    const colorOptions = [
        '#39BE56', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (route?.params?.openAddModal) {
            handleAddCategory();
            navigation.setParams({ openAddModal: undefined });
        }
    }, [route?.params?.openAddModal]);

    useFocusEffect(
        React.useCallback(() => {
            loadCategories();
        }, [])
    );

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
                applyFilter(result.data, selectedFilter);
            } else {
                Alert.alert('Hata', result.error);
            }
        } catch (error) {
            Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (categoriesData, filter) => {
        let filtered = categoriesData;

        if (filter === 'income') {
            filtered = categoriesData.filter(cat => cat.type === 'income');
        } else if (filter === 'expense') {
            filtered = categoriesData.filter(cat => cat.type === 'expense');
        }

        setFilteredCategories(filtered);
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        applyFilter(categories, filter);
        setFilterModalVisible(false);

        const filterText = filter === 'all' ? 'Tüm kategoriler' :
            filter === 'income' ? 'Gelir kategorileri' : 'Gider kategorileri';
        ToastAndroid.show(filterText + ' gösteriliyor', ToastAndroid.SHORT);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
                applyFilter(result.data, selectedFilter);
            } else {
                ToastAndroid.show(`Hata: ${result.error}`, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(`Kategoriler yüklenirken bir hata oluştu`, ToastAndroid.SHORT);
        } finally {
            setRefreshing(false);
        }
    };

    const validateForm = async () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Kategori adı gerekli';
        }

        if (!formData.color) {
            errors.color = 'Renk seçimi gerekli';
        }

        if (!formData.type) {
            errors.type = 'Tür seçimi gerekli';
        }

        if (formData.name.trim() && formData.type) {
            const existsCheck = await categoryService.checkCategoryExists(
                formData.name.trim(),
                formData.type,
                editingCategory?.id,
            );

            if (existsCheck.exists) {
                const typeText = formData.type === 'income' ? 'gelir' : 'gider';
                errors.name = `Bu ${typeText} türünde ${formData.name} adında bir kategori zaten bulunuyor. Lütfen farklı bir isim seçin.`;
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveCategory = async () => {
        const isValid = await validateForm();
        if (!isValid) return;

        try {
            let result;
            if (editingCategory) {
                result = await categoryService.updateCategory(editingCategory.id, formData);
            } else {
                result = await categoryService.addCategory(formData);
            }

            if (result.success) {
                setModalVisible(false);
                resetForm();
                const categoriesResult = await categoryService.getCategories();
                if (categoriesResult.success) {
                    setCategories(categoriesResult.data);
                    applyFilter(categoriesResult.data, selectedFilter);
                }
                ToastAndroid.show(
                    editingCategory ? "Kategori başarılıyla güncellendi" : "Yeni kategori başarılıyla eklendi",
                    ToastAndroid.SHORT
                );
            } else {
                ToastAndroid.show(
                    `Kategori ${editingCategory ? "güncellenemedi" : "eklenemedi"}`,
                    ToastAndroid.SHORT
                );
            }
        } catch (error) {
            ToastAndroid.show(`Kategori kaydedilirken bir hata oluştu`, ToastAndroid.SHORT);
        }
    };

    const handleDeleteCategory = async (category) => {
        Alert.alert(
            'Kategori Sil',
            `${category.name} kategorisini silmek istediğinizden emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await categoryService.deleteCategory(category.id);
                            if (result.success) {
                                const categoriesResult = await categoryService.getCategories();
                                if (categoriesResult.success) {
                                    setCategories(categoriesResult.data);
                                    applyFilter(categoriesResult.data, selectedFilter);
                                }
                                ToastAndroid.show("Kategori başarıyla silindi", ToastAndroid.SHORT);
                            } else {
                                Alert.alert('Hata', result.error);
                            }
                        } catch (error) {
                            ToastAndroid.show(`Kategori silinirken bir hata oluştu`, ToastAndroid.SHORT);
                        }
                    }
                }
            ]
        );
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color,
            type: category.type,
        });
        setModalVisible(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#39BE56',
            type: 'income',
        });
        setFormErrors({});
        setEditingCategory(null);
    };

    const handleAddCategory = () => {
        resetForm();
        setModalVisible(true);
    };

    return {
        // State
        categories,
        filteredCategories,
        loading,
        refreshing,
        modalVisible,
        filterModalVisible,
        selectedFilter,
        editingCategory,
        formData,
        formErrors,
        colorOptions,

        // Actions
        setModalVisible,
        setFilterModalVisible,
        setFormData,
        handleFilterChange,
        onRefresh,
        handleSaveCategory,
        handleDeleteCategory,
        handleEditCategory,
        handleAddCategory,
        loadCategories
    };
};
