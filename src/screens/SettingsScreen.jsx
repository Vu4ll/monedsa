import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Linking,
    Modal,
    TextInput,
    ActivityIndicator,
    Platform,
    ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Header } from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { API_CONFIG } from '../constants/api';
import { authService } from '../services';
import { version } from '../../package.json';
import { useTranslation } from 'react-i18next';

const SettingsScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const currencyLabels = {
        USD: { title: "USD ($)", description: t("settingsScreen.currency.modal.USD") },
        EUR: { title: "EUR (€)", description: t("settingsScreen.currency.modal.EUR") },
        GBP: { title: "GBP (£)", description: t("settingsScreen.currency.modal.GBP") },
        TRY: { title: "TRY (₺)", description: t("settingsScreen.currency.modal.TRY") }
    };
    const { themeMode, isDarkMode, colors, changeTheme, getThemeDisplay } = useTheme();
    const { currency, changeCurrency } = useCurrency();
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [userMail, setUserMail] = useState(null);
    const [issueReport, setIssueReport] = useState({
        title: '',
        description: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUserMail();
    }, []);

    const loadUserMail = async () => {
        try {
            const result = await authService.getProfile();
            if (result.success) {
                const userEmail = result.data.email;
                setUserMail(userEmail);
                setIssueReport(prev => ({ ...prev, email: userEmail }));
            } else {
                console.error('Auth service error:', result.error);
                ToastAndroid.show(t("settingsScreen.other.loadUserMail.profileData"), ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Emaiil load error:', error);
            ToastAndroid.show(t("settingsScreen.other.loadUserMail.emailData"), ToastAndroid.SHORT);
        }
    };

    const showThemePicker = () => {
        setShowThemeModal(true);
    };

    const showLanguagePicker = () => {
        setShowLanguageModal(true);
    };

    const showCurrencyPicker = () => {
        setShowCurrencyModal(true);
    };

    const handleThemeSelect = (selectedTheme) => {
        changeTheme(selectedTheme);
        setShowThemeModal(false);
    };

    const currencyChangeHandler = async (newCurrency) => {
        await changeCurrency(newCurrency);
        setShowCurrencyModal(false);
    };

    const changeLanguage = async (lng) => {
        i18n.changeLanguage(lng);
        setShowLanguageModal(false);
    };

    const rateApp = () => {
        const appId = 'com.vu4ll.monedsa';

        if (Platform.OS === 'android') {
            const url = `market://details?id=${appId}`;
            const webUrl = `https://play.google.com/store/apps/details?id=${appId}`;

            Linking.canOpenURL(url)
                .then((supported) => {
                    if (supported) {
                        Linking.openURL(url);
                    } else {
                        Linking.openURL(webUrl);
                    }
                });
        }
    };

    const showIssuePicker = () => {
        setShowIssueModal(true);
    };

    const closeIssueModal = () => {
        setShowIssueModal(false);
        setIssueReport({ title: '', description: '', email: '' });
    };

    const handleIssueSubmit = async () => {
        if (!issueReport.title.trim()) {
            ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.title"), ToastAndroid.SHORT);
            return;
        }
        if (!issueReport.description.trim()) {
            ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.description"), ToastAndroid.SHORT);
            return;
        }
        if (!userMail || !userMail.trim()) {
            ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.email"), ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPORT.ISSUE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: issueReport.title,
                    description: issueReport.description,
                    email: userMail,
                    platform: Platform.OS,
                    version: version,
                    timestamp: new Date().toISOString(),
                    language: i18n.language
                }),
            });

            if (response.ok) {
                setShowIssueModal(false);
                setIssueReport({ title: '', description: '', email: '' });
                ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.success"), ToastAndroid.SHORT);
            } else {
                if (response.status === 429) {
                    return ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.ratelimit"), ToastAndroid.SHORT);
                }
                throw new Error('Sunucu hatası');
            }
        } catch (error) {
            ToastAndroid.show(t("settingsScreen.other.handleIssueSubmit.fail"), ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 20,
        },
        sectionHeader: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 20,
            marginTop: 20,
        },
        settingSection: {
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
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastSettingRow: {
            borderBottomWidth: 0,
            paddingBottom: 0,
        },
        settingIcon: {
            marginRight: 16,
        },
        settingContent: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        settingDescription: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        settingAction: {
            marginLeft: 12,
            flexDirection: 'row',
            alignItems: 'center',
        },
        settingValue: {
            fontSize: 16,
            color: colors.primary,
            fontWeight: '500',
        },
        aboutSection: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
        },
        aboutRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        lastAboutRow: {
            borderBottomWidth: 0,
            paddingBottom: 0,
        },
        aboutLabel: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        aboutValue: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            paddingTop: 12,
            marginHorizontal: 20,
            width: '90%',
            maxWidth: 400,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        closeButton: {
            padding: 8,
        },
        themeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            marginBottom: 8,
        },
        themeOptionActive: {
            backgroundColor: colors.primary + '15',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        themeOptionInactive: {
            backgroundColor: colors.background,
        },
        radioButton: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioButtonActive: {
            borderColor: colors.primary,
        },
        radioButtonInactive: {
            borderColor: colors.border,
        },
        radioButtonInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
        },
        themeOptionContent: {
            flex: 1,
        },
        themeOptionTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        themeOptionDescription: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        issueModalContainer: {
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            paddingTop: 12,
            marginHorizontal: 20,
            width: '90%',
            maxWidth: 500,
            maxHeight: '80%',
        },
        issueInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 16,
            backgroundColor: colors.background,
            color: colors.text,
        },
        issueTextArea: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            marginBottom: 16,
            backgroundColor: colors.background,
            color: colors.text,
            height: 120,
            textAlignVertical: 'top',
        },
        issueLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 8,
        },
        issueButtons: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16,
        },
        issueButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        issueCancelButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        issueSubmitButton: {
            backgroundColor: colors.primary,
        },
        issueButtonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        issueCancelButtonText: {
            color: colors.textSecondary,
        },
        issueSubmitButtonText: {
            color: colors.white,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header
                colors={colors}
                title={t("settingsScreen.header")}
                showLeftAction={true}
                onLeftActionPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.settingSection}>
                    <Text style={styles.sectionTitle}>{t("settingsScreen.display")}</Text>

                    <TouchableOpacity
                        style={[styles.settingRow, { paddingTop: 8 }]}
                        onPress={showThemePicker}
                    >
                        <Icon name="palette" size={24} color={colors.textSecondary} style={styles.settingIcon} />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>{t("settingsScreen.theme.title")}</Text>
                            <Text style={styles.settingDescription}>{t("settingsScreen.theme.description")}</Text>
                        </View>
                        <View style={styles.settingAction}>
                            <Text style={styles.settingValue}>{getThemeDisplay()}</Text>
                            <Icon name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={showLanguagePicker}
                    >
                        <Icon name="language" size={24} color={colors.textSecondary} style={styles.settingIcon} />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>{t("settingsScreen.lang.title")}</Text>
                            <Text style={styles.settingDescription}>{t("settingsScreen.lang.description")}</Text>
                        </View>
                        <View style={styles.settingAction}>
                            <Text style={styles.settingValue}>{t("settingsScreen.lang.display")}</Text>
                            <Icon name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingRow, styles.lastSettingRow]}
                        onPress={showCurrencyPicker}
                    >
                        <Icon name="attach-money" size={24} color={colors.textSecondary} style={styles.settingIcon} />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>{t("settingsScreen.currency.title")}</Text>
                            <Text style={styles.settingDescription}>{t("settingsScreen.currency.description")}</Text>
                        </View>
                        <View style={styles.settingAction}>
                            <Text style={styles.settingValue}>{currencyLabels[currency].title}</Text>
                            <Icon name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>{t("settingsScreen.about.title")}</Text>

                    <View style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.about.version")}</Text>
                        <Text style={styles.aboutValue}>{version}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL(`${API_CONFIG.BASE_URL}?lang=${i18n.language}&redirect=/`)}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.about.web")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL("https://github.com/Vu4ll/monedsa")}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.about.source")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.aboutRow, styles.lastAboutRow]}
                        onPress={() => Linking.openURL(`${API_CONFIG.BASE_URL}/privacy-policy?lang=${i18n.language}&redirect=/privacy-policy`)}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.about.privacy")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.aboutSection}>
                    <TouchableOpacity
                        style={[styles.aboutRow, { paddingTop: 0 }]}
                        onPress={showIssuePicker}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.other.reportIssue.title")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL("https://coff.ee/Vu4ll")}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.other.donate")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.aboutRow, styles.lastAboutRow]}
                        onPress={rateApp}>
                        <Text style={styles.aboutLabel}>{t("settingsScreen.other.rateApp")}</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Tema Seçim Modalı */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showThemeModal}
                onRequestClose={() => setShowThemeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("settingsScreen.theme.modal.title")}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowThemeModal(false)}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === 'system' ? styles.themeOptionActive : styles.themeOptionInactive
                            ]}
                            onPress={() => handleThemeSelect('system')}
                        >
                            <View style={[
                                styles.radioButton,
                                themeMode === 'system' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {themeMode === 'system' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>{t("settingsScreen.theme.modal.system.title")}</Text>
                                <Text style={styles.themeOptionDescription}>{t("settingsScreen.theme.modal.system.description")}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === 'light' ? styles.themeOptionActive : styles.themeOptionInactive
                            ]}
                            onPress={() => handleThemeSelect('light')}
                        >
                            <View style={[
                                styles.radioButton,
                                themeMode === 'light' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {themeMode === 'light' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>{t("settingsScreen.theme.modal.light.title")}</Text>
                                <Text style={styles.themeOptionDescription}>{t("settingsScreen.theme.modal.light.description")}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === 'dark' ? styles.themeOptionActive : styles.themeOptionInactive
                            ]}
                            onPress={() => handleThemeSelect('dark')}
                        >
                            <View style={[
                                styles.radioButton,
                                themeMode === 'dark' ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {themeMode === 'dark' && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>{t("settingsScreen.theme.modal.dark.title")}</Text>
                                <Text style={styles.themeOptionDescription}>{t("settingsScreen.theme.modal.dark.description")}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Dil Seçim Modalı */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showLanguageModal}
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("settingsScreen.lang.modal.title")}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowLanguageModal(false)}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                i18n.language === "en" ? styles.themeOptionActive : styles.themeOptionInactive,
                            ]}
                            onPress={() => changeLanguage("en")}
                        >
                            <View style={[
                                styles.radioButton,
                                i18n.language === "en" ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {i18n.language === "en" && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>English</Text>
                                <Text style={styles.themeOptionDescription}>
                                    {i18n.language === "en" ? t("settingsScreen.lang.modal.selected") : t("settingsScreen.lang.modal.en.description")}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                i18n.language === "tr" ? styles.themeOptionActive : styles.themeOptionInactive,
                            ]}
                            onPress={() => changeLanguage("tr")}
                        >
                            <View style={[
                                styles.radioButton,
                                i18n.language === "tr" ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {i18n.language === "tr" && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>Türkçe</Text>
                                <Text style={styles.themeOptionDescription}>
                                    {i18n.language === "tr" ? t("settingsScreen.lang.modal.selected") : t("settingsScreen.lang.modal.tr.description")}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.themeOption,
                            i18n.language === "nl" ? styles.themeOptionActive : styles.themeOptionInactive,
                            ]}
                            onPress={() => changeLanguage("nl")}
                        >
                            <View style={[
                                styles.radioButton,
                                i18n.language === "nl" ? styles.radioButtonActive : styles.radioButtonInactive
                            ]}>
                                {i18n.language === "nl" && <View style={styles.radioButtonInner} />}
                            </View>
                            <View style={styles.themeOptionContent}>
                                <Text style={styles.themeOptionTitle}>Nederlands</Text>
                                <Text style={styles.themeOptionDescription}>
                                    {i18n.language === "nl" ? t("settingsScreen.lang.modal.selected") : t("settingsScreen.lang.modal.nl.description")}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Currency Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCurrencyModal}
                onRequestClose={() => setShowCurrencyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("settingsScreen.currency.modal.title")}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowCurrencyModal(false)}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {["USD", "EUR", "GBP", "TRY"].map(cur => (
                            <TouchableOpacity
                                key={cur}
                                style={[
                                    styles.themeOption,
                                    currency === cur ? styles.themeOptionActive : styles.themeOptionInactive,
                                ]}
                                onPress={() => currencyChangeHandler(cur)}
                            >
                                <View style={[
                                    styles.radioButton,
                                    currency === cur ? styles.radioButtonActive : styles.radioButtonInactive
                                ]}>
                                    {currency === cur && <View style={styles.radioButtonInner} />}
                                </View>
                                <View style={styles.themeOptionContent}>
                                    <Text style={styles.themeOptionTitle}>{currencyLabels[cur].title}</Text>
                                    <Text style={styles.themeOptionDescription}>{currencyLabels[cur].description}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Sorun Bildirme Modalı */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showIssueModal}
                onRequestClose={closeIssueModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.issueModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t("settingsScreen.other.reportIssue.modal.title")}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeIssueModal}
                            >
                                <Icon name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.issueLabel}>{t("settingsScreen.other.reportIssue.modal.issue.title")}</Text>
                            <TextInput
                                style={styles.issueInput}
                                placeholder={t("settingsScreen.other.reportIssue.modal.issue.placeholder")}
                                placeholderTextColor={colors.textSecondary}
                                value={issueReport.title}
                                onChangeText={(text) => setIssueReport(prev => ({ ...prev, title: text }))}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.issueLabel}>{t("settingsScreen.other.reportIssue.modal.description.title")}</Text>
                            <TextInput
                                style={styles.issueTextArea}
                                placeholder={t("settingsScreen.other.reportIssue.modal.description.placeholder")}
                                placeholderTextColor={colors.textSecondary}
                                multiline={true}
                                value={issueReport.description}
                                onChangeText={(text) => setIssueReport(prev => ({ ...prev, description: text }))}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.issueLabel}>{t("settingsScreen.other.reportIssue.modal.email")}</Text>
                            <TextInput
                                style={[styles.issueInput, { backgroundColor: colors.border + '30' }]}
                                value={userMail || 'E-posta yükleniyor...'}
                                placeholderTextColor={colors.textSecondary}
                                editable={false}
                                selectTextOnFocus={false}
                            />

                            <View style={styles.issueButtons}>
                                <TouchableOpacity
                                    style={[styles.issueButton, styles.issueSubmitButton]}
                                    onPress={handleIssueSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Text style={[styles.issueButtonText, styles.issueSubmitButtonText]}>Gönder</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SettingsScreen;
