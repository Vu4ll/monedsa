import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeScreen, LoginScreen, RegisterScreen, CategoryScreen, AddTransactionScreen, ProfileScreen, SettingsScreen } from "./src/screens";
import { authService } from './src/services';
import { getColors } from './src/constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator({ onLogout }) {
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Category') {
            iconName = 'category';
          } else if (route.name === 'AddTransaction') {
            iconName = 'add';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          paddingBottom: 8,
          paddingTop: 4,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: -8,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ tabBarLabel: 'Ana Sayfa' }}
      >
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Category" 
        component={CategoryScreen}
        options={{ tabBarLabel: 'Kategoriler' }}
      />
      
      <Tab.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{ 
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              backgroundColor: colors.primary,
              borderRadius: 30,
              width: 56,
              height: 56,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -22,
              elevation: 4,
              shadowColor: colors.primary,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
              <Icon name="add" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        options={({ navigation }) => ({ 
          tabBarLabel: 'Profil',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('ProfileStack')}
            />
          ),
        })}
        component={EmptyComponent}
      />
      
      <Tab.Screen 
        name="Settings" 
        options={({ navigation }) => ({ 
          tabBarLabel: 'Ayarlar',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('SettingsStack')}
            />
          ),
        })}
        component={EmptyComponent}
      />
    </Tab.Navigator>
  );
}

// Boş component (tab'lar için)
function EmptyComponent() {
  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isDarkMode = useColorScheme() === "dark";
  const colors = getColors(isDarkMode);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await authService.loadToken();
      const isValid = authService.isTokenValid();
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp">
              {(props) => <MainTabNavigator {...props} onLogout={() => setIsAuthenticated(false)} />}
            </Stack.Screen>
            <Stack.Screen name="ProfileStack">
              {(props) => <ProfileScreen {...props} onLogout={() => setIsAuthenticated(false)} />}
            </Stack.Screen>
            <Stack.Screen name="SettingsStack" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              options={{ gestureEnabled: false }}
            >
              {(props) => <LoginScreen {...props} onLogin={() => setIsAuthenticated(true)} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
