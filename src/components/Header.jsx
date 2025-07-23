import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_CONFIG } from '../constants/api';

export const Header = ({ colors, title, showLeftAction = false, leftActionIcon = "arrow-back", onLeftActionPress, showRightAction = false, rightActionIcon = "more-vert", rightIconColor = colors.text, onRightActionPress, showLogo = false }) => {
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
      flexDirection: "row",
    },
    titleWithLogo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 32,
      height: 32,
      marginRight: 4,
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
        {showLogo ? (
          <View style={styles.titleWithLogo}>
            <Image
              source={{ uri: `${API_CONFIG.BASE_URL}/images/icon-trans-white.png` }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {title || "Monera"}
            </Text>
          </View>
        ) : (
          <Text style={[styles.title, { color: colors.text }]}>
            {title || "Monera"}
          </Text>
        )}
      </View>
      {showRightAction && (
        <TouchableOpacity style={styles.rightButton} onPress={onRightActionPress}>
          <Icon name={rightActionIcon} size={24} color={rightIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};
