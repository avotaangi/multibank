import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import PageTransition from './PageTransition'
import { useScrollToTop } from '../hooks/useScrollToTop'

const Layout = () => {
  const location = useLocation();
  const mainRef = useRef(null);
  
  // Прокрутка наверх при изменении маршрута
  useScrollToTop();
  
  // Дополнительная прокрутка через ref
  useEffect(() => {
    const scrollToTop = () => {
      // Прокрутка window
      window.scrollTo(0, 0);
      
      // Прокрутка через ref
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        mainRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      
      // Прокрутка всех элементов
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };
    
    // Множественные попытки прокрутки
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTop();
      });
    });
    
    const timeouts = [0, 10, 50, 100, 200, 300].map(delay => 
      setTimeout(scrollToTop, delay)
    );
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen bg-white">
      <main ref={mainRef} className="pb-16 min-h-screen">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
