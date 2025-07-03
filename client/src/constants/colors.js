export const getColors = (isDarkMode) => ({
  background: isDarkMode ? "#121212" : "#FFFFFF",
  cardBackground: isDarkMode ? "#1E1E1E" : "#F5F5F5",
  text: isDarkMode ? "#FFFFFF" : "#000000",
  textSecondary: isDarkMode ? "#888888" : "#666666",
  border: isDarkMode ? "#333333" : "#E0E0E0",
  button: isDarkMode ? "#007AFF" : "#007AFF",
  buttonText: "#FFFFFF",
  success: isDarkMode ? "#4CAF50" : "#2E7D32",
});
