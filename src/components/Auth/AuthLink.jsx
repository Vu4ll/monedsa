import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../contexts/ThemeContext";

const AuthLink = ({ onPress, text, highlightText }) => {
    const { colors } = useTheme();

    const styles = StyleSheet.create({
        linkContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        linkText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        linkHighlight: {
            color: colors.primary,
            fontWeight: '600',
        },
    });

    return (
        <TouchableOpacity
            style={styles.linkContainer}
            onPress={onPress}
        >
            <Text style={styles.linkText}>
                {text} <Text style={styles.linkHighlight}>{highlightText}</Text>
            </Text>
        </TouchableOpacity>
    );
};

export default AuthLink;
