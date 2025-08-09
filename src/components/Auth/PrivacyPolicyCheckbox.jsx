import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from 'react-i18next';

const PrivacyPolicyCheckbox = ({ acceptPrivacyPolicy, setAcceptPrivacyPolicy, openPrivacyPolicy, error }) => {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        privacyContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 8,
            marginBottom: 8,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 4,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkboxChecked: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        privacyText: {
            flex: 1,
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        privacyLink: {
            color: colors.primary,
            textDecorationLine: 'underline',
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
    });

    return (
        <>
            <View style={styles.privacyContainer}>
                <TouchableOpacity
                    style={[styles.checkbox, acceptPrivacyPolicy && styles.checkboxChecked]}
                    onPress={() => setAcceptPrivacyPolicy(!acceptPrivacyPolicy)}
                    activeOpacity={0.7}
                >
                    {acceptPrivacyPolicy && (
                        <Icon name="check" size={14} color={colors.white} />
                    )}
                </TouchableOpacity>
                <Text style={styles.privacyText}>
                    {i18n.language === "tr" ? (
                        <>
                            <Text onPress={openPrivacyPolicy} style={styles.privacyLink}>
                                {t("registerScreen.privacy.link")}
                            </Text>
                            {t("registerScreen.privacy.text")}
                        </>
                    ) : (
                        <>
                            {t("registerScreen.privacy.text")}
                            <Text onPress={openPrivacyPolicy} style={styles.privacyLink}>
                                {t("registerScreen.privacy.link")}
                            </Text>
                        </>
                    )}
                </Text>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </>
    );
};

export default PrivacyPolicyCheckbox;
