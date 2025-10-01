import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import PageTransition from './PageTransition'
import FullscreenButton from './FullscreenButton'

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="tg-viewport bg-white overflow-x-hidden">
      {/* Fullscreen Button - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <FullscreenButton />
      </div>
      
      <main className="pb-16 overflow-x-hidden h-full">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
