import { View, Text, StyleSheet } from "react-native";

export const Header = ({ colors }) => {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        Expense Tracker
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 15,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
