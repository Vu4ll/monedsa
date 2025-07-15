import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    SafeAreaView,
    StatusBar,
    useColorScheme,
    ScrollView,
    Alert,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getColors } from '../constants';
import { Header } from '../components';

const SettingsScreen = ({ navigation }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const colors = getColors(isDarkMode);

    const [settings, setSettings] = useState({
        darkMode: isDarkMode,
        notifications: true,
        autoBackup: false,
        biometricAuth: false,
        currency: 'TRY'
    });

    const toggleSetting = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const showCurrencyPicker = () => {
        Alert.alert(
            'Para Birimi Seçin',
            'Hangi para birimini kullanmak istiyorsunuz?',
            [
                { text: 'Türk Lirası (₺)', onPress: () => setSettings(prev => ({ ...prev, currency: 'TRY' })) },
                { text: 'Dolar ($)', onPress: () => setSettings(prev => ({ ...prev, currency: 'USD' })) },
                { text: 'Euro (€)', onPress: () => setSettings(prev => ({ ...prev, currency: 'EUR' })) },
                { text: 'İptal', style: 'cancel' }
            ]
        );
    };

    const getCurrencyDisplay = () => {
        switch (settings.currency) {
            case 'USD': return 'Dolar ($)';
            case 'EUR': return 'Euro (€)';
            default: return 'Türk Lirası (₺)';
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
            color: colors.textPrimary,
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
            color: colors.textPrimary,
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
            color: colors.textPrimary,
            marginBottom: 2,
        },
        settingDescription: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        settingAction: {
            marginLeft: 12,
        },
        currencyValue: {
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
            color: colors.textPrimary,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <Header 
                colors={colors} 
                title="Ayarlar" 
                showBackButton={true} 
                onBackPress={() => navigation.goBack()} 
            />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.settingSection}>
                    <Text style={styles.sectionTitle}>Görünüm</Text>

                    <View style={styles.settingRow}>
                        <Icon name="dark-mode" size={24} color={colors.textSecondary} style={styles.settingIcon} />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Karanlık Tema</Text>
                            <Text style={styles.settingDescription}>Uygulamayı karanlık temada kullan</Text>
                        </View>
                        <Switch
                            value={settings.darkMode}
                            onValueChange={() => toggleSetting('darkMode')}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.white}
                            style={styles.settingAction}
                        />
                    </View>

                    <View style={[styles.settingRow, styles.lastSettingRow]}>
                        <Icon name="attach-money" size={24} color={colors.textSecondary} style={styles.settingIcon} />
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Para Birimi</Text>
                            <Text style={styles.settingDescription}>Varsayılan para birimini seçin</Text>
                        </View>
                        <TouchableOpacity onPress={showCurrencyPicker} style={styles.settingAction}>
                            <Text style={styles.currencyValue}>{getCurrencyDisplay()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>

                    <View style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Versiyon</Text>
                        <Text style={styles.aboutValue}>1.0.0</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={() => Linking.openURL("https://github.com/Vu4ll/gider-takip/issues/new")}>
                        <Text style={styles.aboutLabel}>Sorun Bildirin</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Gizlilik Politikası</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.aboutRow, styles.lastAboutRow]}>
                        <Text style={styles.aboutLabel}>Kullanım Şartları</Text>
                        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;
