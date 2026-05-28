import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { clearToken } from '../api/client'

const nav = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/persons', label: '信息总表', icon: '📋' },
  { path: '/admin/bank-cards', label: '银行信息', icon: '🏦' },
  { path: '/admin/sim-cards', label: '手机卡', icon: '📱' },
  { path: '/admin/brokers', label: '券商账号', icon: '📈' },
  { path: '/admin/ipos', label: 'IPO打新', icon: '🎯' },
  { path: '/admin/hk-brief', label: '港股简报', icon: '🧾' },
  { path: '/admin/ipo-template', label: '打新模板', icon: '🧮' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = () => { clearToken(); navigate('/login') }

  return (
    <div className="admin-compact min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Top nav bar */}
      <header className="border-b" style={{borderColor: 'var(--border)', background: 'var(--bg-secondary)'}}>
        <div className="w-full mx-auto px-3 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold whitespace-nowrap" style={{color: 'var(--accent)'}}>🏠 港股管理后台</span>
            <nav className="flex gap-1">
              {nav.map(item => (
                <Link key={item.path} to={item.path}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
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
          <button onClick={logout} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{color: 'var(--text-muted)'}}>
            退出
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full mx-auto px-3 py-4">
        <Outlet />
      </main>
    </div>
  )
}
