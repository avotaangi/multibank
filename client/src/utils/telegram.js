// Telegram WebApp API utilities
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
};

export const getTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp;
  }
  return null;
};

/**
 * Получает платформу из Telegram WebApp API
 * Возвращает: 'android', 'ios', 'web', 'tdesktop', 'macos', 'linux', 'windows' и т.д.
 */
export const getTelegramPlatform = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.platform) {
    return webApp.platform.toLowerCase();
  }
  return null;
};

// Fullscreen functionality
export const toggleFullscreen = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    if (webApp.isExpanded) {
      webApp.close();
    } else {
      webApp.expand();
    }
  }
};

export const expandToFullscreen = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    // Always try to expand, even if already expanded
    webApp.expand();
    
    // Also try to set viewport to full height
    if (webApp.viewportHeight) {
      webApp.viewportHeight = window.innerHeight;
    }
  }
};

export const closeFullscreen = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.isExpanded) {
    webApp.close();
  }
};

// Theme detection
export const getTelegramTheme = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    return webApp.colorScheme; // 'light' or 'dark'
  }
  return 'light';
};

// Back button
export const setupBackButton = (onBack) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.onClick(onBack);
    return () => {
      webApp.BackButton.offClick(onBack);
    };
  }
  return () => {};
};

export const showBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.show();
  }
};

export const hideBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.hide();
  }
};

// Main button
export const setupMainButton = (text, onClick, color = '#2481cc') => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setText(text);
    webApp.MainButton.setParams({ color: color });
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
    return () => {
      webApp.MainButton.offClick(onClick);
      webApp.MainButton.hide();
    };
  }
  return () => {};
};

export const showMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.show();
  }
};

export const hideMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.hide();
  }
};

export const setMainButtonText = (text) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setText(text);
  }
};

export const setMainButtonColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setParams({ color: color });
  }
};

export const setMainButtonProgress = (show) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    if (show) {
      webApp.MainButton.showProgress();
    } else {
      webApp.MainButton.hideProgress();
    }
  }
};

// Settings button
export const showSettingsButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.SettingsButton.show();
  }
};

export const hideSettingsButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.SettingsButton.hide();
  }
};

// Header and background colors
export const setHeaderColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.setHeaderColor(color);
  }
};

export const setBackgroundColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.setBackgroundColor(color);
  }
};

// Closing confirmation
export const enableClosingConfirmation = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.enableClosingConfirmation();
  }
};

export const disableClosingConfirmation = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.disableClosingConfirmation();
  }
};

// Haptic feedback
export const hapticFeedback = (type = 'light') => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.HapticFeedback) {
    switch (type) {
      case 'light':
        webApp.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        webApp.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        webApp.HapticFeedback.impactOccurred('heavy');
        break;
      case 'success':
        webApp.HapticFeedback.notificationOccurred('success');
        break;
      case 'error':
        webApp.HapticFeedback.notificationOccurred('error');
        break;
      case 'warning':
        webApp.HapticFeedback.notificationOccurred('warning');
        break;
      default:
        webApp.HapticFeedback.impactOccurred('light');
    }
  }
};
