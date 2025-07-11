import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { authService } from "../services";

export const Header = ({ colors, onLogout, navigation }) => {
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
    <View style={[styles.header, { backgroundColor: colors.headerBackgroud }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Gider Takip
      </Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.actionButtonText}>+ Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('Category')}
        >
          <Text style={styles.actionButtonText}>Kategoriler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Çıkış
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 36,
    position: 'relative',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
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
