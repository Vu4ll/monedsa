import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useTheme } from "../contexts/ThemeContext";
import { Header } from '../components';
import { useCategoryLogic } from '../hooks';
import {
    CategoryItem,
    CategoryModal,
    CategoryFilterModal,
    EmptyState
} from '../components/CategoryScreen';
import { useTranslation } from 'react-i18next';

const CategoryScreen = ({ navigation, route }) => {
    const { t, i18n } = useTranslation();
    const { isDarkMode, colors } = useTheme();
    const {
        // State
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
    } = useCategoryLogic(route, navigation);

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
        emptyListContainer: {
            flexGrow: 1,
        },
    });

    const renderCategory = ({ item }) => (
        <CategoryItem
            item={item}
            colors={colors}
            onEdit={handleEditCategory}
        />
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t("categoryScreen.loading")}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title={t("categoryScreen.header")}
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
                    ListEmptyComponent={() => <EmptyState colors={colors} />}
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

            <CategoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                colors={colors}
                editingCategory={editingCategory}
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                colorOptions={colorOptions}
                onSave={handleSaveCategory}
                onDelete={handleDeleteCategory}
            />

            <CategoryFilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                colors={colors}
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
            />
        </View>
    );
};

export default CategoryScreen;
