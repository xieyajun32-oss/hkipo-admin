import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { clearToken } from '../api/client'

const nav = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/persons', label: '人员管理', icon: '👥' },
  { path: '/admin/bank-cards', label: '银行卡', icon: '💳' },
  { path: '/admin/sim-cards', label: '手机卡', icon: '📱' },
  { path: '/admin/brokers', label: '券商账号', icon: '📈' },
  { path: '/admin/ipos', label: 'IPO打新', icon: '🎯' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = () => { clearToken(); navigate('/login') }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Top nav bar */}
      <header className="border-b" style={{borderColor: 'var(--border)', background: 'var(--bg-secondary)'}}>
        <div className="w-full max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold" style={{color: 'var(--accent)'}}>🏠 港股管理后台</span>
            <nav className="flex gap-1">
              {nav.map(item => (
                <Link key={item.path} to={item.path}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    location.pathname === item.path 
                      ? 'text-white' 
                      : ''
                  }`}
                  style={{
                    background: location.pathname === item.path ? 'var(--bg-hover)' : 'transparent',
                    color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <button onClick={logout} className="text-sm px-3 py-1 rounded hover:opacity-80" style={{color: 'var(--text-muted)'}}>
            退出
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full max-w-[1600px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
