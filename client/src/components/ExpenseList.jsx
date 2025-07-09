import { View, Text, StyleSheet } from "react-native";
import { ExpenseCard } from "./ExpenseCard";
import { formatCurrency } from "../utils";

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
      {expenses.summary && (
        <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground }]}>
          <Text
            style={[styles.summaryLine, { color: colors.error }]}
          >{`Toplam Gider: ${formatCurrency(expenses.summary.totalExpense)}`}</Text>
          <Text
            style={[styles.summaryLine, { color: colors.success }]}
          >{`Toplam Gelir: ${formatCurrency(expenses.summary.totalIncome)}`}</Text>
          <Text
            style={[
              styles.summaryLine,
              {
                color:
                  expenses.summary.balance < 0
                    ? colors.error
                    : colors.success,
              },
            ]}
          >{`Bakiye: ${formatCurrency(expenses.summary.balance)}`}</Text>
        </View>
      )}
      {expenses.data.map((expense) => (
        <ExpenseCard
          key={expense.id}
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
  summaryBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  summaryLine: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
});
