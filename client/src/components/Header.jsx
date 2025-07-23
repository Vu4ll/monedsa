import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

export const Header = ({ colors, title, showLeftAction = false, leftActionIcon = "arrow-back", onLeftActionPress, showRightAction = false, rightActionIcon = "more-vert", rightIconColor = colors.text, onRightActionPress }) => {
  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: StatusBar.currentHeight + 4,
      paddingBottom: 12,
      paddingHorizontal: 16,
      position: "relative",
      backgroundColor: colors.headerBackgroud,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    backButton: {
      position: "absolute",
      left: 16,
      top: StatusBar.currentHeight + 4,
      padding: 8,
      zIndex: 1,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
    },
    rightButton: {
      position: "absolute",
      right: 16,
      top: StatusBar.currentHeight + 4,
      padding: 8,
      zIndex: 1,
    },
  });

  return (
    <View style={[styles.header]}>
      {showLeftAction && (
        <TouchableOpacity style={styles.backButton} onPress={onLeftActionPress}>
          <Icon name={leftActionIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title || "Monera"}
        </Text>
      </View>
      {showRightAction && (
        <TouchableOpacity style={styles.rightButton} onPress={onRightActionPress}>
          <Icon name={rightActionIcon} size={24} color={rightIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};
