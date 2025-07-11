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
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getColors } from '../constants';
import { authService } from '../services';

const LoginScreen = ({ navigation, onLogin }) => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const passwordRef = useRef(null);

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
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    blurOnSubmit={false}
                                />

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        ref={passwordRef}
                                        style={styles.passwordInput}
                                        placeholder="Parola"
                                        placeholderTextColor={colors.placeholder}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                        blurOnSubmit={false}
                                        textContentType="password"
                                        passwordRules="required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;"
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
