import {
  StatusBar,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import React, { useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { useTransactions, useFilters } from "../hooks";
import { Header, TransactionList, SortModal, FilterModal } from "../components";
import { useTheme } from "../contexts/ThemeContext";

export const HomeScreen = ({ onLogout, navigation, route }) => {
  const { isDarkMode, colors } = useTheme();

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
});
