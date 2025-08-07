import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useTheme } from "../contexts/ThemeContext";
import useRegistrationForm from '../hooks/Auth/useRegistrationForm';
import AuthInput from '../components/Auth/AuthInput';
import PasswordInput from '../components/Auth/PasswordInput';
import PrivacyPolicyCheckbox from '../components/Auth/PrivacyPolicyCheckbox';
import AuthButton from '../components/Auth/AuthButton';
import AuthLink from '../components/Auth/AuthLink';

const RegisterScreen = ({ navigation }) => {
    const { isDarkMode, colors } = useTheme();
    const {
        formData,
        loading,
        errors,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        acceptPrivacyPolicy,
        setAcceptPrivacyPolicy,
        emailRef,
        nameRef,
        passwordRef,
        confirmPasswordRef,
        handleRegister,
        updateFormData,
        openPrivacyPolicy
    } = useRegistrationForm(navigation);

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
                        <Text style={styles.title}>Monedsa</Text>
                        <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <AuthInput
                            label="Kullanıcı Adı"
                            value={formData.username}
                            onChangeText={(text) => updateFormData('username', text.toLowerCase())}
                            placeholder="Kullanıcı adınızı girin"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            blurOnSubmit={false}
                            error={errors.username}
                        />

                        <AuthInput
                            label="E-posta"
                            value={formData.email}
                            onChangeText={(text) => updateFormData('email', text)}
                            placeholder="E-posta adresinizi girin"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                            onSubmitEditing={() => nameRef.current?.focus()}
                            blurOnSubmit={false}
                            inputRef={emailRef}
                            error={errors.email}
                        />

                        <AuthInput
                            label="İsim"
                            value={formData.name}
                            onChangeText={(text) => updateFormData('name', text)}
                            placeholder="İsminizi girin"
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            blurOnSubmit={false}
                            inputRef={nameRef}
                            error={errors.name}
                        />

                        <PasswordInput
                            label="Parola"
                            value={formData.password}
                            onChangeText={(text) => updateFormData('password', text)}
                            placeholder="Parolanızı girin"
                            inputRef={passwordRef}
                            error={errors.password}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                            blurOnSubmit={false}
                        />

                        <PasswordInput
                            label="Parola Tekrarı"
                            value={formData.confirmPassword}
                            onChangeText={(text) => updateFormData('confirmPassword', text)}
                            placeholder="Parolanızı tekrar girin"
                            inputRef={confirmPasswordRef}
                            error={errors.confirmPassword}
                            showPassword={showConfirmPassword}
                            setShowPassword={setShowConfirmPassword}
                            onSubmitEditing={handleRegister}
                            blurOnSubmit={false}
                        />

                        <PrivacyPolicyCheckbox
                            acceptPrivacyPolicy={acceptPrivacyPolicy}
                            setAcceptPrivacyPolicy={(value) => {
                                setAcceptPrivacyPolicy(value);
                                if (errors.privacyPolicy) {
                                    updateFormData('privacyPolicy', null);
                                }
                            }}
                            openPrivacyPolicy={openPrivacyPolicy}
                            error={errors.privacyPolicy}
                        />

                        <AuthButton
                            title="Kayıt Ol"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading || !acceptPrivacyPolicy}
                        />

                        <AuthLink
                            text="Zaten hesabınız var mı?"
                            highlightText="Giriş yapın"
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;