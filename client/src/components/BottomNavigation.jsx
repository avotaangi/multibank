import { NavLink } from 'react-router-dom'
import { Home, CreditCard, History, Send, User } from 'lucide-react'

const BottomNavigation = () => {
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Главная' },
    { path: '/my-cards', icon: CreditCard, label: 'Карты' },
    { path: '/transactions', icon: History, label: 'История' },
    { path: '/transfer', icon: Send, label: 'Перевод' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
