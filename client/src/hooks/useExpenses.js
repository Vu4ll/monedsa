import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { expenseService } from "../services";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
      console.log("Expenses fetched:", data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      Alert.alert("Hata", "Veri çekilirken bir hata oluştu. Sunucunun çalıştığından emin olun.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
      console.log("Expenses refreshed:", data);
    } catch (error) {
      console.error("Error refreshing expenses:", error);
      Alert.alert("Hata", "Veri yenilenirken bir hata oluştu. Sunucunun çalıştığından emin olun.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    refreshing,
    onRefresh,
    fetchExpenses,
  };
};
