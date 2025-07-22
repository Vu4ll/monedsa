import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { transactionService } from "../services";

/**
 * @description Custom hook to manage transactions.
 * This hook fetches transactions, handles loading states, and manages errors.
 */
export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  /**
   * @description Fetches transactions from the server.
   * @param { Object } queryParams - Query parameters for filtering and sorting
   * @returns { Promise<void> }
   */
  const fetchTransactions = async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);
    
    try {
      const data = await transactionService.getTransaction(queryParams);
      setTransactions(data);
      console.log("Transactions fetched");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIsEmpty(true);
        setTransactions(null);
      } else if (error.message && (error.message.includes('Token') || error.message.includes('token'))) {
        setError("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        Alert.alert("Oturum Süresi Doldu", "Lütfen tekrar giriş yapın.");
      } else {
        setError("Veri çekilirken bir hata oluştu. Sunucunun çalıştığından emin olun.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Refreshes the transactions data.
   * @param { Object } queryParams - Query parameters for filtering and sorting
   * @returns { Promise<void> }
   */
  const onRefresh = async (queryParams = {}) => {
    setRefreshing(true);
    setError(null);
    setIsEmpty(false);
    // Refresh sırasında mevcut transactions'ı temizleme
    
    try {
      const data = await transactionService.getTransaction(queryParams);
      setTransactions(data);
      console.log("Transactions refreshed");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIsEmpty(true);
        setTransactions(null);
      } else if (error.message && (error.message.includes('Token') || error.message.includes('token'))) {
        setError("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        Alert.alert("Oturum Süresi Doldu", "Lütfen tekrar giriş yapın.");
      } else {
        setError("Veri yenilenirken bir hata oluştu. Sunucunun çalıştığından emin olun.");
        Alert.alert("Hata", "Veri yenilenirken bir hata oluştu. Sunucunun çalıştığından emin olun.");
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions(filters);
  }, []);

  // Filters değiştiğinde yeniden veri çek
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchTransactions(filters);
    }
  }, [filters]);

  return {
    transactions,
    loading,
    refreshing,
    onRefresh,
    fetchTransactions,
    error,
    isEmpty,
  };
};
