import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'

const INFO_MARKER = '信息总表数据:'

function extractInfoData(row) {
  const notes = row.notes || ''
  if (notes.includes(INFO_MARKER)) {
    try {
      return JSON.parse(notes.slice(notes.indexOf(INFO_MARKER) + INFO_MARKER.length).trim())
    } catch {
      return {}
    }
  }
  return {}
}

function infoValue(row, key, fallbackKey) {
  const data = extractInfoData(row)
  return data[key] ?? (fallbackKey ? row[fallbackKey] : '') ?? ''
}

const columns = [
  { key: 'code', label: '编号', render: (_, row) => infoValue(row, '编号', 'id') },
  { key: 'phone_code', label: '手机编号', render: (_, row) => infoValue(row, '手机编号') },
  { key: 'name', label: '姓名', render: (_, row) => infoValue(row, '姓名', 'name') },
  { key: 'owner', label: '负责人', render: (_, row) => infoValue(row, '负责人') },
  { key: 'relationship', label: '关系', render: (_, row) => infoValue(row, '关系', 'relationship') },
  { key: 'phone_number', label: '电话号码', render: (_, row) => infoValue(row, '电话号码') },
  { key: 'register_email', label: '注册邮箱', render: (_, row) => infoValue(row, '注册邮箱') },
  { key: 'phillip_email', label: '辉立新邮箱', render: (_, row) => infoValue(row, '辉立新邮箱') },
  { key: 'email_group', label: '邮箱分组', render: (_, row) => infoValue(row, '邮箱分组') },
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

  const load = () => api.get('/persons').then(rows => {
    setData([...rows].sort((a, b) => {
      const numA = Number(extractInfoData(a)['编号'] || a.id)
      const numB = Number(extractInfoData(b)['编号'] || b.id)
      return numA - numB
    }))
  })
  useEffect(() => { load() }, [])

  const handleSubmit = async (form) => {
    if (modal.id) await api.put(`/persons/${modal.id}`, form)
    else await api.post('/persons', form)
    setModal(null); load()
  }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/persons/${id}`); load() }}

  return (
    <div>
      <div className="admin-page-head flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">信息总表</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="name" onEdit={row => setModal(row)} onDelete={handleDelete} wide />
      {modal && <FormModal title={modal.id ? '编辑信息' : '添加信息'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
