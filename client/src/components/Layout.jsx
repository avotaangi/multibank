import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'
import PageTransition from './PageTransition'

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* <Header /> */}
      
      <main className="pb-16 overflow-x-hidden">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
