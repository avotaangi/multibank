import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import PageTransition from './PageTransition'

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pb-20">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
