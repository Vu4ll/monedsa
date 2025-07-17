import { View, Text, StyleSheet } from "react-native";
import { TransactionCard } from "./TransactionCard";
import { formatCurrency } from "../utils";
import Icon from 'react-native-vector-icons/MaterialIcons';

export const TransactionList = ({ transactions, loading, colors, navigation }) => {

  const handleEdit = (transaction) => navigation.navigate('AddTransactionStack', { transaction });

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
        <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.summaryGrid}>
            {/* Toplam Gelir */}
            <View style={[styles.summaryItem, styles.incomeItem]}>
              <View style={[styles.summaryIconContainer, { backgroundColor: colors.softGreen }]}>
                <Text style={[styles.summaryIcon, { color: colors.white }]}>
                  <Icon name="trending-up" size={24} />
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Toplam Gelir</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {formatCurrency(transactions.summary.totalIncome)}
                </Text>
              </View>
            </View>

            {/* Toplam Gider */}
            <View style={[styles.summaryItem, styles.expenseItem]}>
              <View style={[styles.summaryIconContainer, { backgroundColor: colors.softRed }]}>
                <Text style={[styles.summaryIcon, { color: colors.white }]}>
                  <Icon name="trending-down" size={24} />
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Toplam Gider</Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  {formatCurrency(transactions.summary.totalExpense)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bakiye */}
          <View style={[styles.balanceContainer, {
            backgroundColor: transactions.summary.balance >= 0 ? colors.transparentGreen : colors.transparentRed,
          }]}>
            <View style={styles.balanceContent}>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Bakiye</Text>
              <Text style={[styles.balanceValue, {
                color: transactions.summary.balance >= 0 ? colors.success : colors.error
              }]}>
                {formatCurrency(transactions.summary.balance)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {transactions.data.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          colors={colors}
          onEdit={handleEdit}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  transactionList: {
    flex: 1,
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  incomeItem: {
    backgroundColor: 'rgba(57, 190, 86, 0.08)',
  },
  expenseItem: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    borderRadius: 12,
    marginLeft: 6,
    marginRight: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
