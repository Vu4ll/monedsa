import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SortModal = ({ 
    visible, 
    onClose, 
    onApplySort, 
    colors,
    currentSortBy = 'date',
    currentSortOrder = 'desc'
}) => {
    const sortOptions = [
        {
            key: 'date-desc',
            sortBy: 'date',
            sortOrder: 'desc',
            icon: 'schedule',
            title: 'Tarihe göre (Yeni → Eski)'
        },
        {
            key: 'date-asc',
            sortBy: 'date',
            sortOrder: 'asc',
            icon: 'schedule',
            title: 'Tarihe göre (Eski → Yeni)'
        },
        {
            key: 'amount-desc',
            sortBy: 'amount',
            sortOrder: 'desc',
            icon: 'trending-down',
            title: 'Tutara göre (Yüksek → Düşük)'
        },
        {
            key: 'amount-asc',
            sortBy: 'amount',
            sortOrder: 'asc',
            icon: 'trending-up',
            title: 'Tutara göre (Düşük → Yüksek)'
        }
    ];

    const handleSortSelect = (sortBy, sortOrder) => {
        onApplySort(sortBy, sortOrder);
        onClose();
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContainer: {
            maxHeight: '50%',
            backgroundColor: colors.cardBackground,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        modalContent: {
            padding: 20,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
            color: colors.text,
        },
        optionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: colors.background,
        },
        selectedOptionButton: {
            backgroundColor: colors.primary,
        },
        optionText: {
            fontSize: 16,
            marginLeft: 12,
            color: colors.text,
        },
        selectedOptionText: {
            color: colors.white,
            fontWeight: '600',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sıralama</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <Text style={styles.sectionTitle}>Sıralama Kriteri</Text>

                        {sortOptions.map((option) => {
                            const isSelected = option.sortBy === currentSortBy && option.sortOrder === currentSortOrder;
                            
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.selectedOptionButton
                                    ]}
                                    onPress={() => handleSortSelect(option.sortBy, option.sortOrder)}
                                >
                                    <Icon 
                                        name={option.icon} 
                                        size={20} 
                                        color={isSelected ? colors.white : colors.primary} 
                                    />
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.selectedOptionText
                                    ]}>
                                        {option.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SortModal;
