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
    useColorScheme
} from 'react-native';
import { getColors } from '../constants';
import { categoryService } from '../services';

const CategoryScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const colors = getColors(isDarkMode);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#FF6B6B',
        type: 'expense'
    });
    const [formErrors, setFormErrors] = useState({});

    // Renkler
    const colorOptions = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await categoryService.getCategories();
            if (result.success) {
                setCategories(result.data);
            } else {
                Alert.alert('Hata', result.error);
            }
        } catch (error) {
            Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
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
                loadCategories();
                Alert.alert('Başarılı', editingCategory ? 'Kategori güncellendi' : 'Kategori eklendi');
            } else {
                Alert.alert('Hata', result.error);
            }
        } catch (error) {
            Alert.alert('Hata', 'Kategori kaydedilirken bir hata oluştu');
        }
    };

    const handleDeleteCategory = async (category) => {
        Alert.alert(
            'Kategori Sil',
            `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await categoryService.deleteCategory(category.id);
                            if (result.success) {
                                loadCategories();
                                Alert.alert('Başarılı', 'Kategori silindi');
                            } else {
                                Alert.alert('Hata', result.error);
                            }
                        } catch (error) {
                            Alert.alert('Hata', 'Kategori silinirken bir hata oluştu');
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
            type: category.type
        });
        setModalVisible(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#FF6B6B',
            type: 'expense'
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 10,
            color: colors.textSecondary,
            fontSize: 16,
        },
        header: {
            paddingTop: 36,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: colors.primary,
        },
        backButton: {
            paddingVertical: 5,
        },
        backButtonText: {
            color: colors.white,
            fontSize: 16,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.white,
        },
        addButton: {
            paddingVertical: 5,
        },
        addButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        listContainer: {
            paddingHorizontal: 20,
            paddingVertical: 10,
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
            color: colors.textPrimary,
        },
        categoryType: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 2,
        },
        categoryActions: {
            flexDirection: 'row',
            gap: 10,
        },
        editButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.primary,
            borderRadius: 6,
        },
        editButtonText: {
            color: colors.white,
            fontSize: 14,
            fontWeight: '600',
        },
        deleteButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.danger,
            borderRadius: 6,
        },
        deleteButtonText: {
            color: colors.white,
            fontSize: 14,
            fontWeight: '600',
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
            padding: 20,
        },
        modalContent: {
            flexGrow: 1,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.textPrimary,
            marginBottom: 20,
            textAlign: 'center',
        },
        inputContainer: {
            marginBottom: 16,
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
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.textPrimary,
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
            borderColor: colors.border,
            alignItems: 'center',
        },
        selectedType: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        typeOptionText: {
            fontSize: 16,
            color: colors.textPrimary,
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
            color: colors.textPrimary,
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
            borderColor: colors.textPrimary,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
        },
        cancelButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        cancelButtonText: {
            color: colors.textSecondary,
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

    const renderCategory = ({ item }) => (
        <View style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryType}>
                        {item.type === 'expense' ? 'Gider' : 'Gelir'}
                        {item.isDefault && ' • Varsayılan'}
                    </Text>
                </View>
            </View>

            {!item.isDefault && (
                <View style={styles.categoryActions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditCategory(item)}
                    >
                        <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCategory(item)}
                    >
                        <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderColorPicker = () => (
        <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerLabel}>Renk Seçin:</Text>
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            <SafeAreaView style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home', { refresh: true })}
                >
                    <Text style={styles.backButtonText}>← Geri</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Kategoriler</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCategory}
                >
                    <Text style={styles.addButtonText}>+ Ekle</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Kategori Adı</Text>
                                <TextInput
                                    style={[styles.input, formErrors.name && styles.inputError]}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
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
                                            formData.type === 'expense' && styles.selectedType
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
                                    <TouchableOpacity
                                        style={[
                                            styles.typeOption,
                                            formData.type === 'income' && styles.selectedType
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
                                </View>
                                {formErrors.type && <Text style={styles.errorText}>{formErrors.type}</Text>}
                            </View>

                            {renderColorPicker()}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveCategory}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingCategory ? 'Güncelle' : 'Kaydet'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CategoryScreen;
