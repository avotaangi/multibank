import { useMemo } from 'react';
import { isAndroid, isTelegramWebApp, getSafeAreaStyles } from '../utils/platform';

/**
 * Хук для адаптации под Android в Telegram WebApp
 */
export const useAndroidAdaptation = () => {
  const isAndroidDevice = isAndroid();
  const isWebApp = isTelegramWebApp();
  
  const styles = useMemo(() => {
    if (isAndroidDevice && isWebApp) {
      return {
        container: {
          paddingTop: 'env(safe-area-inset-top, 24px)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          minHeight: 'calc(100vh - env(safe-area-inset-top, 24px) - env(safe-area-inset-bottom, 8px))'
        },
        header: {
          paddingTop: 'env(safe-area-inset-top, 24px)'
        },
        bottomNav: {
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          paddingTop: '12px'
        }
      };
    }
    
    return {
      container: {
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      },
      header: {
        paddingTop: 'env(safe-area-inset-top)'
      },
      bottomNav: {
        paddingBottom: 'env(safe-area-inset-bottom)'
      }
    };
  }, [isAndroidDevice, isWebApp]);
  
  const classes = useMemo(() => {
    if (isAndroidDevice && isWebApp) {
      return {
        container: 'android-webapp',
        header: 'android-webapp-header',
        bottomNav: 'android-webapp-bottom'
      };
    }
    
    return {
      container: '',
      header: '',
      bottomNav: ''
    };
  }, [isAndroidDevice, isWebApp]);
  
  return {
    isAndroidDevice,
    isWebApp,
    isAndroidWebApp: isAndroidDevice && isWebApp,
    styles,
    classes
  };
};
