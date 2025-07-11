import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getColors } from "../constants";
import { useTransactions } from "../hooks";
import { Header, TransactionList } from "../components";

export const HomeScreen = ({ onLogout }) => {
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);
  const { transactions, loading, refreshing, onRefresh } = useTransactions();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        Alert.alert(
          'İnternet Bağlantısı Yok',
          'Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          'İnternet Bağlantısı Yok',
          'Lütfen internet bağlantınızı kontrol edin.',
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
        animated={true}
      />
      <Header colors={colors} onLogout={onLogout} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.success]}
            tintColor={colors.success}
          />
        }
      >
        <TransactionList transactions={transactions} loading={loading} colors={colors} />
      </ScrollView>

      {transactions?.count && (
        <Text style={{ height: 50, color: colors.text, justifyContent: "center", marginHorizontal: 20 }}>
          Toplam {transactions.count} gider bulundu
        </Text>
      )}

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
});
