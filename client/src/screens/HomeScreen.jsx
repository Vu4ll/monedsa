import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ToastAndroid,
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getColors } from "../constants";
import { useTransactions } from "../hooks";
import { Header, TransactionList } from "../components";

export const HomeScreen = ({ onLogout, navigation, route }) => {
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);

  // Filtreleme ve sıralama state'leri
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
    sortBy: '',
    sortOrder: 'desc'
  });

  const { transactions, loading, refreshing, onRefresh, fetchTransactions } = useTransactions(filters);

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

  // Sıralama fonksiyonları
  const handleSort = () => {
    setSortModalVisible(true);
  };

  const applySorting = (sortBy, sortOrder) => {
    const newSortOptions = { sortBy, sortOrder };
    setSortOptions(newSortOptions);
    const newFilters = { ...filters, ...newSortOptions };
    setFilters(newFilters);
    fetchTransactions(newFilters);
    setSortModalVisible(false);
    ToastAndroid.show(`${sortBy === 'amount' ? 'Tutara' : 'Tarihe'} göre ${sortOrder === 'asc' ? 'artan' : 'azalan'} sıralandı`, ToastAndroid.SHORT);
  };

  // Filtreleme fonksiyonları
  const handleFilter = () => {
    setTempFilters({
      category: filters.category || '',
      type: filters.type || '',
      minAmount: filters.minAmount || '',
      maxAmount: filters.maxAmount || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    });
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    const cleanFilters = {};
    Object.keys(tempFilters).forEach(key => {
      if (tempFilters[key] && tempFilters[key].toString().trim() !== '') {
        cleanFilters[key] = tempFilters[key];
      }
    });

    const newFilters = { ...cleanFilters, ...sortOptions };
    setFilters(newFilters);
    fetchTransactions(newFilters);
    setFilterModalVisible(false);
    ToastAndroid.show("Filtreler uygulandı", ToastAndroid.SHORT);
  };

  const clearFilters = () => {
    setTempFilters({
      category: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    });
    setFilters({ ...sortOptions });
    fetchTransactions({ ...sortOptions });
    setFilterModalVisible(false);
    ToastAndroid.show("Filtreler temizlendi", ToastAndroid.SHORT);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <Header
        colors={colors}
        showLeftAction={true}
        leftActionIcon="sort"
        onLeftActionPress={handleSort}
        showRightAction={true}
        rightActionIcon="filter-alt"
        onRightActionPress={handleFilter}
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

      {/* Sıralama Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sıralama</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sıralama Kriteri</Text>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={() => applySorting('date', 'desc')}
              >
                <Icon name="schedule" size={20} color={colors.primary} />
                <Text style={[styles.optionText, { color: colors.text }]}>Tarihe göre (Yeni → Eski)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={() => applySorting('date', 'asc')}
              >
                <Icon name="schedule" size={20} color={colors.primary} />
                <Text style={[styles.optionText, { color: colors.text }]}>Tarihe göre (Eski → Yeni)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={() => applySorting('amount', 'desc')}
              >
                <Icon name="trending-down" size={20} color={colors.primary} />
                <Text style={[styles.optionText, { color: colors.text }]}>Tutara göre (Yüksek → Düşük)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: colors.background }]}
                onPress={() => applySorting('amount', 'asc')}
              >
                <Icon name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.optionText, { color: colors.text }]}>Tutara göre (Düşük → Yüksek)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filtreleme Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filtreler</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Tip Filtresi */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>İşlem Tipi</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: colors.transparentGreen, borderColor: colors.softGreen, borderWidth: 1 },
                    tempFilters.type === 'income' && { backgroundColor: colors.success }
                  ]}
                  onPress={() => setTempFilters(prev => ({
                    ...prev,
                    type: prev.type === 'income' ? '' : 'income'
                  }))}
                >
                  <Text style={[styles.typeText, { color: colors.text }]}>Gelir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: colors.transparentRed, borderColor: colors.softRed, borderWidth: 1 },
                    tempFilters.type === 'expense' && { backgroundColor: colors.error }
                  ]}
                  onPress={() => setTempFilters(prev => ({
                    ...prev,
                    type: prev.type === 'expense' ? '' : 'expense'
                  }))}
                >
                  <Text style={[styles.typeText, { color: colors.text }]}>Gider</Text>
                </TouchableOpacity>
              </View>

              {/* Kategori Filtresi */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategori</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tempFilters.category}
                onChangeText={(text) => setTempFilters(prev => ({ ...prev, category: text }))}
                placeholder="Kategori adı girin"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Tutar Filtresi */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tutar Aralığı</Text>
              <View style={styles.amountContainer}>
                <TextInput
                  style={[styles.amountInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={tempFilters.minAmount}
                  onChangeText={(text) => setTempFilters(prev => ({ ...prev, minAmount: text }))}
                  placeholder="Min tutar"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={[styles.amountSeparator, { color: colors.textSecondary }]}>-</Text>
                <TextInput
                  style={[styles.amountInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={tempFilters.maxAmount}
                  onChangeText={(text) => setTempFilters(prev => ({ ...prev, maxAmount: text }))}
                  placeholder="Max tutar"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {/* Tarih Filtresi */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tarih Aralığı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tempFilters.startDate}
                onChangeText={(text) => setTempFilters(prev => ({ ...prev, startDate: text }))}
                placeholder="Başlangıç tarihi (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tempFilters.endDate}
                onChangeText={(text) => setTempFilters(prev => ({ ...prev, endDate: text }))}
                placeholder="Bitiş tarihi (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Butonlar */}
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, styles.applyButton, { backgroundColor: colors.primary }]}
                  onPress={applyFilters}
                >
                  <Text style={[styles.filterButtonText, { color: colors.white }]}>Uygula</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterButton, styles.clearButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={clearFilters}
                >
                  <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>Temizle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '70%',
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
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  // Sıralama stilleri
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  // Filtreleme stilleri
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
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  amountSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
  },
  applyButton: {
    // backgroundColor will be set dynamically
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
