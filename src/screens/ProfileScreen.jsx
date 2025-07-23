import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../contexts/ThemeContext";
import { authService } from '../services';
import { Header } from '../components';

const ProfileScreen = ({ navigation, onLogout }) => {
    const { isDarkMode, colors } = useTheme();
    const [userInfo, setUserInfo] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        username: '',
        email: ''
    });
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Refs for input navigation
    const usernameRef = React.useRef();
    const emailRef = React.useRef();
    const newPasswordRef = React.useRef();
    const confirmPasswordRef = React.useRef();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        await loadUserProfile();
        await loadUserStats();
    };

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
                    joinDate: '01.01.2025'
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
                    totalIncomes: statData?.transactions?.income,
                    totalExpenses: statData?.transactions?.expense,
                    totalTransactions: statData?.transactions?.total,
                });
            } else {
                console.error('İstatistik yükleme hatası:', result.error);
                setUserStats({
                    totalIncomes: "Bulunmuyor",
                    totalExpenses: "Bulunmuyor",
                    totalTransactions: "Bulunmuyor",
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

    const handleEditProfile = () => {
        setEditFormData({
            name: userInfo?.name || '',
            username: userInfo?.username || '',
            email: userInfo?.email || ''
        });
        setFormErrors({});
        setEditModalVisible(true);
    };

    const handleChangePassword = () => {
        setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setPasswordModalVisible(true);
    };

    const validateEditForm = () => {
        const errors = {};

        if (!editFormData.name.trim()) {
            errors.name = 'İsim boş olamaz';
        }

        if (!editFormData.username.trim()) {
            errors.username = 'Kullanıcı adı boş olamaz';
        }

        if (editFormData.username.trim().split(" ").length > 1) {
            errors.username = 'Kullanıcı adı boşluk içeremez';
        }

        if (!editFormData.email.trim()) {
            errors.email = 'E-posta boş olamaz';
        } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
            errors.email = 'Geçerli bir e-posta adresi girin';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordFormData.currentPassword) {
            errors.currentPassword = 'Mevcut parola boş olamaz';
        }

        if (!passwordFormData.newPassword) {
            errors.newPassword = 'Yeni parola boş olamaz';
        } else if (passwordFormData.newPassword.length < 8) {
            errors.newPassword = 'Parola en az 8 karakter olmalı';
        } else if (passwordFormData.newPassword.length > 100) {
            errors.newPassword = 'Parola çok uzun';
        } else if (!/(?=.*[a-z])/.test(passwordFormData.newPassword)) {
            errors.newPassword = 'Parola en az bir küçük harf içermeli';
        } else if (!/(?=.*[A-Z])/.test(passwordFormData.newPassword)) {
            errors.newPassword = 'Parola en az bir büyük harf içermeli';
        } else if (!/(?=.*\d)/.test(passwordFormData.newPassword)) {
            errors.newPassword = 'Parola en az bir rakam içermeli';
        }

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            errors.confirmPassword = 'Parolalar uyuşmuyor';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateEditForm()) return;

        try {
            const result = await authService.updateProfile(editFormData);

            if (result.success) {
                setUserInfo(prev => ({
                    ...prev,
                    name: result.data.name,
                    username: result.data.username,
                    email: result.data.email
                }));
                setEditModalVisible(false);
                ToastAndroid.show('Profil başarıyla güncellendi', ToastAndroid.SHORT);
            } else {
                setEditModalVisible(false);
                ToastAndroid.show(result.error, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Profil güncellenirken bir hata oluştu', ToastAndroid.SHORT);
        }
    };

    const handleSavePassword = async () => {
        if (!validatePasswordForm()) return;

        try {
            const result = await authService.changePassword({
                currentPassword: passwordFormData.currentPassword,
                newPassword: passwordFormData.newPassword
            });

            if (result.success) {
                setPasswordModalVisible(false);
                ToastAndroid.show('Parola başarıyla değiştirildi', ToastAndroid.SHORT);
            } else {
                setPasswordModalVisible(false);
                ToastAndroid.show(result.error, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Parola değiştirilirken bir hata oluştu', ToastAndroid.SHORT);
        }
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
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalCloseButton: {
            padding: 4,
        },
        modalContent: {
            padding: 20,
        },
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.background,
        },
        inputError: {
            borderColor: colors.danger,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
        },
        saveButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: 'center',
        },
        saveButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.white,
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

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>Üyelik Tarihi</Text>
                            <Text style={styles.infoValue}>{userInfo?.joinDate || '01.01.2024'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>İstatistikler</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Toplam Gelir Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalIncomes || "Bulunmuyor"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Toplam Gider Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalExpenses || "Bulunmuyor"}</Text>
                        </View>

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>Toplam İşlem Sayısı</Text>
                            <Text style={styles.infoValue}>{userStats?.totalTransactions || "Bulunmuyor"}</Text>
                        </View>
                    </View>

                    <View style={styles.actionSection}>
                        <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>

                        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
                            <Icon name="edit" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Profili Düzenle</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.lastActionButton]} onPress={handleChangePassword}>
                            <Icon name="security" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Parola Değiştir</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Profil Düzenleme Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profili Düzenle</Text>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>İsim</Text>
                                <TextInput
                                    style={[styles.input, formErrors.name && styles.inputError]}
                                    value={editFormData.name}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, name: text }))}
                                    placeholder="İsminizi girin"
                                    placeholderTextColor={colors.textSecondary}
                                    returnKeyType="next"
                                    onSubmitEditing={() => usernameRef.current?.focus()}
                                />
                                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
                                <TextInput
                                    ref={usernameRef}
                                    style={[styles.input, formErrors.username && styles.inputError]}
                                    value={editFormData.username}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, username: text }))}
                                    placeholder="Kullanıcı adınızı girin"
                                    placeholderTextColor={colors.textSecondary}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                                {formErrors.username && <Text style={styles.errorText}>{formErrors.username}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>E-posta</Text>
                                <TextInput
                                    ref={emailRef}
                                    style={[styles.input, formErrors.email && styles.inputError]}
                                    value={editFormData.email}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, email: text }))}
                                    placeholder="E-posta adresinizi girin"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    onSubmitEditing={handleSaveProfile}
                                />
                                {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveProfile}
                                >
                                    <Text style={styles.saveButtonText}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Parola Değiştirme Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Parola Değiştir</Text>
                            <TouchableOpacity
                                onPress={() => setPasswordModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Mevcut Parola</Text>
                                <TextInput
                                    style={[styles.input, formErrors.currentPassword && styles.inputError]}
                                    value={passwordFormData.currentPassword}
                                    onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, currentPassword: text }))}
                                    placeholder="Mevcut parolanızı girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                    returnKeyType="next"
                                    onSubmitEditing={() => newPasswordRef.current?.focus()}
                                />
                                {formErrors.currentPassword && <Text style={styles.errorText}>{formErrors.currentPassword}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Yeni Parola</Text>
                                <TextInput
                                    ref={newPasswordRef}
                                    style={[styles.input, formErrors.newPassword && styles.inputError]}
                                    value={passwordFormData.newPassword}
                                    onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, newPassword: text }))}
                                    placeholder="Yeni parolanızı girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                />
                                {formErrors.newPassword && <Text style={styles.errorText}>{formErrors.newPassword}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Yeni Parola Tekrar</Text>
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={[styles.input, formErrors.confirmPassword && styles.inputError]}
                                    value={passwordFormData.confirmPassword}
                                    onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, confirmPassword: text }))}
                                    placeholder="Yeni parolanızı tekrar girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                    returnKeyType="done"
                                    onSubmitEditing={handleSavePassword}
                                />
                                {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSavePassword}
                                >
                                    <Text style={styles.saveButtonText}>Değiştir</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ProfileScreen;
