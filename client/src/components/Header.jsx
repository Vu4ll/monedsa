import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { authService } from "../services";

export const Header = ({ colors, onLogout }) => {
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış',
      'Hesabınızdan çıkış yapmak istediğimize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            if (onLogout) await onLogout();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        Expense Tracker
      </Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: colors.error }]}>
          Çıkış Yap
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 36,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
