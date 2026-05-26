import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

function extractSheetData(row) {
  const notes = row.notes || ''
  const marker = '表格数据:'
  if (notes.includes(marker)) {
    try {
      return JSON.parse(notes.slice(notes.indexOf(marker) + marker.length).trim())
    } catch {
      return {}
    }
  }
  return {}
}

function sheetValue(row, key, fallbackKey) {
  const data = extractSheetData(row)
  return data[key] ?? (fallbackKey ? row[fallbackKey] : '') ?? ''
}

const columns = [
  { key: 'code', label: '编号', render: (_, row) => sheetValue(row, '编号') },
  { key: 'name', label: '姓名', render: (_, row) => sheetValue(row, '姓名') },
  { key: 'phone_number', label: '电话号码', render: (_, row) => sheetValue(row, '电话号码', 'phone_number') },
  { key: 'carrier', label: '运营商', render: (_, row) => sheetValue(row, '运营商', 'carrier') },
  { key: 'plan_name', label: '卡片类别', render: (_, row) => sheetValue(row, '卡片类别', 'plan_name') },
  { key: 'monthly_cost', label: '当前套餐', render: (_, row) => sheetValue(row, '当前套餐', 'monthly_cost') },
  { key: 'balance_0320', label: '3.20余额', render: (_, row) => sheetValue(row, '3.20余额') },
  { key: 'recharge_3m', label: '3月充值', render: (_, row) => sheetValue(row, '3月充值') },
  { key: 'balance_0511', label: '5.11余额', render: (_, row) => sheetValue(row, '5.11余额') },
  { key: 'recharge_5m', label: '5月充值', render: (_, row) => sheetValue(row, '5月充值') },
  { key: 'payment_channel', label: '缴费渠道', render: (_, row) => sheetValue(row, '缴费渠道') },
  { key: 'call_once', label: '通话1次', render: (_, row) => sheetValue(row, '通话1次') },
]

const formFields = [
  { key: 'person_id', label: '人员ID', type: 'number', required: true },
  { key: 'phone_number', label: '手机号', required: true },
  { key: 'carrier', label: '运营商' },
  { key: 'plan_name', label: '套餐名称' },
  { key: 'monthly_cost', label: '月租', type: 'number' },
  { key: 'plan_expiry_date', label: '套餐到期日', type: 'date' },
  { key: 'balance', label: '话费余额', type: 'number' },
  { key: 'usage_type', label: '用途' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'active', label: '正常' }, { value: 'overdue', label: '欠费' }, { value: 'cancelled', label: '已注销' }
  ]},
  { key: 'notes', label: '备注' },
]

export default function SimCards() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(null)
  const load = () => api.get('/sim-cards').then(setData)
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/sim-cards/${modal.id}`, form); else await api.post('/sim-cards', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/sim-cards/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">手机卡管理</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="phone_number" onEdit={row => setModal(row)} onDelete={handleDelete} />
      {modal && <FormModal title={modal.id ? '编辑手机卡' : '添加手机卡'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
