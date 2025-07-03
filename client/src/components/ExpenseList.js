import { View, Text, StyleSheet } from "react-native";
import { ExpenseCard } from "./ExpenseCard";

export const ExpenseList = ({ expenses, loading, colors }) => {
  if (!expenses) {
    return (
      <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
        {loading ? "Veriler yükleniyor..." : "Henüz veri yok."}
      </Text>
    );
  }

  return (
    <View style={styles.expenseList}>
      <Text style={[styles.summaryText, { color: colors.text }]}>
        Toplam {expenses.count} gider bulundu
      </Text>

      {expenses.data.map((expense) => (
        <ExpenseCard
          key={expense._id}
          expense={expense}
          colors={colors}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  expenseList: {
    flex: 1,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});
