// Утилиты для определения платформы и настройки отступов

/**
 * Определяет, является ли устройство Android
 */
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('android');
};

/**
 * Определяет, является ли устройство iOS
 */
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Определяет, запущено ли приложение в Telegram WebApp
 */
export const isTelegramWebApp = () => {
  if (typeof window === 'undefined') return false;
  
  return window.Telegram && window.Telegram.WebApp;
};

/**
 * Получает безопасные отступы для текущей платформы
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };
  
  const isAndroidDevice = isAndroid();
  const isIOSDevice = isIOS();
  const isWebApp = isTelegramWebApp();
  
  // Для Telegram WebApp на Android
  if (isWebApp && isAndroidDevice) {
    return {
      top: 'env(safe-area-inset-top, 24px)',
      bottom: 'env(safe-area-inset-bottom, 0px)'
    };
  }
  
  // Для Telegram WebApp на iOS
  if (isWebApp && isIOSDevice) {
    return {
      top: 'env(safe-area-inset-top, 44px)',
      bottom: 'env(safe-area-inset-bottom, 34px)'
    };
  }
  
  // Для обычных браузеров
  return {
    top: 'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)'
  };
};

/**
 * Получает CSS стили для безопасных отступов
 */
export const getSafeAreaStyles = () => {
  const insets = getSafeAreaInsets();
  
  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    minHeight: `calc(100vh - ${insets.top} - ${insets.bottom})`
  };
};

/**
 * Получает классы для безопасных отступов
 */
export const getSafeAreaClasses = () => {
  const isAndroidDevice = isAndroid();
  const isIOSDevice = isIOS();
  const isWebApp = isTelegramWebApp();
  
  let classes = '';
  
  if (isWebApp) {
    if (isAndroidDevice) {
      classes += ' android-webapp';
    } else if (isIOSDevice) {
      classes += ' ios-webapp';
    } else {
      classes += ' webapp';
    }
  }
  
  return classes;
};
