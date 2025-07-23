import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { formatDate, formatCurrency } from "../utils";

export const TransactionCard = ({ transaction, colors, onEdit }) => {
  return (
    <View style={[
      styles.transactionItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }
    ]}>
      <TouchableOpacity onPress={() => onEdit && onEdit(transaction)}>
        <View style={styles.transactionHeader}>
          <Text style={[
            styles.transactionAmount, { color: transaction.type === 'income' ? colors.success : colors.error }
          ]}>
            {formatCurrency(transaction.amount)}
          </Text>

          <View style={[styles.categoryBadge, { backgroundColor: `${transaction.category.color}` }]}>
            <Text style={styles.categoryText}>
              {transaction.category.name}
            </Text>
          </View>
        </View>

        <Text style={[styles.transactionDescription, { color: colors.text }]}>
          {transaction.description || "Açıklama bulunmuyor."}
        </Text>

        <View style={styles.transactionFooter}>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  transactionDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});
