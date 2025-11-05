import { NavLink, useLocation } from 'react-router-dom'

const BottomNavigation = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/dashboard', label: 'Главный' },
    { path: '/payments', label: 'Платежи' },
    { path: '/my-cards', label: 'Мультибанк' },
    { path: '/analytics', label: 'Аналитика' },
    { path: '/budget-planning', label: 'Цели' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white px-1 py-3 z-50">
      <div className="flex justify-between items-center w-full">
        {navItems.map(({ path, label }, index) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => {
              // Стандартная логика для всех вкладок
              return `flex flex-col items-center py-2 px-0.5 rounded-lg transition-colors flex-1 ${
                isActive ? 'text-red-500' : 'text-gray-600'
              }`
            }}
          >
            {/* Иконки согласно дизайну */}
            {index === 0 && (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            )}
            {index === 1 && (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            )}
            {index === 2 && (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            )}
            {index === 3 && (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
            {index === 4 && (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            )}
            <span className="text-xs mt-0.5 font-normal leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
