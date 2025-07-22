import React from 'react';
import { View, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeScreen, CategoryScreen } from "../screens";
import { useNavigationState } from '@react-navigation/native';
import { useTheme } from "../contexts/ThemeContext";

const Tab = createBottomTabNavigator();

function EmptyComponent() {
    return null;
}

function MainTabNavigator({ onLogout }) {
    const { isDarkMode, colors } = useTheme();
    const insets = useSafeAreaInsets();

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
                        height: -2
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    paddingBottom: Platform.OS === 'ios'
                        ? insets.bottom
                        : Math.max(insets.bottom, 8),
                    paddingTop: 4,
                    height: Platform.OS === 'ios'
                        ? 55 + insets.bottom
                        : Math.max(55, 55 + insets.bottom)
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: Platform.OS === 'ios'
                        ? 0
                        : 4
                },
                tabBarItemStyle: {
                    paddingVertical: Platform.OS === 'ios'
                        ? 0
                        : -8
                }
            })}>
            <Tab.Screen
                name="Home"
                options={{
                    tabBarLabel: 'Ana Sayfa'
                }}>
                {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Tab.Screen>

            <Tab.Screen
                name="Category"
                component={CategoryScreen}
                options={{
                    tabBarLabel: 'Kategoriler'
                }} />

            <Tab.Screen
                name="AddTransaction"
                component={EmptyComponent}
                options={({ navigation }) => ({
                    tabBarLabel: '',
                    tabBarIcon: ({ focused, color }) => (
                        <View
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 30,
                                width: 56,
                                height: 56,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: Platform.OS === 'android'
                                    ? -22 - (insets.bottom > 0
                                        ? insets.bottom * 0.3
                                        : 0)
                                    : -22,
                                elevation: 4,
                                shadowColor: colors.primary,
                                shadowOffset: {
                                    width: 0,
                                    height: 2
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84
                            }}>
                            <Icon name="add" size={28} color={colors.white} />
                        </View>
                    ),
                    tabBarButton: (props) => {
                        const AddButton = (buttonProps) => {
                            const navigationState = useNavigationState(state => state);
                            const currentRouteName = navigationState
                                ?.routes
                                ?.[navigationState.index]
                                ?.name;
                            return (<TouchableOpacity
                                {...buttonProps}
                                onPress={() => {
                                    if (currentRouteName === 'Category') {
                                        navigation.navigate('Category', { openAddModal: true });
                                    } else {
                                        navigation.navigate('AddTransactionStack');
                                    }
                                }} />);
                        };
                        return <AddButton {...props} />;
                    }
                })} />

            <Tab.Screen
                name="Profile"
                component={EmptyComponent}
                options={({ navigation }) => ({
                    tabBarLabel: 'Profil',
                    tabBarButton: (props) => (<TouchableOpacity
                        {...props}
                        onPress={() => navigation.navigate('ProfileStack')} />)
                })} />

            <Tab.Screen
                name="Settings"
                component={EmptyComponent}
                options={({ navigation }) => ({
                    tabBarLabel: 'Ayarlar',
                    tabBarButton: (props) => (<TouchableOpacity
                        {...props}
                        onPress={() => navigation.navigate('SettingsStack')} />)
                })} />
        </Tab.Navigator>
    );
}

export default MainTabNavigator;
