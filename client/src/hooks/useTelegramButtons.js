import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  setupBackButton, 
  hideBackButton, 
  showBackButton,
  setupMainButton,
  hideMainButton,
  showMainButton,
  setMainButtonText,
  setMainButtonColor,
  setMainButtonProgress,
  showSettingsButton,
  hideSettingsButton,
  setHeaderColor,
  setBackgroundColor,
  enableClosingConfirmation,
  disableClosingConfirmation,
  hapticFeedback
} from '../utils/telegram';

export const useTelegramButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Настройка кнопки "Назад" в зависимости от страницы
  useEffect(() => {
    const handleBack = () => {
      hapticFeedback('light');
      
      // Логика навигации в зависимости от текущей страницы
      switch (location.pathname) {
        case '/dashboard':
          // На главной странице - закрыть приложение
          const webApp = window.Telegram?.WebApp;
          if (webApp) {
            webApp.close();
          }
          break;
        case '/my-cards':
        case '/analytics':
        case '/budget-planning':
        case '/deposits':
        case '/credits':
        case '/transfer':
          // На других страницах - вернуться на главную
          navigate('/dashboard');
          break;
        case '/card-analytics':
          // На аналитике карты - вернуться к картам
          navigate('/my-cards');
          break;
        default:
          // По умолчанию - вернуться на главную
          navigate('/dashboard');
      }
    };

    // Показываем кнопку "Назад" на всех страницах кроме главной
    if (location.pathname !== '/dashboard') {
      showBackButton();
      setupBackButton(handleBack);
    } else {
      hideBackButton();
    }

    // Очистка при размонтировании
    return () => {
      hideBackButton();
    };
  }, [location.pathname, navigate]);

  // Главная кнопка отключена - всегда скрываем
  useEffect(() => {
    hideMainButton();
  }, [location.pathname]);

  // Кнопка Settings отключена - всегда скрываем
  useEffect(() => {
    hideSettingsButton();
  }, [location.pathname]);

  // Настройка цветов и других параметров
  useEffect(() => {
    // Устанавливаем цвета в зависимости от темы
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
      setHeaderColor('#1f2937'); // Темно-серый
      setBackgroundColor('#111827'); // Очень темно-серый
    } else {
      setHeaderColor('#f9fafb'); // Светло-серый
      setBackgroundColor('#ffffff'); // Белый
    }

    // Включаем подтверждение закрытия
    enableClosingConfirmation();
  }, []);

  // Функции для управления кнопками
  const showMainButtonWithText = useCallback((text, onClick, color = '#2481cc') => {
    setupMainButton(text, onClick, color);
  }, []);

  const hideMainButtonCompletely = useCallback(() => {
    hideMainButton();
  }, []);

  const setMainButtonLoading = useCallback((loading) => {
    setMainButtonProgress(loading);
  }, []);

  const showSettings = useCallback(() => {
    showSettingsButton();
  }, []);

  const hideSettings = useCallback(() => {
    hideSettingsButton();
  }, []);

  return {
    showMainButtonWithText,
    hideMainButtonCompletely,
    setMainButtonLoading,
    showSettings,
    hideSettings,
    hapticFeedback
  };
};
