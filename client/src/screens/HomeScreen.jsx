import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  Alert,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { getColors } from "../constants";
import { useTransactions } from "../hooks";
import { Header, TransactionList } from "../components";

export const HomeScreen = ({ onLogout, navigation, route }) => {
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

  useEffect(() => {
    if (route?.params?.refresh) {
      onRefresh();
      navigation.setParams({ refresh: undefined });
    }
  }, [route?.params?.refresh]);

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <Header
        colors={colors}
        showLeftAction={true}
        leftActionIcon="filter-list"
        onLeftActionPress={() => {ToastAndroid.show("Sıralama", ToastAndroid.SHORT)}}
        showRightAction={true}
        rightActionIcon="filter-alt"
        onRightActionPress={() => {ToastAndroid.show("Filtreleme", ToastAndroid.SHORT)}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
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
