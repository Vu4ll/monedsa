import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from "../contexts/ThemeContext";
import { authService } from '../services';
import { API_CONFIG } from '../constants/api';

const RegisterScreen = ({ navigation }) => {
    const { isDarkMode, colors } = useTheme();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptPrivacyPolicy, setAcceptPrivacyPolicy] = useState(false);

    // Refs for input navigation
    const emailRef = useRef(null);
    const nameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Kullanıcı adı gerekli';
        } else if (formData.username.length < 2) {
            newErrors.username = 'Kullanıcı adı en az 2 karakter olmalı';
        } else if (formData.username.length >= 16) {
            newErrors.username = 'Kullanıcı adı en fazla 16 karakter olmalı';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
        } else if (formData.username.split(" ").length > 1) {
            newErrors.username = 'Kullanıcı adı boşluk içeremez';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gerekli';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        } else if (formData.email.length > 100) {
            newErrors.email = 'E-posta adresi çok uzun';
        }

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'İsim gerekli';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'İsim en az 2 karakter olmalı';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'İsim en fazla 50 karakter olmalı';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Parola gerekli';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Parola en az 8 karakter olmalı';
        } else if (formData.password.length > 100) {
            newErrors.password = 'Parola çok uzun';
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = 'Parola en az bir küçük harf içermeli';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Parola en az bir büyük harf içermeli';
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Parola en az bir rakam içermeli';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Parola tekrarı gerekli';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Parolalar eşleşmiyor';
        }

        // Privacy policy validation
        if (!acceptPrivacyPolicy) {
            newErrors.privacyPolicy = 'Gizlilik sözleşmesini kabul etmelisiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await authService.register({
                username: formData.username.trim(),
                email: formData.email.trim(),
                name: formData.name.trim(),
                password: formData.password,
                language: "tr" // temptorarily
            });

            if (response.success) {
                Alert.alert(
                    'Başarılı',
                    'Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.',
                    [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                const errorMessage = response.error || 'Kayıt olurken bir hata oluştu';

                let displayMessage = errorMessage;

                if (errorMessage.includes('username') && errorMessage.includes('already taken')) {
                    displayMessage = 'Bu kullanıcı adı zaten kullanımda. Lütfen farklı bir kullanıcı adı seçin.';
                    setErrors(prev => ({ ...prev, username: 'Bu kullanıcı adı zaten kullanımda' }));
                } else if (errorMessage.includes('email') && errorMessage.includes('already registered')) {
                    displayMessage = 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.';
                    setErrors(prev => ({ ...prev, email: 'Bu e-posta adresi zaten kayıtlı' }));
                } else if (errorMessage.includes('User already exists')) {
                    displayMessage = 'Bu kullanıcı bilgileri zaten kayıtlı. Lütfen farklı bilgiler kullanın.';
                }

                Alert.alert('Kayıt Hatası', displayMessage);
            }
        } catch (error) {
            console.error('Register error:', error);
            Alert.alert(
                'Hata',
                'Sunucu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        if (field === 'username' && value.trim()) {
            if (value.length < 2) {
                setErrors(prev => ({ ...prev, username: 'Kullanıcı adı en az 2 karakter olmalı' }));
            } else if (value.length > 16) {
                setErrors(prev => ({ ...prev, username: 'Kullanıcı adı en fazla 16 karakter olmalı' }));
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                setErrors(prev => ({ ...prev, username: 'Sadece harf, rakam ve alt çizgi kullanın' }));
            }
        }

        if (field === 'email' && value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Geçerli bir e-posta adresi girin' }));
            }
        }

        if (field === 'password' && value) {
            const passwordErrors = [];
            if (value.length < 8) passwordErrors.push('en az 8 karakter');
            if (!/(?=.*[a-z])/.test(value)) passwordErrors.push('küçük harf');
            if (!/(?=.*[A-Z])/.test(value)) passwordErrors.push('büyük harf');
            if (!/(?=.*\d)/.test(value)) passwordErrors.push('rakam');

            if (passwordErrors.length > 0) {
                setErrors(prev => ({ ...prev, password: `Parola şunları içermeli: ${passwordErrors.join(', ')}` }));
            }
        }

        if (field === 'confirmPassword' && value) {
            if (value !== formData.password) {
                setErrors(prev => ({ ...prev, confirmPassword: 'Parolalar eşleşmiyor' }));
            }
        }
    };

    const openPrivacyPolicy = () => {
        Linking.openURL(`${API_CONFIG.BASE_URL}/privacy-policy`).catch((err) => {
            console.error('Link açılamadı:', err);
            Alert.alert('Hata', 'Gizlilik sözleşmesi açılamadı. Lütfen daha sonra tekrar deneyin.');
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        headerContainer: {
            alignItems: 'center',
            marginBottom: 40,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 18,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        formContainer: {
            width: '100%',
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.cardBackground,
        },
        passwordContainer: {
            position: 'relative',
        },
        passwordInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingRight: 50,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.cardBackground,
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
        inputError: {
            borderColor: colors.danger,
        },
        errorText: {
            color: colors.danger,
            fontSize: 14,
            marginTop: 4,
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 20,
        },
        buttonDisabled: {
            backgroundColor: colors.disabled,
        },
        buttonText: {
            color: colors.white,
            fontSize: 18,
            fontWeight: '600',
        },
        linkContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        linkText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        linkHighlight: {
            color: colors.primary,
            fontWeight: '600',
        },
        privacyContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 8,
            marginBottom: 8,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 4,
            marginRight: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkboxChecked: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        privacyText: {
            flex: 1,
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        privacyLink: {
            color: colors.primary,
            textDecorationLine: 'underline',
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <KeyboardAvoidingView
                behavior='height'
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Monera</Text>
                        <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Kullanıcı Adı</Text>
                            <TextInput
                                style={[styles.input, errors.username && styles.inputError]}
                                value={formData.username}
                                onChangeText={(text) => updateFormData('username', text)}
                                placeholder="Kullanıcı adınızı girin"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => emailRef.current?.focus()}
                                blurOnSubmit={false}
                            />
                            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>E-posta</Text>
                            <TextInput
                                ref={emailRef}
                                style={[styles.input, errors.email && styles.inputError]}
                                value={formData.email}
                                onChangeText={(text) => updateFormData('email', text)}
                                placeholder="E-posta adresinizi girin"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => nameRef.current?.focus()}
                                blurOnSubmit={false}
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>İsim</Text>
                            <TextInput
                                ref={nameRef}
                                style={[styles.input, errors.name && styles.inputError]}
                                value={formData.name}
                                onChangeText={(text) => updateFormData('name', text)}
                                placeholder="İsminizi girin"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="words"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                blurOnSubmit={false}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Parola</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    ref={passwordRef}
                                    style={[styles.passwordInput, errors.password && styles.inputError]}
                                    value={formData.password}
                                    onChangeText={(text) => updateFormData('password', text)}
                                    placeholder="Parolanızı girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="next"
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    blurOnSubmit={false}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="newPassword"
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
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Parola Tekrarı</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    ref={confirmPasswordRef}
                                    style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                                    placeholder="Parolanızı tekrar girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showConfirmPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleRegister}
                                    blurOnSubmit={false}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="newPassword"
                                    passwordRules="required: lower; required: upper; required: digit; max-consecutive: 2; minlength: 8;"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name={showConfirmPassword ? "visibility-off" : "visibility"}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Gizlilik Sözleşmesi Onayı */}
                        <View style={styles.privacyContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, acceptPrivacyPolicy && styles.checkboxChecked]}
                                onPress={() => {
                                    setAcceptPrivacyPolicy(!acceptPrivacyPolicy);
                                    if (errors.privacyPolicy) {
                                        setErrors(prev => ({ ...prev, privacyPolicy: null }));
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                {acceptPrivacyPolicy && (
                                    <Icon name="check" size={14} color={colors.white} />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.privacyText}>
                                <Text onPress={openPrivacyPolicy} style={styles.privacyLink}>
                                    Gizlilik Sözleşmesi
                                </Text>
                                'ni okudum ve kabul ediyorum.
                            </Text>
                        </View>
                        {errors.privacyPolicy && <Text style={styles.errorText}>{errors.privacyPolicy}</Text>}

                        <TouchableOpacity
                            style={[styles.button, (loading || !acceptPrivacyPolicy) && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading || !acceptPrivacyPolicy}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Kaydolunuyor...' : 'Kayıt Ol'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkContainer}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>
                                Zaten hesabınız var mı? <Text style={styles.linkHighlight}>Giriş yapın</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
