import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CategoryItem = ({ item, colors, onEdit }) => {
    const styles = StyleSheet.create({
        categoryItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.cardBackground,
            padding: 16,
            marginBottom: 10,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            borderWidth: 1.5,
            borderColor: colors.border
        },
        categoryInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        colorIndicator: {
            width: 20,
            height: 20,
            borderRadius: 10,
            marginRight: 12,
        },
        categoryDetails: {
            flex: 1,
        },
        categoryName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        categoryCorner: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 30,
            height: 30,
            borderTopWidth: 25,
            borderRightWidth: 35,
            borderTopLeftRadius: 10,
            borderRightColor: 'transparent',
        },
        categoryType: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        defaultIndicator: {
            padding: 8,
            backgroundColor: colors.background,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <TouchableOpacity onPress={() => onEdit(item)}>
            <View style={styles.categoryItem}>
                <View style={[
                    styles.categoryCorner,
                    { borderTopColor: item.type === "income" ? colors.softGreen : colors.softRed }
                ]} />
                <View style={styles.categoryInfo}>
                    <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                    <View style={styles.categoryDetails}>
                        <Text style={styles.categoryName}>
                            {item.name}
                            <Text style={styles.categoryType}>
                                {item.type === 'expense' ? '  •  Gider' : '  •  Gelir'}
                            </Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.defaultIndicator}>
                    <Icon name="edit" size={20} color={colors.text} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CategoryItem;
