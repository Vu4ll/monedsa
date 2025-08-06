import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../../contexts/ThemeContext";

const PasswordInput = ({ label, value, onChangeText, placeholder, inputRef, error, showPassword, setShowPassword, onSubmitEditing, blurOnSubmit }) => {
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
        passwordContainer: {
            position: 'relative',
        },
        passwordInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingRight: 50,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.cardBackground,
        },
        passwordToggle: {
            position: 'absolute',
            right: 6,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: '100%',
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
            <View style={styles.passwordContainer}>
                <TextInput
                    ref={inputRef}
                    style={[styles.passwordInput, error && styles.inputError]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={blurOnSubmit}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    passwordRules="required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;"
                />
                <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                >
                    <Icon
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

export default PasswordInput;
