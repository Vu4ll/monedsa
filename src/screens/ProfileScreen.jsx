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
import { useTranslation } from 'react-i18next';

const ProfileScreen = ({ navigation, onLogout }) => {
    const { t, i18n } = useTranslation();
    const localeMap = { tr: 'tr-TR', en: 'en-US', nl: 'nl-NL' };
    const { isDarkMode, colors } = useTheme();
    const [userInfo, setUserInfo] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
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
                    joinDate: new Date(profileData.createdAt).toLocaleDateString(localeMap[i18n.language] || 'en-US')
                });
            } else {
                setUserInfo({
                    name: t("profileScreen.loadUserProfile.name"),
                    email: 'email@example.com',
                    username: t("profileScreen.loadUserProfile.username"),
                    joinDate: new Date("2025-01-01").toLocaleDateString(localeMap[i18n.language] || 'en-US')
                });
            }
        } catch (error) {
            console.error('Profile data error', error);
            ToastAndroid.show(t("profileScreen.loadUserProfile.error"), ToastAndroid.SHORT);
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
                setUserStats({
                    totalIncomes: t("profileScreen.stats.noData"),
                    totalExpenses: t("profileScreen.stats.noData"),
                    totalTransactions: t("profileScreen.stats.noData"),
                });
            }
        } catch (error) {
            console.error('Profile stats error:', error);
            ToastAndroid.show(t("profileScreen.loadUserStats"), ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            t("profileScreen.handleLogout.logout"),
            t("profileScreen.handleLogout.confirm"),
            [
                { text: t("common.cancel"), style: 'cancel' },
                {
                    text: t("profileScreen.handleLogout.logout"),
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
            errors.name = t("profileScreen.validateEditForm.name");
        }

        if (!editFormData.username.trim()) {
            errors.username = t("profileScreen.validateEditForm.username");
        }

        if (editFormData.username.trim().split(" ").length > 1) {
            errors.username = t("profileScreen.validateEditForm.usernameSpace");
        }

        if (!editFormData.email.trim()) {
            errors.email = t("profileScreen.validateEditForm.emptyEmail");
        } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
            errors.email = t("profileScreen.validateEditForm.invalidEmail");
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordFormData.currentPassword) {
            errors.currentPassword = t("profileScreen.validatePasswordForm.emptyCurrent");
        }

        if (!passwordFormData.newPassword) {
            errors.newPassword = t("profileScreen.validatePasswordForm.emptyNew");
        } else if (passwordFormData.newPassword.length < 8) {
            errors.newPassword = t("profileScreen.validatePasswordForm.minLength");
        } else if (passwordFormData.newPassword.length > 100) {
            errors.newPassword = t("profileScreen.validatePasswordForm.tooLong");
        } else if (!/(?=.*[a-z])/.test(passwordFormData.newPassword)) {
            errors.newPassword = t("profileScreen.validatePasswordForm.lowercase");
        } else if (!/(?=.*[A-Z])/.test(passwordFormData.newPassword)) {
            errors.newPassword = t("profileScreen.validatePasswordForm.uppercase");
        } else if (!/(?=.*\d)/.test(passwordFormData.newPassword)) {
            errors.newPassword = t("profileScreen.validatePasswordForm.number");
        }

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            errors.confirmPassword = t("profileScreen.validatePasswordForm.noMatch");
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
                ToastAndroid.show(t("profileScreen.handleSaveProfile.success"), ToastAndroid.SHORT);
            } else {
                if (result.error.includes(t("authService.updateProfile.noChanges"))) setEditModalVisible(false);
                ToastAndroid.show(result.error, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(t("profileScreen.handleSaveProfile.error"), ToastAndroid.SHORT);
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
                ToastAndroid.show(t("profileScreen.handleSavePassword.success"), ToastAndroid.SHORT);
            } else {
                setPasswordModalVisible(false);
                ToastAndroid.show(result.error, ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show(t("profileScreen.handleSavePassword.error"), ToastAndroid.SHORT);
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
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.background,
        },
        passwordInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.background,
        },
        passwordInput: {
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            borderWidth: 0,
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
        passwordToggle: {
            padding: 12,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title={t("profileScreen.header")}
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
                    <Text style={styles.loadingText}>{t("profileScreen.loading")}</Text>
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
                                <Text style={styles.userName}>{userInfo?.name || t("profileScreen.loadUserProfile.name")}</Text>
                                <Text style={styles.userEmail}>{userInfo?.email || 'email@example.com'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>{t("profileScreen.userInfo.title")}</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t("profileScreen.userInfo.username")}</Text>
                            <Text style={styles.infoValue}>{userInfo?.username || 'user123'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t("profileScreen.userInfo.email")}</Text>
                            <Text style={styles.infoValue}>{userInfo?.email || 'email@example.com'}</Text>
                        </View>

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>{t("profileScreen.userInfo.joinDate")}</Text>
                            <Text style={styles.infoValue}>{userInfo?.joinDate || '01.01.2025'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>{t("profileScreen.stats.title")}</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t("profileScreen.stats.totalIncomes")}</Text>
                            <Text style={styles.infoValue}>{userStats?.totalIncomes || t("profileScreen.stats.noData")}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t("profileScreen.stats.totalExpenses")}</Text>
                            <Text style={styles.infoValue}>{userStats?.totalExpenses || t("profileScreen.stats.noData")}</Text>
                        </View>

                        <View style={[styles.infoRow, styles.lastInfoRow]}>
                            <Text style={styles.infoLabel}>{t("profileScreen.stats.totalTransactions")}</Text>
                            <Text style={styles.infoValue}>{userStats?.totalTransactions || t("profileScreen.stats.noData")}</Text>
                        </View>
                    </View>

                    <View style={styles.actionSection}>
                        <Text style={styles.sectionTitle}>{t("profileScreen.accountActions.title")}</Text>

                        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
                            <Icon name="edit" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>{t("profileScreen.accountActions.edit")}</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.lastActionButton]} onPress={handleChangePassword}>
                            <Icon name="security" size={24} color={colors.textSecondary} style={styles.actionIcon} />
                            <Text style={styles.actionText}>{t("profileScreen.accountActions.password")}</Text>
                            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Profile edit modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("profileScreen.profileEditModal.title")}</Text>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.profileEditModal.name.title")}</Text>
                                <TextInput
                                    style={[styles.input, formErrors.name && styles.inputError]}
                                    value={editFormData.name}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, name: text }))}
                                    placeholder={t("profileScreen.profileEditModal.name.placeholder")}
                                    placeholderTextColor={colors.textSecondary}
                                    returnKeyType="next"
                                    onSubmitEditing={() => usernameRef.current?.focus()}
                                />
                                {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.profileEditModal.username.title")}</Text>
                                <TextInput
                                    ref={usernameRef}
                                    style={[styles.input, formErrors.username && styles.inputError]}
                                    value={editFormData.username}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, username: text.toLowerCase() }))}
                                    placeholder={t("profileScreen.profileEditModal.username.placeholder")}
                                    placeholderTextColor={colors.textSecondary}
                                    returnKeyType="next"
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                                {formErrors.username && <Text style={styles.errorText}>{formErrors.username}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.profileEditModal.email.title")}</Text>
                                <TextInput
                                    ref={emailRef}
                                    style={[styles.input, formErrors.email && styles.inputError]}
                                    value={editFormData.email}
                                    onChangeText={(text) => setEditFormData(prev => ({ ...prev, email: text }))}
                                    placeholder={t("profileScreen.profileEditModal.email.placeholder")}
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
                                    <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Change password modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("profileScreen.changePasswordModal.title")}</Text>
                            <TouchableOpacity
                                onPress={() => setPasswordModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.changePasswordModal.currentPass.title")}</Text>
                                <View style={[styles.passwordInputWrapper, formErrors.currentPassword && styles.inputError]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={passwordFormData.currentPassword}
                                        onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, currentPassword: text }))}
                                        placeholder={t("profileScreen.changePasswordModal.currentPass.placeholder")}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showCurrentPassword}
                                        returnKeyType="next"
                                        onSubmitEditing={() => newPasswordRef.current?.focus()}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon
                                            name={showCurrentPassword ? "visibility-off" : "visibility"}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {formErrors.currentPassword && <Text style={styles.errorText}>{formErrors.currentPassword}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.changePasswordModal.newPass.title")}</Text>
                                <View style={[styles.passwordInputWrapper, formErrors.newPassword && styles.inputError]}>
                                    <TextInput
                                        ref={newPasswordRef}
                                        style={styles.passwordInput}
                                        value={passwordFormData.newPassword}
                                        onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, newPassword: text }))}
                                        placeholder={t("profileScreen.changePasswordModal.newPass.placeholder")}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showNewPassword}
                                        returnKeyType="next"
                                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon
                                            name={showNewPassword ? "visibility-off" : "visibility"}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {formErrors.newPassword && <Text style={styles.errorText}>{formErrors.newPassword}</Text>}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{t("profileScreen.changePasswordModal.newPassConfirm.title")}</Text>
                                <View style={[styles.passwordInputWrapper, formErrors.confirmPassword && styles.inputError]}>
                                    <TextInput
                                        ref={confirmPasswordRef}
                                        style={styles.passwordInput}
                                        value={passwordFormData.confirmPassword}
                                        onChangeText={(text) => setPasswordFormData(prev => ({ ...prev, confirmPassword: text }))}
                                        placeholder={t("profileScreen.changePasswordModal.newPassConfirm.placeholder")}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry={!showConfirmNewPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSavePassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.passwordToggle}
                                        onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon
                                            name={showConfirmNewPassword ? "visibility-off" : "visibility"}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSavePassword}
                                >
                                    <Text style={styles.saveButtonText}>{t("common.change")}</Text>
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
