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

  // Настройка главной кнопки в зависимости от страницы
  useEffect(() => {
    const setupMainButtonForPage = () => {
      switch (location.pathname) {
        case '/transfer':
          // На странице переводов - кнопка "Отправить"
          setupMainButton('Отправить', () => {
            hapticFeedback('success');
            // Здесь будет логика отправки перевода
            console.log('Отправка перевода');
          }, '#2481cc');
          break;
        case '/budget-planning':
          // На странице планирования - кнопка "Добавить цель"
          setupMainButton('Добавить цель', () => {
            hapticFeedback('success');
            // Здесь будет логика добавления цели
            console.log('Добавление цели');
          }, '#10b981');
          break;
        case '/my-cards':
          // На странице карт - кнопка "Добавить карту"
          setupMainButton('Добавить карту', () => {
            hapticFeedback('success');
            // Здесь будет логика добавления карты
            console.log('Добавление карты');
          }, '#8b5cf6');
          break;
        default:
          // На остальных страницах - скрываем главную кнопку
          hideMainButton();
      }
    };

    setupMainButtonForPage();

    // Очистка при размонтировании
    return () => {
      hideMainButton();
    };
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
