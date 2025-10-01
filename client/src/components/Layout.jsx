import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import PageTransition from './PageTransition'

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-white">
      <main className="min-h-screen">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export default Layout
