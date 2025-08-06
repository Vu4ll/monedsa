import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from "../../contexts/ThemeContext";

const AuthInput = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, autoCorrect, returnKeyType, onSubmitEditing, blurOnSubmit, inputRef, error, secureTextEntry = false, textContentType, passwordRules }) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.cardBackground,
        },
        inputError: {
            borderColor: colors.danger,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
    });

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                ref={inputRef}
                style={[styles.input, error && styles.inputError]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                blurOnSubmit={blurOnSubmit}
                secureTextEntry={secureTextEntry}
                textContentType={textContentType}
                passwordRules={passwordRules}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

export default AuthInput;
