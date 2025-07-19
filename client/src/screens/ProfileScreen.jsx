import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    useColorScheme,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getColors } from '../constants';
import { authService } from '../services';
import { Header } from '../components';

const ProfileScreen = ({ navigation, onLogout }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const colors = getColors(isDarkMode);
    const [userInfo, setUserInfo] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProfile();
        loadUserStats();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const result = await authService.getProfile();

            if (result.success) {
                const profileData = result.data;
                setUserInfo({
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    username: profileData.username,
                    role: profileData.role,
                    joinDate: new Date(profileData.createdAt).toLocaleDateString('tr-TR')
                });
            } else {
                Alert.alert('Hata', result.error);
                setUserInfo({
                    name: 'Kullanıcı',
                    email: 'email@example.com',
                    username: 'kullanici123',
                    role: 'user',
                    joinDate: '01.01.2024'
                });
            }
        } catch (error) {
            console.error('Profil yükleme hatası:', error);
            Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const loadUserStats = async () => {
        try {
            setLoading(true);
            const result = await authService.getStats();

            const statData = result.data;
            if (result.success) {
                setUserStats({
                    totalIncomes: statData.transactions.income,
                    totalExpenses: statData.transactions.expense,
                    totalTransactions: statData.transactions.total,
                    totalCategories: statData.categories.userOwned,
                });
            } else {
                console.error('İstatistik yükleme hatası:', result.error);
                setUserStats({
                    totalIncomes: 0, totalExpenses: 0,
                    totalTransactions: 0, totalCategories: 0,
                });
            }
        } catch (error) {
            console.error('Profil istatistik hatası:', error);
            Alert.alert('Hata', 'Profil istatistikleri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 20,
        },
        profileHeader: {
            marginBottom: 30,
            paddingHorizontal: 0,
        },
        profileMainInfo: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatarContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 20,
        },
        avatarText: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.white,
        },
        profileDetails: {
            flex: 1,
        },
        userName: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        userEmail: {
            fontSize: 15,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        userRole: {
            fontSize: 13,
            color: colors.primary,
            fontWeight: '600',
            paddingHorizontal: 12,
            paddingVertical: 4,
            backgroundColor: colors.primary + '20',
            borderRadius: 12,
            alignSelf: 'flex-start',
        },
        infoSection: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastInfoRow: {
            borderBottomWidth: 0,
            paddingBottom: 0
        },
        infoLabel: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        infoValue: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        actionSection: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastActionButton: {
            borderBottomWidth: 0,
            paddingBottom: 0
        },
        actionIcon: {
            marginRight: 16,
        },
        actionText: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title="Profil"
                showLeftAction={true}
                onLeftActionPress={() => navigation.goBack()}
                showRightAction={true}
                rightActionIcon='logout'
                rightIconColor={colors.softRed}
                onRightActionPress={handleLogout}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileMainInfo}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>

                            <View style={styles.profileDetails}>
                                <Text style={styles.userName}>{userInfo?.name || 'Kullanıcı'}</Text>
                                <Text style={styles.userEmail}>{userInfo?.email || 'email@example.com'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Kullanıcı Adı</Text>
                            <Text style={styles.infoValue}>{userInfo?.username || 'kullanici123'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>E-posta</Text>
                            <Text style={styles.infoValue}>{userInfo?.email || 'email@example.com'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Rol</Text>
                            <Text style={styles.infoValue}>
                                {userInfo?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                            </Text>
                        </View>

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>Üyelik Tarihi</Text>
                            <Text style={styles.infoValue}>{userInfo?.joinDate || '01.01.2024'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>İstatistikler</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Toplam Kullanıcı Kategori Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalCategories || 0}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Toplam Gelir Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalIncomes || 0}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Toplam Gider Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalExpenses || 0}</Text>
                        </View>

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>Toplam İşlem Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalTransactions || 0}</Text>
                        </View>
                    </View>

                    <View style={styles.actionSection}>
                        <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>

                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="edit" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Profili Düzenle</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.lastActionButton]}>
                            <Icon name="security" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Şifre Değiştir</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default ProfileScreen;
