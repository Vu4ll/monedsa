import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasConnected = isConnected;
            setIsConnected(state.isConnected);

            if (!state.isConnected && !hasShownOfflineAlert) {
                setHasShownOfflineAlert(true);
                Alert.alert(
                    'İnternet Bağlantısı Yok',
                    'Lütfen internet bağlantınızı kontrol edin.',
                    [{
                        text: 'Tamam',
                        onPress: () => setHasShownOfflineAlert(false)
                    }]
                );
            } else if (state.isConnected && !wasConnected) {
                setHasShownOfflineAlert(false);
            }
        });

        return () => unsubscribe();
    }, [isConnected, hasShownOfflineAlert]);

    return { isConnected };
};