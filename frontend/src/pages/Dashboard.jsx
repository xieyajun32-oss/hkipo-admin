import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Dashboard() {
  const [summary, setSummary] = useState({})
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.get('/dashboard/summary').then(setSummary).catch(() => {})
    api.get('/dashboard/alerts').then(setAlerts).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  const stats = [
    { label: '活跃券商账号', value: summary.total_brokers || 0, sub: '个账号在管理中' },
    { label: '总资金 (HKD)', value: (summary.total_balance || 0).toLocaleString(), sub: '券商总余额' },
    { label: '累计收益 (HKD)', value: (summary.total_profit || 0).toLocaleString(), sub: '打新总盈亏' },
    { label: '参与IPO', value: summary.total_ipos || 0, sub: '只新股' },
  ]

  const quickActions = [
    { label: '📈 券商管理', path: '/admin/brokers', color: '#d4a853' },
    { label: '🏦 银行信息', path: '/admin/bank-cards', color: '#4ade80' },
    { label: '📱 手机卡管理', path: '/admin/sim-cards', color: '#60a5fa' },
    { label: '🎯 IPO打新', path: '/admin/ipos', color: '#f472b6' },
    { label: '🧾 港股简报', path: '/admin/hk-brief', color: '#38bdf8' },
    { label: '📋 信息总表', path: '/admin/persons', color: '#a78bfa' },
  ]

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{greeting}，老谢</h1>
        <p style={{color: 'var(--text-secondary)'}}>所有账号/银行卡/手机卡数据都在这里。点下方任意卡片进入管理。</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl p-5 border" style={{background: 'var(--bg-card)', borderColor: 'var(--border)'}}>
            <div className="text-sm mb-2" style={{color: 'var(--text-secondary)'}}>{stat.label}</div>
            <div className="text-3xl font-bold" style={{color: 'var(--accent)'}}>{stat.value}</div>
            <div className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3" style={{color: 'var(--text-secondary)'}}>快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:scale-105"
              style={{borderColor: action.color, color: action.color, background: 'var(--bg-card)'}}>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3" style={{color: 'var(--text-secondary)'}}>⚠️ 预警提醒</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: alert.level === 'danger' ? '#f87171' : '#fbbf24',
                  color: alert.level === 'danger' ? '#fca5a5' : '#fde68a'
                }}>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
