import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const columns = [
  { key: 'account_label', label: '账号标签' },
  { key: 'broker_name', label: '券商' },
  { key: 'person_id', label: '人员ID' },
  { key: 'balance', label: '余额(HKD)', render: v => v ? Number(v).toLocaleString() : '-' },
  { key: 'last_operation_date', label: '最后操作', render: v => v || '-' },
  { key: 'status', label: '状态', render: v => v === 'active' ? '✅活跃' : v === 'dormant' ? '💤休眠' : '❄️冻结' },
]

const formFields = [
  { key: 'account_label', label: '账号标签(如A001)', required: true },
  { key: 'broker_name', label: '券商名称', required: true, type: 'select', options: [
    { value: '辉立', label: '辉立' }, { value: '富途', label: '富途' }, { value: '长桥', label: '长桥' },
    { value: '老虎', label: '老虎' }, { value: '盈立', label: '盈立' }, { value: '华盛', label: '华盛' },
    { value: '致富', label: '致富' }, { value: '其他', label: '其他' }
  ]},
  { key: 'person_id', label: '人员ID', type: 'number', required: true },
  { key: 'bank_card_id', label: '银行卡ID', type: 'number' },
  { key: 'sim_card_id', label: '手机卡ID', type: 'number' },
  { key: 'balance', label: '余额', type: 'number' },
  { key: 'last_operation_date', label: '最后操作日期', type: 'date' },
  { key: 'status', label: '状态', type: 'select', options: [
    { value: 'active', label: '活跃' }, { value: 'dormant', label: '休眠' }, { value: 'frozen', label: '冻结' }
  ]},
  { key: 'notes', label: '备注' },
]

export default function Brokers() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(null)
  const load = () => api.get('/brokers').then(setData)
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/brokers/${modal.id}`, form); else await api.post('/brokers', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/brokers/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">券商管理</h1>
        <button onClick={() => setModal({})} className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm">+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="account_label" onEdit={row => setModal(row)} onDelete={handleDelete} />
      {modal && <FormModal title={modal.id ? '编辑券商账号' : '添加券商账号'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
