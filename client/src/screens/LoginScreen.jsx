import React, { useState, useRef } from 'react';
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
    SafeAreaView,
    StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getColors } from '../constants';
import { authService } from '../services';

const LoginScreen = ({ navigation, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const passwordRef = useRef(null);

    const isDarkMode = useColorScheme() === "dark";
    const colors = getColors(isDarkMode);

    const validateForm = () => {
        const newErrors = {};

        if (!email || !email.trim()) {
            newErrors.email = 'E-posta veya kullanıcı adı gerekli';
        } else if (email.trim().length < 2) {
            newErrors.email = 'En az 2 karakter olmalıdır';
        }

        if (!password || !password.trim()) {
            newErrors.password = 'Parola gerekli';
        } else if (password.length < 8) {
            newErrors.password = 'Parola en az 8 karakter olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await authService.login(email.trim(), password);

            if (result.success) {
                onLogin && onLogin();
            } else {
                const errorMessage = result.error || 'Giriş başarısız';

                if (errorMessage.includes('User not found') || errorMessage.includes('Invalid credentials')) {
                    setErrors({ email: 'Kullanıcı bulunamadı veya hatalı bilgiler' });
                } else if (errorMessage.includes('Invalid password')) {
                    setErrors({ password: 'Hatalı parola' });
                } else if (errorMessage.includes('Network') || errorMessage.includes('connection')) {
                    Alert.alert('Bağlantı Hatası', 'İnternet bağlantınızı kontrol edin');
                } else {
                    setErrors({ email: errorMessage });
                }
            }
        } catch (error) {
            Alert.alert('Hata', 'Beklenmedik bir hata oluştu.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateEmail = (value) => {
        setEmail(value);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: null }));
        }
    };

    const updatePassword = (value) => {
        setPassword(value);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: null }));
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
        inputField: {
            marginBottom: 4,
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
        inputError: {
            borderColor: colors.danger,
            borderWidth: 2,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
            marginLeft: 4,
        },
        passwordContainer: {
            position: 'relative',
        },
        passwordInput: {
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingRight: 50,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.inputText,
        },
        passwordInputError: {
            borderColor: colors.danger,
            borderWidth: 2,
        },
        passwordToggle: {
            position: 'absolute',
            right: 6,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: '100%',
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
        registerLink: {
            marginTop: 20,
            alignItems: 'center',
        },
        registerText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        registerHighlight: {
            color: colors.primary,
            fontWeight: '600',
        },
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

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
                                <View style={styles.inputField}>
                                    <TextInput
                                        style={[styles.input, errors.email && styles.inputError]}
                                        placeholder="E-posta veya kullanıcı adı"
                                        placeholderTextColor={colors.placeholder}
                                        value={email}
                                        onChangeText={updateEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                        blurOnSubmit={false}
                                    />
                                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                                </View>

                                <View style={styles.inputField}>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            ref={passwordRef}
                                            style={[styles.passwordInput, errors.password && styles.passwordInputError]}
                                            placeholder="Parola"
                                            placeholderTextColor={colors.placeholder}
                                            value={password}
                                            onChangeText={updatePassword}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            returnKeyType="done"
                                            onSubmitEditing={handleLogin}
                                            blurOnSubmit={false}
                                            textContentType="password"
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowPassword(!showPassword)}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                name={showPassword ? "visibility-off" : "visibility"}
                                                size={20}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                                </View>

                                <TouchableOpacity
                                    style={[styles.loginButton, loading && styles.buttonDisabled]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.registerLink}
                                    onPress={() => navigation.navigate('Register')}
                                >
                                    <Text style={styles.registerText}>
                                        Hesabınız yok mu? <Text style={styles.registerHighlight}>Kayıt olun</Text>
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
