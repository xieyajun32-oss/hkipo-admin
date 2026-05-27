import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import FormModal from '../components/FormModal'

function parseIpoNotes(notes) {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes)
    return Array.isArray(parsed?.applications) ? parsed : null
  } catch {
    return null
  }
}

function fmt(value) {
  if (value === null || value === undefined || value === '') return '-'
  return typeof value === 'number' ? value.toLocaleString() : value
}

function darkMarketDate(row) {
  return parseIpoNotes(row.notes)?.dark_market_date || '-'
}

const columns = [
  { key: 'stock_name', label: '股票名称' },
  { key: 'stock_code', label: '代码' },
  { key: 'offer_price', label: '发行价' },
  { key: 'applications_count', label: '申购账号', render: (_, row) => parseIpoNotes(row.notes)?.applications?.length || '-' },
  { key: 'total_lots', label: '认购手数', render: (_, row) => fmt(parseIpoNotes(row.notes)?.summary?.total_lots) },
  { key: 'total_fee', label: '手续费合计', render: (_, row) => fmt(parseIpoNotes(row.notes)?.summary?.total_fee) },
  { key: 'ipo_profit', label: '打新利润', render: (_, row) => <span className="ipo-profit-text">{fmt(parseIpoNotes(row.notes)?.summary?.ipo_profit)}</span> },
  { key: 'subscription_start', label: '招股开始' },
  { key: 'dark_market_date', label: '暗盘日期', render: (_, row) => darkMarketDate(row) },
]

const formFields = [
  { key: 'stock_name', label: '股票名称', required: true },
  { key: 'stock_code', label: '股票代码' },
  { key: 'offer_price', label: '发行价', type: 'number' },
  { key: 'subscription_start', label: '招股开始日', type: 'date' },
  { key: 'subscription_end', label: '招股结束日', type: 'date' },
  { key: 'listing_date', label: '暗盘日期', type: 'date' },
  { key: 'notes', label: '备注' },
]

export default function Ipos() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()
  const load = () => api.get('/ipos').then(setData)
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/ipos/${modal.id}`, form); else await api.post('/ipos', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/ipos/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">IPO 打新管理</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 新建IPO</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50">
            {columns.map(c => <th key={c.key} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">{c.label}</th>)}
            <th className="px-3 py-2 text-right">操作</th>
          </tr></thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/ipos/${row.id}`)}>
                {columns.map(c => <td key={c.key} className="px-3 py-2 whitespace-nowrap">{c.render ? c.render(row[c.key], row) : (row[c.key] || '-')}</td>)}
                <td className="px-3 py-2 text-right space-x-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setModal(row)} className="text-blue-600 hover:underline">编辑</button>
                  <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="text-center text-gray-400 py-8">暂无IPO记录</div>}
      </div>
      {modal && <FormModal title={modal.id ? '编辑IPO' : '新建IPO'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
