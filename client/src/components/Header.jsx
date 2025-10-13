import useAuthStore from '../stores/authStore'
import { Bell, Menu } from 'lucide-react'
import { useAndroidAdaptation } from '../hooks/useAndroidAdaptation'

const Header = () => {
  const { user } = useAuthStore()
  const { styles, classes } = useAndroidAdaptation()

  return (
    <header 
      className={`bg-transparent absolute top-0 left-0 right-0 z-50 ${classes.header}`}
      style={styles.header}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MB</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">MultiBank</h1>
              <p className="text-xs text-white/80">
                {user?.firstName ? `Привет, ${user.firstName}!` : 'Добро пожаловать'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
