import { View, Text, StyleSheet } from "react-native";
import { TransactionCard } from "./TransactionCard";
import { formatCurrency } from "../utils";

export const TransactionList = ({ transactions, loading, colors }) => {
  if (!transactions) {
    return (
      <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
        {loading ? "Veriler yükleniyor..." : "Henüz veri yok."}
      </Text>
    );
  }

  return (
    <View style={styles.transactionList}>
      {transactions.summary && (
        <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground }]}>
          <Text
            style={[styles.summaryLine, { color: colors.error }]}
          >{`Toplam Gider: ${formatCurrency(transactions.summary.totalExpense)}`}</Text>
          <Text
            style={[styles.summaryLine, { color: colors.success }]}
          >{`Toplam Gelir: ${formatCurrency(transactions.summary.totalIncome)}`}</Text>
          <Text
            style={[
              styles.summaryLine,
              {
                color:
                  transactions.summary.balance < 0
                    ? colors.error
                    : colors.success,
              },
            ]}
          >{`Bakiye: ${formatCurrency(transactions.summary.balance)}`}</Text>
        </View>
      )}
      {transactions.data.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          colors={colors}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionList: {
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
