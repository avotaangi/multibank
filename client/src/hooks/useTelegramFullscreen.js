import { useState, useEffect, useCallback } from 'react';
import { 
  isTelegramWebApp, 
  getTelegramWebApp, 
  expandToFullscreen, 
  closeFullscreen,
  hapticFeedback 
} from '../utils/telegram';

export const useTelegramFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      setIsTelegram(true);
      setIsFullscreen(webApp.isExpanded);
      
      // Listen for viewport changes
      const handleViewportChanged = () => {
        setIsFullscreen(webApp.isExpanded);
      };

      webApp.onEvent('viewportChanged', handleViewportChanged);
      
      return () => {
        webApp.offEvent('viewportChanged', handleViewportChanged);
      };
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isTelegram) return;
    
    const webApp = getTelegramWebApp();
    if (webApp) {
      hapticFeedback('light');
      
      if (webApp.isExpanded) {
        webApp.close();
        setIsFullscreen(false);
      } else {
        webApp.expand();
        setIsFullscreen(true);
      }
    }
  }, [isTelegram]);

  const enterFullscreen = useCallback(() => {
    if (!isTelegram) return;
    
    expandToFullscreen();
    setIsFullscreen(true);
    hapticFeedback('light');
  }, [isTelegram]);

  const exitFullscreen = useCallback(() => {
    if (!isTelegram) return;
    
    closeFullscreen();
    setIsFullscreen(false);
    hapticFeedback('light');
  }, [isTelegram]);

  return {
    isFullscreen,
    isTelegram,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen
  };
};
