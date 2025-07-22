import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EmptyState = ({ colors }) => {
    const styles = StyleSheet.create({
        emptyStateContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyStateTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
            marginTop: 24,
            textAlign: 'center',
        },
        emptyStateSubtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 24,
        },
    });

    return (
        <View style={styles.emptyStateContainer}>
            <Icon name="category" size={80} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Henüz kategori bulunmuyor</Text>
            <Text style={styles.emptyStateSubtitle}>
                Gezinme çubuğundaki + tuşuna basarak{'\n'}ilk kategorinizi ekleyebilirsiniz.
            </Text>
        </View>
    );
};

export default EmptyState;
