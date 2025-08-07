import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen, RegisterScreen, ProfileScreen, SettingsScreen, AddTransactionScreen } from "./src/screens";
import { MainTabNavigator } from './src/components';
import { useAuth, useNetworkStatus } from './src/hooks';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import './src/i18n';

const Stack = createStackNavigator();

function AppContent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainApp">
                {(props) => <MainTabNavigator {...props} onLogout={logout} />}
              </Stack.Screen>

              <Stack.Screen name="ProfileStack">
                {(props) => <ProfileScreen {...props} onLogout={logout} />}
              </Stack.Screen>

              <Stack.Screen name="AddTransactionStack">
                {(props) => <AddTransactionScreen {...props} onLogout={logout} />}
              </Stack.Screen>

              <Stack.Screen name="SettingsStack" component={SettingsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                options={{ gestureEnabled: false }}
              >
                {(props) => <LoginScreen {...props} onLogin={login} />}
              </Stack.Screen>
              <Stack.Screen name="Register">
                {(props) => <RegisterScreen {...props} onLogin={login} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
