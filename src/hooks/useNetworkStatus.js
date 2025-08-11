import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

export const useNetworkStatus = () => {
    const { t, i18n } = useTranslation();
    const [isConnected, setIsConnected] = useState(true);
    const [hasShownOfflineAlert, setHasShownOfflineAlert] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const wasConnected = isConnected;
            setIsConnected(state.isConnected);

            if (!state.isConnected && !hasShownOfflineAlert) {
                setHasShownOfflineAlert(true);
                Alert.alert(
                    t("network.notConnected"),
                    t("network.check"),
                    [{
                        text: t("common.ok"),
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