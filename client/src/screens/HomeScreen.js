import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { getColors } from "../constants";
import { useExpenses } from "../hooks";
import { Header, ExpenseList } from "../components";

export const HomeScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);
  const { expenses, loading, refreshing, onRefresh } = useExpenses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
        animated={true}
      />
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
        <Header colors={colors} />
        <ExpenseList expenses={expenses} loading={loading} colors={colors} />
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
    padding: 20,
    paddingTop: 0,
  },
});
