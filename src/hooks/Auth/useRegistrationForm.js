import { useState, useRef } from 'react';
import { Alert, ToastAndroid, Linking } from 'react-native';
import { authService } from '../../services';
import { API_CONFIG } from '../../constants/api';

const useRegistrationForm = (navigation) => {
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
            newErrors.privacyPolicy = 'Gizlilik politikasını kabul etmelisiniz';
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
                } else if (errorMessage.includes('requests too quickly')) {
                    displayMessage = 'Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyiniz.';
                }

                ToastAndroid.show(displayMessage, ToastAndroid.SHORT);
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
            Alert.alert('Hata', 'Gizlilik politikası açılamadı. Lütfen daha sonra tekrar deneyin.');
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
