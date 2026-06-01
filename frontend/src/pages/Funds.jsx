import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'

const INFO_MARKER = '信息总表数据:'
const brokerFundColumns = ['辉立', '华盛', '长桥', '盈立']
const bankFundColumns = ['汇丰', '中银', '众安', '汇立', '天星', '蚂蚁']
const fundAliases = {
  汇立: ['汇立390'],
  天星: ['天星395'],
}

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
  return num
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

export default function Funds() {
  const [data, setData] = useState([])

  useEffect(() => {
    api.get('/persons').then(rows => {
      setData([...rows].sort((a, b) => {
        const numA = Number(extractInfoData(a)['编号'] || a.id)
        const numB = Number(extractInfoData(b)['编号'] || b.id)
        return numA - numB
      }))
    })
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">资金总表</h1>
      </div>
      <DataTable columns={fundColumns} data={data} searchField="name" wide summaryRow={fundSummary} />
    </div>
  )
}
