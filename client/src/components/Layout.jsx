import { Outlet } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Header from './Header'

const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pb-20">
        <Outlet />
      </main>
      
      <BottomNavigation />
    </div>
  )
}

export default Layout
