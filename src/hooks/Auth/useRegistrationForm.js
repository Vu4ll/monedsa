import { useState, useRef } from 'react';
import { Alert, ToastAndroid, Linking } from 'react-native';
import { authService } from '../../services';
import { API_CONFIG } from '../../constants/api';
import { useTranslation } from 'react-i18next';

const useRegistrationForm = (navigation) => {
    const { t, i18n } = useTranslation();
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

    const emailRef = useRef(null);
    const nameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = t("registerScreen.validateForm.username.required");
        } else if (formData.username.length < 2) {
            newErrors.username = t("registerScreen.validateForm.username.minLength");
        } else if (formData.username.length >= 16) {
            newErrors.username = t("registerScreen.validateForm.username.maxLength");
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = t("registerScreen.validateForm.username.invalid");
        } else if (formData.username.split(" ").length > 1) {
            newErrors.username = t("registerScreen.validateForm.username.space");
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = t("registerScreen.validateForm.email.required");
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = t("registerScreen.validateForm.email.invalid");
        } else if (formData.email.length > 100) {
            newErrors.email = t("registerScreen.validateForm.email.tooLong");
        }

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = t("registerScreen.validateForm.name.required");
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t("registerScreen.validateForm.name.minLength");
        } else if (formData.name.trim().length > 50) {
            newErrors.name = t("registerScreen.validateForm.name.maxLength");
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = t("registerScreen.validateForm.password.required");
        } else if (formData.password.length < 8) {
            newErrors.password = t("registerScreen.validateForm.password.minLength");
        } else if (formData.password.length > 100) {
            newErrors.password = t("registerScreen.validateForm.password.tooLong");
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = t("registerScreen.validateForm.password.noLower");
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = t("registerScreen.validateForm.password.noUpper");
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = t("registerScreen.validateForm.password.noNumber");
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t("registerScreen.validateForm.passwordConfirm.required");
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("registerScreen.validateForm.passwordConfirm.noMatch");
        }

        // Privacy policy validation
        if (!acceptPrivacyPolicy) {
            newErrors.privacyPolicy = t("registerScreen.validateForm.acceptPrivacyPolicy");
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
                language: i18n.language
            });

            if (response.success) {
                Alert.alert(
                    t("registerScreen.handleRegister.success"),
                    t("registerScreen.handleRegister.accountCreated"),
                    [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
                );
            } else {
                const errorMessage = response.error || t("registerScreen.handleRegister.errorMessage");

                if (errorMessage.includes('username') && errorMessage.includes('already taken')) {
                    setErrors(prev => ({ ...prev, username: t("registerScreen.handleRegister.usernameTaken") }));
                } else if (errorMessage.includes('email') && errorMessage.includes('already registered')) {
                    setErrors(prev => ({ ...prev, email: t("registerScreen.handleRegister.emailTaken") }));
                } else if (errorMessage.includes('User already exists')) {
                    ToastAndroid.show(t("registerScreen.handleRegister.userExists"), ToastAndroid.SHORT);
                } else if (errorMessage.includes('requests too quickly')) {
                    ToastAndroid.show(t("registerScreen.handleRegister.ratelimit"), ToastAndroid.SHORT);
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            ToastAndroid.show(t("registerScreen.handleRegister.serverError"), ToastAndroid.SHORT);
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
                setErrors(prev => ({ ...prev, username: t("registerScreen.validateForm.username.minLength") }));
            } else if (value.length > 16) {
                setErrors(prev => ({ ...prev, username: t("registerScreen.validateForm.username.maxLength") }));
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                setErrors(prev => ({ ...prev, username: t("registerScreen.validateForm.username.invalid") }));
            }
        }

        if (field === 'email' && value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrors(prev => ({ ...prev, email: t("registerScreen.validateForm.email.invalid") }));
            }
        }

        if (field === 'password' && value) {
            const passwordErrors = [];
            if (value.length < 8) passwordErrors.push(t("registerScreen.updateFormData.minLength"));
            if (!/(?=.*[a-z])/.test(value)) passwordErrors.push(t("registerScreen.updateFormData.lowercase"));
            if (!/(?=.*[A-Z])/.test(value)) passwordErrors.push(t("registerScreen.updateFormData.uppercase"));
            if (!/(?=.*\d)/.test(value)) passwordErrors.push(t("registerScreen.updateFormData.number"));

            if (passwordErrors.length > 0) {
                setErrors(prev => ({ ...prev, password: t("registerScreen.updateFormData.passwordRules", { values: passwordErrors.join(', ') }) }));
            }
        }

        if (field === 'confirmPassword' && value) {
            if (value !== formData.password) {
                setErrors(prev => ({ ...prev, confirmPassword: t("registerScreen.validateForm.passwordConfirm.noMatch") }));
            }
        }
    };

    const openPrivacyPolicy = () => {
        Linking.openURL(`${API_CONFIG.BASE_URL}/privacy-policy?lang=${i18n.language}&redirect=/privacy-policy`).catch((err) => {
            console.error('Link cannot be opened:', err);
            ToastAndroid.show(t("registerScreen.openPrivacyPolicy"), ToastAndroid.SHORT);
        });
    };

    return {
        formData,
        setFormData,
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
    };
};

export default useRegistrationForm;
