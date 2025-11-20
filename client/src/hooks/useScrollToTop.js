import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Хук для автоматической прокрутки наверх при изменении маршрута
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Агрессивная функция прокрутки наверх
    const scrollToTop = () => {
      // Прокрутка window - основной способ
      try {
        window.scrollTo(0, 0);
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      } catch (e) {
        console.log('Window scroll error:', e);
      }
      
      // Прокрутка documentElement
      try {
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
          document.documentElement.scrollLeft = 0;
          document.documentElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      } catch (e) {
        console.log('DocumentElement scroll error:', e);
      }
      
      // Прокрутка body
      try {
        if (document.body) {
          document.body.scrollTop = 0;
          document.body.scrollLeft = 0;
          document.body.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      } catch (e) {
        console.log('Body scroll error:', e);
      }
      
      // Прокрутка всех возможных контейнеров
      try {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          if (element.scrollTop !== undefined && element.scrollTop > 0) {
            element.scrollTop = 0;
          }
          if (element.scrollLeft !== undefined && element.scrollLeft > 0) {
            element.scrollLeft = 0;
          }
        });
      } catch (e) {
        console.log('Elements scroll error:', e);
      }
      
      // Прокрутка основного контейнера приложения
      try {
        const mainContainer = document.querySelector('main, [class*="min-h-screen"], [class*="overflow"]');
        if (mainContainer && mainContainer.scrollTop !== undefined) {
          mainContainer.scrollTop = 0;
          mainContainer.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      } catch (e) {
        console.log('Main container scroll error:', e);
      }
    };

    // Используем requestAnimationFrame для гарантии выполнения после рендера
    const rafId1 = requestAnimationFrame(() => {
      scrollToTop();
    });
    
    const rafId2 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTop();
      });
    });

    // Также используем setTimeout для дополнительной гарантии
    const timeoutId1 = setTimeout(scrollToTop, 0);
    const timeoutId2 = setTimeout(scrollToTop, 10);
    const timeoutId3 = setTimeout(scrollToTop, 50);
    const timeoutId4 = setTimeout(scrollToTop, 100);
    const timeoutId5 = setTimeout(scrollToTop, 200);
    const timeoutId6 = setTimeout(scrollToTop, 300);

    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(timeoutId4);
      clearTimeout(timeoutId5);
      clearTimeout(timeoutId6);
    };
  }, [pathname]);
};

