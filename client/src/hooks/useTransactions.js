import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { transactionService } from "../services";

/**
 * @description Custom hook to manage transactions.
 * This hook fetches transactions, handles loading states, and manages errors.
 */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  /**
   * @description Fetches transactions from the server.
   * @returns { Promise<void> }
   */
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);
    
    try {
      const data = await transactionService.getTransaction();
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
   * @returns { Promise<void> }
   */
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setIsEmpty(false);
    // Refresh sırasında mevcut transactions'ı temizleme
    
    try {
      const data = await transactionService.getTransaction();
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
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    refreshing,
    onRefresh,
    fetchTransactions,
  };
};
