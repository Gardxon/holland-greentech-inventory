import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState('staff')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (data) {
          setUserRole(data.role)
        }
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => router.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/stock', label: 'Stock Movements', icon: '📈' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/reports', label: 'Reports', icon: '📉' },
    ...(userRole === 'admin' ? [{ path: '/users', label: 'Users', icon: '👥' }] : []),
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`sidebar-nav fixed inset-y-0 left-0 transform transition-all duration-200 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      } overflow-y-auto z-40`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-hgt-green ${sidebarOpen ? 'text-xl' : 'text-xs'}`}>
            {sidebarOpen ? 'HGT' : 'H'}
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-700 p-1 rounded"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="mt-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`px-4 py-3 cursor-pointer flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'bg-hgt-green text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded"
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <span className={`text-xs px-3 py-1 rounded ${
              userRole === 'admin'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {userRole?.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
