import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../contexts/ThemeContext";

const AuthButton = ({ onPress, title, loading, disabled }) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        button: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        buttonDisabled: {
            backgroundColor: colors.disabled,
        },
        buttonText: {
            color: colors.white,
            fontSize: 18,
            fontWeight: '600',
        },
    });

    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.buttonText}>
                {loading ? 'Kaydolunuyor...' : title}
            </Text>
        </TouchableOpacity>
    );
};

export default AuthButton;
