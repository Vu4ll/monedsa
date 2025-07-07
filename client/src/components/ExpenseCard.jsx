import { View, Text, StyleSheet } from "react-native";
import { formatDate, formatCurrency } from "../utils";

export const ExpenseCard = ({ expense, colors }) => {
  return (
    <View style={[
      styles.expenseItem,
      { backgroundColor: colors.cardBackground, borderColor: colors.border }
    ]}>
      <View style={styles.expenseHeader}>
        <Text style={[
          styles.expenseAmount, 
          { color: expense.type === 'income' ? colors.success : colors.error }
        ]}>
          {formatCurrency(expense.amount)}
        </Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: `#${expense.category.color}` }
          ]}
        >
          <Text style={styles.categoryText}>
            {expense.category.name}
          </Text>
        </View>
      </View>

      <Text style={[styles.expenseDescription, { color: colors.text }]}>
        {expense.description || "Açıklama bulunmuyor."} {expense.type}
      </Text>

      <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
        {formatDate(expense.createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  expenseItem: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  expenseAmount: {
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
  expenseDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  expenseDate: {
    fontSize: 12,
  },
});
