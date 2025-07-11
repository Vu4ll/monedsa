import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { formatDate, formatCurrency } from "../utils";
import { transactionService } from "../services";

export const TransactionCard = ({ transaction, colors, onEdit, onDelete }) => {
  
  const handleDelete = () => {
    Alert.alert(
      'Transaction Sil',
      'Bu transaction\'ı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.deleteTransaction(transaction.id);
              onDelete && onDelete(transaction.id);
            } catch (error) {
              Alert.alert('Hata', error.message || 'Transaction silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[
      styles.transactionItem,
      { backgroundColor: colors.cardBackground, borderColor: colors.border }
    ]}>
      <View style={styles.transactionHeader}>
        <Text style={[
          styles.transactionAmount, 
          { color: transaction.type === 'income' ? colors.success : colors.error }
        ]}>
          {formatCurrency(transaction.amount)}
        </Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: `${transaction.category.color}` }
          ]}
        >
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
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit && onEdit(transaction)}
          >
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
