import {
  StatusBar,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { useTransactions, useFilters } from "../hooks";
import { Header, TransactionList, SortModal, FilterModal } from "../components";
import { useTheme } from "../contexts/ThemeContext";
import { useCurrency } from "../contexts/CurrencyContext";

export const HomeScreen = ({ onLogout, navigation, route }) => {
  const { isDarkMode, colors } = useTheme();
  const { currency } = useCurrency();
  const { t } = useTranslation();

  const {
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
  } = useFilters();

  const { transactions, loading, refreshing, onRefresh, fetchTransactions } = useTransactions(filters);

  const handleApplySorting = (sortBy, sortOrder) => {
    applySorting(sortBy, sortOrder, fetchTransactions);
  };

  const handleApplyFilters = () => {
    applyFilters(fetchTransactions);
  };

  const handleClearFilters = () => {
    clearFilters(fetchTransactions);
  };

  useEffect(() => {
    if (route?.params?.refresh) {
      onRefresh(filters);
      navigation.setParams({ refresh: undefined });
    }
  }, [route?.params?.refresh]);

  useEffect(() => {
    if (transactions) {
      onRefresh(filters);
    }
  }, [currency]);

  useFocusEffect(
    React.useCallback(() => {
      if (!transactions && !loading) {
        onRefresh(filters);
      }
    }, [transactions, loading])
  );

  return (
    <SafeAreaView style={styles.container(colors)}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <Header
        colors={colors}
        showLeftAction={true}
        leftActionIcon="sort"
        onLeftActionPress={handleSort}
        showRightAction={true}
        rightActionIcon="filter-alt"
        onRightActionPress={handleFilter}
        showLogo={true}
      />

      <TouchableOpacity
        style={styles.exportBanner(colors)}
        onPress={() => navigation.navigate("SettingsStack")}
        activeOpacity={0.8}
      >
        <Icon name="warning" size={22} color={colors.error} />
        <View style={styles.exportBannerContent}>
          <Text style={styles.exportBannerTitle(colors)}>{t("homeScreen.exportBanner.title")}</Text>
          <Text style={styles.exportBannerDescription(colors)}>{t("homeScreen.exportBanner.description")}</Text>
        </View>
        <Icon name="chevron-right" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh(filters)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <TransactionList
          transactions={transactions}
          loading={loading}
          colors={colors}
          navigation={navigation}
          onRefresh={() => onRefresh(filters)}
          onFilterChange={(newFilters) => {
            const filterParams = {
              ...filters,
              type: newFilters.type || '',
              category: newFilters.category || ''
            };

            if (newFilters.type === '') {
              filterParams.type = '';
              filterParams.category = '';
            }

            fetchTransactions(filterParams);
          }}
        />
      </ScrollView>

      <SortModal
        visible={sortModalVisible}
        onClose={closeSortModal}
        onApplySort={handleApplySorting}
        colors={colors}
        currentSortBy={sortOptions.sortBy}
        currentSortOrder={sortOptions.sortOrder}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={closeFilterModal}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: (colors) => ({
    flex: 1,
    backgroundColor: colors.background,
  }),
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  exportBanner: (colors) => ({
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.error + "15",
  }),
  exportBannerContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  exportBannerTitle: (colors) => ({
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  }),
  exportBannerDescription: (colors) => ({
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  }),
});
