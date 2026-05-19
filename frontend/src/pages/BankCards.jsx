import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'person_id', label: '人员ID' },
  { key: 'bank_name', label: '银行' },
  { key: 'card_last4', label: '卡号后4位' },
  { key: 'balance', label: '余额', render: v => v ? `${Number(v).toLocaleString()}` : '-' },
  { key: 'last_transaction_date', label: '最后动账', render: (v) => v || '-' },
  { key: 'status', label: '状态', render: v => v === 'active' ? '✅正常' : v === 'frozen' ? '❄️冻结' : '⏸️未激活' },
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
  const load = () => api.get('/bank-cards').then(setData)
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/bank-cards/${modal.id}`, form); else await api.post('/bank-cards', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/bank-cards/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">银行卡管理</h1>
        <button onClick={() => setModal({})} className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm">+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="bank_name" onEdit={row => setModal(row)} onDelete={handleDelete} />
      {modal && <FormModal title={modal.id ? '编辑银行卡' : '添加银行卡'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
