import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import PageTransition from './PageTransition'
import { useAndroidAdaptation } from '../hooks/useAndroidAdaptation'

const Layout = () => {
  const location = useLocation();
  const { styles, classes, isAndroidWebApp } = useAndroidAdaptation();
  
  return (
    <div 
      className={`min-h-screen bg-white ${classes.container}`}
      style={styles.container}
    >
      <main className="pb-16 min-h-screen">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
