import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const BANK_INFO_MARKER = '银行信息数据:'

function extractBankInfo(row) {
  const notes = row.notes || ''
  if (notes.includes(BANK_INFO_MARKER)) {
    try {
      return JSON.parse(notes.slice(notes.indexOf(BANK_INFO_MARKER) + BANK_INFO_MARKER.length).trim())
    } catch {
      return {}
    }
  }
  return {}
}

function bankInfoValue(row, key) {
  return extractBankInfo(row)[key] ?? ''
}

const columns = [
  { key: 'hsbc', label: '汇丰', render: (_, row) => bankInfoValue(row, '汇丰') },
  { key: 'boc', label: '中银', render: (_, row) => bankInfoValue(row, '中银') },
  { key: 'za', label: '众安', render: (_, row) => bankInfoValue(row, '众安') },
  { key: 'astar_395', label: '天星395', render: (_, row) => bankInfoValue(row, '天星395') },
  { key: 'citic', label: '中信', render: (_, row) => bankInfoValue(row, '中信') },
  { key: 'phillip_390', label: '汇立390', render: (_, row) => bankInfoValue(row, '汇立390') },
  { key: 'ant', label: '蚂蚁', render: (_, row) => bankInfoValue(row, '蚂蚁') },
  { key: 'phillip_bound_bank', label: '辉立绑定银行', render: (_, row) => bankInfoValue(row, '辉立绑定银行') },
]

const formFields = [
  { key: 'person_id', label: '人员ID', type: 'number', required: true },
  { key: 'bank_name', label: '银行名称', required: true },
  { key: 'card_last4', label: '卡号后4位' },
  { key: 'balance', label: '余额', type: 'number' },
  { key: 'last_transaction_date', label: '最后动账日期', type: 'date' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'active', label: '正常' }, { value: 'frozen', label: '冻结' }, { value: 'inactive', label: '未激活' }
  ]},
  { key: 'notes', label: '备注' },
]

export default function BankCards() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(null)
  const load = () => api.get('/bank-cards').then(rows => {
    setData(
      rows
        .filter(row => row.bank_name === '银行信息' || (row.notes || '').includes(BANK_INFO_MARKER))
        .sort((a, b) => Number(a.person_id || a.id) - Number(b.person_id || b.id))
    )
  })
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/bank-cards/${modal.id}`, form); else await api.post('/bank-cards', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/bank-cards/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">银行信息</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: 'var(--accent)', color: '#1a1a1a'}}>+ 添加银行信息</button>
      </div>
      <DataTable columns={columns} data={data} searchField="bank_name" onEdit={row => setModal(row)} onDelete={handleDelete} wide />
      {modal && <FormModal title={modal.id ? '编辑银行信息' : '添加银行信息'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
