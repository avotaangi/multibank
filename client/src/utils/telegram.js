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
export const setupMainButton = (text, onClick) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
    return () => {
      webApp.MainButton.offClick(onClick);
      webApp.MainButton.hide();
    };
  }
  return () => {};
};

export const hideMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.hide();
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
