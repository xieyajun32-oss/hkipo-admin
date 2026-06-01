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

const brokerFundColumns = ['辉立', '华盛', '长桥', '盈立']
const bankFundColumns = ['汇丰', '中银', '众安', '汇立', '天星', '蚂蚁']
const fundAliases = {
  汇立: ['汇立390'],
  天星: ['天星395'],
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

function compactText(value) {
  if (value === '' || value == null) return '-'
  if (typeof value === 'object') return Object.values(value).filter(Boolean).join(' / ') || '-'
  return String(value)
}

function fundValue(row, institution) {
  const data = extractInfoData(row)
  const fundData = data['资金总表'] || data['资金'] || {}
  const names = [institution, ...(fundAliases[institution] || [])]
  const candidates = names.flatMap(name => [
    fundData[name],
    fundData[`${name}账户`],
    fundData[`${name}资金`],
    data[name],
    data[`${name}账户`],
    data[`${name}资金`],
  ])
  return candidates.find(value => value !== '' && value != null) ?? ''
}

function parseMoney(value) {
  if (value === '' || value == null || typeof value === 'object') return 0
  const text = String(value).replace(/[,，\s港币港元元￥¥HKDhkdcnyCNY]/g, '')
  const match = text.match(/-?\d+(\.\d+)?/)
  if (!match) return 0
  const num = Number(match[0])
  if (!Number.isFinite(num)) return 0
  if (text.includes('万')) return num * 10000
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value) {
  if (!value) return '-'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function rowFundTotal(row) {
  return [...brokerFundColumns, ...bankFundColumns].reduce((sum, institution) => sum + parseMoney(fundValue(row, institution)), 0)
}

const fundColumns = [
  { key: 'code', label: '编号', render: (_, row) => infoValue(row, '编号', 'id') },
  { key: 'phone_code', label: '手机编号', render: (_, row) => infoValue(row, '手机编号') },
  { key: 'person', label: '人员', render: (_, row) => infoValue(row, '姓名', 'name') },
  ...brokerFundColumns.map(name => ({
    key: `broker_${name}`,
    label: name,
    render: (_, row) => compactText(fundValue(row, name)),
  })),
  ...bankFundColumns.map(name => ({
    key: `bank_${name}`,
    label: name,
    render: (_, row) => compactText(fundValue(row, name)),
  })),
  { key: 'total', label: '合计', render: (_, row) => formatMoney(rowFundTotal(row)) },
  { key: 'fund_note', label: '备注', render: (_, row) => compactText(extractInfoData(row)['资金备注'] || extractInfoData(row)['备注']) },
]

function fundSummary(rows) {
  const summary = { code: '合计', phone_code: '-', person: '-' }
  for (const name of brokerFundColumns) {
    summary[`broker_${name}`] = formatMoney(rows.reduce((sum, row) => sum + parseMoney(fundValue(row, name)), 0))
  }
  for (const name of bankFundColumns) {
    summary[`bank_${name}`] = formatMoney(rows.reduce((sum, row) => sum + parseMoney(fundValue(row, name)), 0))
  }
  summary.total = formatMoney(rows.reduce((sum, row) => sum + rowFundTotal(row), 0))
  summary.fund_note = '-'
  return summary
}

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">信息总表</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="name" onEdit={row => setModal(row)} onDelete={handleDelete} wide />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3">资金总表</h2>
        <DataTable columns={fundColumns} data={data} searchField="name" wide summaryRow={fundSummary} />
      </div>
      {modal && <FormModal title={modal.id ? '编辑信息' : '添加信息'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
