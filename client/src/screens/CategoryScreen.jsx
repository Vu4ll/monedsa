import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
    useColorScheme,
    ToastAndroid,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../contexts/ThemeContext";
import { categoryService, authService } from '../services';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components';

const CategoryScreen = ({ navigation, route }) => {
    const { isDarkMode, colors } = useTheme();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'income', 'expense'
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

    const validateForm = () => {
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

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveCategory = async () => {
        if (!validateForm()) return;

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
                // Kategorileri yeniden yükle ve filtreyi uygula
                const categoriesResult = await categoryService.getCategories();
                if (categoriesResult.success) {
                    setCategories(categoriesResult.data);
                    applyFilter(categoriesResult.data, selectedFilter);
                }
                ToastAndroid.show(editingCategory ? "Kategori başarılıyla güncellendi" : "Yeni kategori başarılıyla eklendi", ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(`Kategori ${editingCategory ? "güncellenemedi" : "eklenemedi"}`, ToastAndroid.SHORT);
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
                                // Kategorileri yeniden yükle ve filtreyi uygula
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            flex: 1,
        },
        listContainer: {
            paddingHorizontal: 20,
            paddingTop: 16,
        },
        categoryItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.cardBackground,
            padding: 16,
            marginBottom: 10,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            borderWidth: 1.5,
            borderColor: colors.border
        },
        categoryInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        colorIndicator: {
            width: 20,
            height: 20,
            borderRadius: 10,
            marginRight: 12,
        },
        categoryDetails: {
            flex: 1,
        },
        categoryName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        categoryCorner: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 30,
            height: 30,
            borderTopWidth: 25,
            borderRightWidth: 35,
            borderTopLeftRadius: 10,
            borderRightColor: 'transparent',
        },
        categoryType: {
            fontSize: 14,
            color: colors.textSecondary,
            // marginTop: 2,
        },
        categoryActions: {
            flexDirection: 'row',
            gap: 10,
        },
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },
        emptyStateContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyStateTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginTop: 24,
            textAlign: 'center',
        },
        emptyStateSubtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 24,
        },
        emptyListContainer: {
            flexGrow: 1,
        },
        defaultIndicator: {
            padding: 8,
            backgroundColor: colors.background,
            borderRadius: 20,
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

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleEditCategory(item)}
        >
            <View style={styles.categoryItem}>
                <View style={[styles.categoryCorner, { borderTopColor: item.type === "income" ? colors.softGreen : colors.softRed }]} />
                <View style={styles.categoryInfo}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                    <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>
                            {item.name}
                            <Text style={styles.categoryType}>
                                {item.type === 'expense' ? '  •  Gider' : '  •  Gelir'}
                            </Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.defaultIndicator}>
                    <Icon name="edit" size={20} color={colors.text}></Icon>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderColorPicker = () => (
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
            </View>
            {formErrors.color && <Text style={styles.errorText}>{formErrors.color}</Text>}
        </View>
    );


    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Icon name="category" size={80} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Henüz kategori bulunmuyor</Text>
            <Text style={styles.emptyStateSubtitle}>
                Gezinme çubuğundaki + tuşuna basarak{'\n'}ilk kategorinizi ekleyebilirsiniz.
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title="Kategoriler"
                showRightAction={true}
                rightActionIcon="filter-alt"
                onRightActionPress={() => setFilterModalVisible(true)}
            />

            <View style={styles.content}>
                <FlatList
                    data={filteredCategories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContainer,
                        filteredCategories.length === 0 && styles.emptyListContainer
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
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
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text.charAt(0).toUpperCase() + text.slice(1) }))}
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
                                            styles.typeOption, { backgroundColor: colors.transparentGreen, borderColor: colors.softGreen, borderWidth: 1 },
                                            formData.type === 'income' && { borderColor: colors.border, backgroundColor: colors.success }
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
                                            styles.typeOption, { backgroundColor: colors.transparentRed, borderColor: colors.softRed, borderWidth: 1 },
                                            formData.type === 'expense' && { borderColor: colors.border, backgroundColor: colors.error }
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

                            {renderColorPicker()}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveCategory}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingCategory ? 'Güncelle' : 'Kaydet'}
                                    </Text>
                                </TouchableOpacity>

                                {editingCategory && editingCategory.isDeletable && (
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => {
                                            setModalVisible(false);
                                            handleDeleteCategory(editingCategory);
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

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModalContainer}>
                        <View style={[styles.modalHeader, { paddingHorizontal: 4 }]}>
                            <Text style={styles.modalTitle}>Kategori Filtresi</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.filterOption,
                                selectedFilter === 'all' ? styles.filterOptionActive : styles.filterOptionInactive
                            ]}
                            onPress={() => handleFilterChange('all')}
                        >
                            <View style={[
                                styles.radioButton,
                                selectedFilter === 'all' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {selectedFilter === 'all' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.filterOptionContent}>
                                <Text style={styles.filterOptionTitle}>Tüm Kategoriler</Text>
                                <Text style={styles.filterOptionDescription}>Hem gelir hem gider kategorilerini göster</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterOption,
                                selectedFilter === 'income' ? styles.filterOptionActive : styles.filterOptionInactive
                            ]}
                            onPress={() => handleFilterChange('income')}
                        >
                            <View style={[
                                styles.radioButton,
                                selectedFilter === 'income' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {selectedFilter === 'income' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.filterOptionContent}>
                                <Text style={styles.filterOptionTitle}>Gelir Kategorileri</Text>
                                <Text style={styles.filterOptionDescription}>Sadece gelir kategorilerini göster</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterOption,
                                selectedFilter === 'expense' ? styles.filterOptionActive : styles.filterOptionInactive
                            ]}
                            onPress={() => handleFilterChange('expense')}
                        >
                            <View style={[
                                styles.radioButton,
                                selectedFilter === 'expense' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {selectedFilter === 'expense' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.filterOptionContent}>
                                <Text style={styles.filterOptionTitle}>Gider Kategorileri</Text>
                                <Text style={styles.filterOptionDescription}>Sadece gider kategorilerini göster</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CategoryScreen;
