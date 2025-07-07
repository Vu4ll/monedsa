import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    useColorScheme,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView
} from 'react-native';
import { getColors } from '../constants';
import { authService } from '../services';

const LoginScreen = ({ navigation, onLogin }) => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const isDarkMode = useColorScheme() === "dark";
    const colors = getColors(isDarkMode);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Email ve şifre alanları zorunludur.');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.login(email, password);

            if (result.success) {
                // Ana ekrana yönlendir
                onLogin && onLogin();
            } else {
                Alert.alert('Giriş Hatası', result.error);
            }
        } catch (error) {
            Alert.alert('Hata', 'Beklenmedik bir hata oluştu.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 20,
            paddingTop: 100,
        },
        formContainer: {
            flex: 1,
            justifyContent: 'center',
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 30,
        },
        inputContainer: {
            gap: 16,
        },
        input: {
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.inputText,
        },
        loginButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        loginButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={{ flex: 1 }}
                    >
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>Gider Takip</Text>
                            <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="E-posta veya kullanıcı adı"
                                    placeholderTextColor={colors.placeholder}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Şifre"
                                    placeholderTextColor={colors.placeholder}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />

                                <TouchableOpacity
                                    style={[styles.loginButton, loading && styles.buttonDisabled]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
