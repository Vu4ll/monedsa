import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text
} from "react-native";
import { getColors } from "../constants";
import { useExpenses } from "../hooks";
import { Header, ExpenseList } from "../components";

export const HomeScreen = ({ onLogout }) => {
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);
  const { expenses, loading, refreshing, onRefresh } = useExpenses();

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
        <ExpenseList expenses={expenses} loading={loading} colors={colors} />
      </ScrollView>

      {expenses?.count && (
        <Text style={{ height: 50, color: colors.text, justifyContent: "center", marginHorizontal: 20 }}>
          Toplam {expenses.count} gider bulundu
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
