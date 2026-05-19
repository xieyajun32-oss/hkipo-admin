import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '姓名' },
  { key: 'relationship', label: '关系' },
  { key: 'notes', label: '备注' },
]

const formFields = [
  { key: 'name', label: '姓名', required: true },
  { key: 'relationship', label: '关系', type: 'select', options: [
    { value: '自己', label: '自己' }, { value: '朋友', label: '朋友' }, { value: '合作', label: '合作' }, { value: '家人', label: '家人' }
  ]},
  { key: 'notes', label: '备注' },
]

export default function Persons() {
  const [data, setData] = useState([])
  const [modal, setModal] = useState(null)

  const load = () => api.get('/persons').then(setData)
  useEffect(() => { load() }, [])

  const handleSubmit = async (form) => {
    if (modal.id) await api.put(`/persons/${modal.id}`, form)
    else await api.post('/persons', form)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/persons/${id}`); load() }}

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👥 人员管理</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="name" onEdit={row => setModal(row)} onDelete={handleDelete} />
      {modal && <FormModal title={modal.id ? '编辑人员' : '添加人员'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
