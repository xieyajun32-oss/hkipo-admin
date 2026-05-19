import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function IpoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ipo, setIpo] = useState(null)
  const [subs, setSubs] = useState([])
  const [brokers, setBrokers] = useState([])
  const [showSubscribe, setShowSubscribe] = useState(false)
  const [selected, setSelected] = useState([])
  const [lots, setLots] = useState(1)
  const [amount, setAmount] = useState(0)
  const [sellPrice, setSellPrice] = useState('')

  useEffect(() => {
    api.get(`/ipos/${id}`).then(setIpo)
    api.get(`/ipos/${id}/subscriptions`).then(setSubs)
    api.get('/brokers').then(setBrokers)
  }, [id])

  const handleBatchSubscribe = async () => {
    if (!selected.length) return alert('请选择账号')
    await api.post(`/ipos/${id}/batch-subscribe`, { broker_ids: selected, lots_applied: lots, amount })
    setShowSubscribe(false)
    setSelected([])
    api.get(`/ipos/${id}/subscriptions`).then(setSubs)
  }

  const handleBatchResult = async (isWon) => {
    const checkedIds = subs.filter(s => s._checked && s.status === 'pending').map(s => ({ broker_id: s.broker_id, is_won: isWon, shares_won: isWon ? s.lots_applied * 100 : 0 }))
    if (!checkedIds.length) return alert('请勾选要更新的记录')
    await api.put(`/ipos/${id}/batch-result`, { results: checkedIds })
    api.get(`/ipos/${id}/subscriptions`).then(setSubs)
  }

  const handleBatchSell = async () => {
    if (!sellPrice) return alert('请填入卖出价')
    const wonIds = subs.filter(s => s._checked && s.status === 'won').map(s => s.broker_id)
    if (!wonIds.length) return alert('请勾选已中签的记录')
    await api.put(`/ipos/${id}/batch-sell`, { sell_price: parseFloat(sellPrice), broker_ids: wonIds })
    setSellPrice('')
    api.get(`/ipos/${id}/subscriptions`).then(setSubs)
  }

  const toggleCheck = (idx) => {
    const updated = [...subs]
    updated[idx]._checked = !updated[idx]._checked
    setSubs(updated)
  }

  const toggleAll = () => {
    const allChecked = subs.every(s => s._checked)
    setSubs(subs.map(s => ({ ...s, _checked: !allChecked })))
  }

  // Broker IDs already subscribed
  const subscribedBrokerIds = new Set(subs.map(s => s.broker_id))
  const availableBrokers = brokers.filter(b => !subscribedBrokerIds.has(b.id) && b.status === 'active')

  if (!ipo) return <div className="text-gray-400">加载中...</div>

  const totalProfit = subs.filter(s => s.profit).reduce((sum, s) => sum + s.profit, 0)

  return (
    <div>
      <button onClick={() => navigate('/admin/ipos')} className="text-sm text-gray-500 mb-4 hover:underline">← 返回列表</button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{ipo.stock_name} ({ipo.stock_code})</h1>
          <p className="text-sm text-gray-500 mt-1">发行价: {ipo.offer_price} | 上市日: {ipo.listing_date || '待定'}</p>
        </div>
        <button onClick={() => setShowSubscribe(true)} className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm">+ 批量申购</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded p-3 text-center">
          <div className="text-lg font-bold">{subs.length}</div><div className="text-xs text-gray-500">参与账号</div>
        </div>
        <div className="bg-white border rounded p-3 text-center">
          <div className="text-lg font-bold">{subs.filter(s => s.is_won).length}</div><div className="text-xs text-gray-500">中签数</div>
        </div>
        <div className="bg-white border rounded p-3 text-center">
          <div className="text-lg font-bold text-green-600">{totalProfit.toLocaleString()}</div><div className="text-xs text-gray-500">总盈亏</div>
        </div>
      </div>

      {/* Batch actions */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => handleBatchResult(true)} className="text-xs border px-3 py-1 rounded hover:bg-green-50 text-green-700">✅ 批量标记中签</button>
        <button onClick={() => handleBatchResult(false)} className="text-xs border px-3 py-1 rounded hover:bg-red-50 text-red-600">❌ 批量标记未中</button>
        <div className="flex items-center gap-1">
          <input type="number" placeholder="卖出价" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="border rounded px-2 py-1 text-xs w-24" />
          <button onClick={handleBatchSell} className="text-xs border px-3 py-1 rounded hover:bg-blue-50 text-blue-600">💰 批量卖出</button>
        </div>
      </div>

      {/* Subscription table */}
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-gray-50">
          <th className="px-2 py-2"><input type="checkbox" onChange={toggleAll} /></th>
          <th className="text-left px-2 py-2">账号</th>
          <th className="text-left px-2 py-2">券商</th>
          <th className="text-left px-2 py-2">人员</th>
          <th className="text-left px-2 py-2">手数</th>
          <th className="text-left px-2 py-2">状态</th>
          <th className="text-left px-2 py-2">中签股数</th>
          <th className="text-left px-2 py-2">卖出价</th>
          <th className="text-left px-2 py-2">盈亏</th>
        </tr></thead>
        <tbody>
          {subs.map((s, idx) => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="px-2 py-2"><input type="checkbox" checked={!!s._checked} onChange={() => toggleCheck(idx)} /></td>
              <td className="px-2 py-2">{s.account_label}</td>
              <td className="px-2 py-2">{s.broker_name}</td>
              <td className="px-2 py-2">{s.person_name}</td>
              <td className="px-2 py-2">{s.lots_applied}</td>
              <td className="px-2 py-2">
                {s.status === 'pending' && '⏳待定'}
                {s.status === 'won' && '✅中签'}
                {s.status === 'lost' && '❌未中'}
                {s.status === 'sold' && '💰已卖'}
              </td>
              <td className="px-2 py-2">{s.shares_won || '-'}</td>
              <td className="px-2 py-2">{s.sell_price || '-'}</td>
              <td className="px-2 py-2 font-medium">{s.profit ? <span className={s.profit >= 0 ? 'text-green-600' : 'text-red-600'}>{s.profit.toLocaleString()}</span> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Batch subscribe modal */}
      {showSubscribe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[560px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">批量申购</h2>
            <div className="flex gap-4 mb-4">
              <div><label className="text-xs text-gray-500">申购手数</label><input type="number" value={lots} onChange={e => setLots(parseInt(e.target.value))} className="border rounded px-2 py-1 w-20 text-sm block" /></div>
              <div><label className="text-xs text-gray-500">申购金额</label><input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="border rounded px-2 py-1 w-28 text-sm block" /></div>
            </div>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium">选择账号 ({selected.length}/{availableBrokers.length})</span>
              <button onClick={() => setSelected(selected.length === availableBrokers.length ? [] : availableBrokers.map(b => b.id))} className="text-xs text-blue-600">全选/取消</button>
            </div>
            <div className="border rounded max-h-48 overflow-y-auto">
              {availableBrokers.map(b => (
                <label key={b.id} className="flex items-center px-3 py-1.5 hover:bg-gray-50 text-sm cursor-pointer">
                  <input type="checkbox" checked={selected.includes(b.id)} onChange={() => setSelected(selected.includes(b.id) ? selected.filter(x => x !== b.id) : [...selected, b.id])} className="mr-2" />
                  {b.account_label} - {b.broker_name} (余额: {b.balance?.toLocaleString()})
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSubscribe(false)} className="px-4 py-1.5 text-sm border rounded">取消</button>
              <button onClick={handleBatchSubscribe} className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded">确认申购 ({selected.length}个账号)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
