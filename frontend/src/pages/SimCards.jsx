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

function sheetValue(row, key, fallbackKey, ...aliases) {
  const data = extractSheetData(row)
  for (const dataKey of [key, ...aliases]) {
    if (data[dataKey] != null) return data[dataKey]
  }
  return (fallbackKey ? row[fallbackKey] : '') ?? ''
}

function parseAmount(value) {
  if (value == null) return null
  const text = String(value).replace(/[,，\s元]/g, '')
  if (!text || text === '/' || text.includes('已退')) return null
  const match = text.match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

function formatAmount(value) {
  if (value == null || Number.isNaN(value)) return '-'
  return Number(value.toFixed(2)).toLocaleString()
}

function formatTotalAmount(value) {
  if (value == null || Number.isNaN(value)) return '-'
  return `${formatAmount(value)} 元`
}

function sumSheetAmounts(rows, key, fallbackKey, ...aliases) {
  const amounts = rows
    .map(row => parseAmount(sheetValue(row, key, fallbackKey, ...aliases)))
    .filter(value => value != null)

  if (amounts.length === 0) return null
  return amounts.reduce((sum, value) => sum + value, 0)
}

function sumComputedAmounts(rows, getter) {
  const amounts = rows
    .map(row => getter(row))
    .filter(value => value != null)

  if (amounts.length === 0) return null
  return amounts.reduce((sum, value) => sum + value, 0)
}

function getCurrentBalance(row) {
  const packageFee = parseAmount(sheetValue(row, '当前套餐', 'monthly_cost'))
  const balance0511 = parseAmount(sheetValue(row, '5月11余额', null, '5.11余额'))
  const rechargeMay = parseAmount(sheetValue(row, '5月充值'))

  if (balance0511 == null) return null
  return balance0511 + (rechargeMay || 0) - (packageFee || 0)
}

function getJuneBalance(row) {
  const packageFee = parseAmount(sheetValue(row, '当前套餐', 'monthly_cost'))
  const mayBalance = getCurrentBalance(row)
  const rechargeJune = parseAmount(sheetValue(row, '6月充值'))

  if (mayBalance == null) return null
  return mayBalance + (rechargeJune || 0) - (packageFee || 0)
}

function getNextMonthBalance(row) {
  const packageFee = parseAmount(sheetValue(row, '当前套餐', 'monthly_cost'))
  const juneBalance = getJuneBalance(row)

  if (juneBalance == null) return null
  return juneBalance - (packageFee || 0)
}

function getArrearsStatus(row) {
  const balance = getJuneBalance(row)
  const nextMonthBalance = getNextMonthBalance(row)

  if (balance == null) return { text: '余额未知', color: 'var(--text-muted)' }
  if (balance < 0) return { text: `已欠费 ${formatAmount(Math.abs(balance))}`, color: 'var(--danger)' }
  if (nextMonthBalance != null && nextMonthBalance < 0) {
    return { text: `本月正常，下月欠费 ${formatAmount(Math.abs(nextMonthBalance))}`, color: 'var(--warning)' }
  }
  return { text: '正常', color: 'var(--success)' }
}

function getSortNumber(row) {
  const code = String(sheetValue(row, '编号') || '')
  const match = code.match(/\d+/)
  return match ? Number(match[0]) : row.id
}

const columns = [
  { key: 'code', label: '编号', render: (_, row) => sheetValue(row, '编号') },
  { key: 'name', label: '姓名', render: (_, row) => sheetValue(row, '姓名') },
  { key: 'phone_number', label: '电话号', render: (_, row) => sheetValue(row, '电话号', 'phone_number', '电话号码') },
  { key: 'carrier', label: '运营商', render: (_, row) => sheetValue(row, '运营商', 'carrier') },
  { key: 'plan_name', label: '卡片类别', render: (_, row) => sheetValue(row, '卡片类别', 'plan_name') },
  { key: 'monthly_cost', label: '当前套餐', render: (_, row) => sheetValue(row, '当前套餐', 'monthly_cost') },
  { key: 'balance_0320', label: '3月20余额', render: (_, row) => sheetValue(row, '3月20余额', null, '3.20余额') },
  { key: 'recharge_3m', label: '3月充值', render: (_, row) => sheetValue(row, '3月充值') },
  { key: 'balance_0511', label: '5月11余额', render: (_, row) => sheetValue(row, '5月11余额', null, '5.11余额') },
  { key: 'recharge_5m', label: '5月充值', render: (_, row) => sheetValue(row, '5月充值') },
  { key: 'recharge_6m', label: '6月充值', render: (_, row) => sheetValue(row, '6月充值') },
  { key: 'payment_channel', label: '缴费渠道', render: (_, row) => sheetValue(row, '缴费渠道') },
  { key: 'call_once', label: '5月通话一次', render: (_, row) => sheetValue(row, '通话一次', null, '通话1次') },
  { key: 'current_balance', label: '5月余额', render: (_, row) => formatAmount(getCurrentBalance(row)) },
  { key: 'june_balance', label: '6月余额', render: (_, row) => formatAmount(getJuneBalance(row)) },
  { key: 'next_month_balance', label: '预计下月余额', render: (_, row) => formatAmount(getNextMonthBalance(row)) },
  { key: 'arrears_notice', label: '欠费提醒', render: (_, row) => {
    const status = getArrearsStatus(row)
    return <span style={{color: status.color}}>{status.text}</span>
  } },
]

function getSummaryRow(rows) {
  return {
    code: '合计',
    monthly_cost: formatTotalAmount(sumSheetAmounts(rows, '当前套餐', 'monthly_cost')),
    recharge_3m: formatTotalAmount(sumSheetAmounts(rows, '3月充值')),
    recharge_5m: formatTotalAmount(sumSheetAmounts(rows, '5月充值')),
    recharge_6m: formatTotalAmount(sumSheetAmounts(rows, '6月充值')),
    current_balance: formatTotalAmount(sumComputedAmounts(rows, getCurrentBalance)),
    june_balance: formatTotalAmount(sumComputedAmounts(rows, getJuneBalance)),
    next_month_balance: formatTotalAmount(sumComputedAmounts(rows, getNextMonthBalance)),
  }
}

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
  const load = () => api.get('/sim-cards').then(rows => {
    setData([...rows].sort((a, b) => getSortNumber(a) - getSortNumber(b)))
  })
  useEffect(() => { load() }, [])
  const handleSubmit = async (form) => { if (modal.id) await api.put(`/sim-cards/${modal.id}`, form); else await api.post('/sim-cards', form); setModal(null); load() }
  const handleDelete = async (id) => { if(confirm('确定删除?')) { await api.del(`/sim-cards/${id}`); load() }}

  return (
    <div>
      <div className="admin-page-head flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">手机卡管理</h1>
        <button onClick={() => setModal({})} className="px-4 py-2 rounded-lg text-sm font-medium" style={{background: "var(--accent)", color: "#1a1a1a"}}>+ 添加</button>
      </div>
      <DataTable columns={columns} data={data} searchField="phone_number" onEdit={row => setModal(row)} onDelete={handleDelete} wide summaryRow={getSummaryRow} />
      {modal && <FormModal title={modal.id ? '编辑手机卡' : '添加手机卡'} fields={formFields} initial={modal} onSubmit={handleSubmit} onClose={() => setModal(null)} />}
    </div>
  )
}
