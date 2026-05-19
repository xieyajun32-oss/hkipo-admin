import React, { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Dashboard() {
  const [summary, setSummary] = useState({})
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.get('/dashboard/summary').then(setSummary).catch(() => {})
    api.get('/dashboard/alerts').then(setAlerts).catch(() => {})
  }, [])

  const cards = [
    { label: '活跃券商账号', value: summary.total_brokers || 0, icon: '📈' },
    { label: '总资金 (HKD)', value: `${(summary.total_balance || 0).toLocaleString()}`, icon: '💰' },
    { label: '累计收益 (HKD)', value: `${(summary.total_profit || 0).toLocaleString()}`, icon: '🎉' },
    { label: '参与IPO数', value: summary.total_ipos || 0, icon: '🎯' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-5 shadow-sm border">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">⚠️ 预警</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded text-sm ${
                alert.level === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
