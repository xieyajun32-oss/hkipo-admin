import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { clearToken } from '../api/client'

const nav = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/persons', label: '人员', icon: '👥' },
  { path: '/admin/bank-cards', label: '银行卡', icon: '💳' },
  { path: '/admin/sim-cards', label: '手机卡', icon: '📱' },
  { path: '/admin/brokers', label: '券商', icon: '📈' },
  { path: '/admin/ipos', label: 'IPO打新', icon: '🎯' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => { clearToken(); navigate('/login') }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-gray-700">港股管理</div>
        <nav className="flex-1 p-2">
          {nav.map(item => (
            <Link key={item.path} to={item.path}
              className={`block px-3 py-2 rounded mb-1 text-sm ${
                location.pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="p-4 text-sm text-gray-400 hover:text-white border-t border-gray-700">
          退出登录
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
