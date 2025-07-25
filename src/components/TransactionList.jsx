import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TransactionCard } from "./TransactionCard";
import { formatCurrency } from "../utils";
import Icon from 'react-native-vector-icons/MaterialIcons';

export const TransactionList = ({ transactions, loading, colors, navigation, onRefresh, onFilterChange }) => {

  const handleEdit = (transaction) => navigation.navigate('AddTransactionStack', {
    transaction,
    onRefresh
  });

  const handleFilterByType = (type) => {
    if (onFilterChange) {
      if (type === 'all') {
        onFilterChange({ type: '', category: '', sortBy: '', order: '' });
      } else {
        onFilterChange({ type, category: '', sortBy: '', order: '' });
      }
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="receipt-long" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Henüz işlem bulunmuyor</Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
        Gezinme çubuğundaki + tuşuna basarak{'\n'}ilk işleminizi ekleyebilirsiniz.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Veriler yükleniyor...
      </Text>
    </View>
  );

  if (loading && !transactions) {
    return renderLoadingState();
  }

  if (!loading && (!transactions || (transactions?.data && transactions?.data?.length === 0))) {
    return renderEmptyState();
  }

  if (!transactions) {
    return renderLoadingState();
  }

  return (
    <View style={styles.transactionList}>
      {transactions.summary && (
        <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.summaryGrid}>
            {/* Toplam Gelir */}
            <TouchableOpacity
              style={[styles.summaryItem, styles.incomeItem]}
              onPress={() => handleFilterByType('income')}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>

            {/* Toplam Gider */}
            <TouchableOpacity
              style={[styles.summaryItem, styles.expenseItem]}
              onPress={() => handleFilterByType('expense')}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>
          </View>

          {/* Bakiye */}
          <TouchableOpacity
            style={[styles.balanceContainer, {
              backgroundColor: transactions.summary.balance >= 0 ? colors.transparentGreen : colors.transparentRed,
            }]}
            onPress={() => handleFilterByType('all')}
            activeOpacity={0.7}
          >
            <View style={styles.balanceContent}>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Bakiye</Text>
              <Text style={[styles.balanceValue, {
                color: transactions.summary.balance >= 0 ? colors.success : colors.error
              }]}>
                {formatCurrency(transactions.summary.balance)}
              </Text>
            </View>
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});
