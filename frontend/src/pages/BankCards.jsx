import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

const BANK_INFO_MARKER = '银行信息数据:'

const baseColumns = [
  { key: 'code', label: '编号', path: ['编号'], width: 52 },
  { key: 'phone_code', label: '手机编号', path: ['手机编号'], width: 78 },
  { key: 'name', label: '姓名', path: ['姓名'], width: 86 },
  { key: 'phillip_bound_bank', label: '辉立绑定银行', path: ['辉立绑定银行'], width: 108 },
]

const bankGroups = [
  {
    name: '汇丰',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '汇丰') },
    ],
  },
  {
    name: '中银',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '中银') },
    ],
  },
  {
    name: '众安',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'account', label: '众安账号387', path: ['众安账号387'], width: 112 },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transfer', label: '5.14转入', path: ['5.14转入'], width: 76 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '众安') },
    ],
  },
  {
    name: '天星395',
    columns: [
      { key: 'status', label: '天星', path: ['天星'] },
      { key: 'login', label: '天星登陆', path: ['天星登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transfer', label: '5.14转入', path: ['5.14转入'], width: 76 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '天星395') },
    ],
  },
  {
    name: '中信',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transfer', label: '5.14转入', path: ['5.14转入'], width: 76 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '中信') },
    ],
  },
  {
    name: '汇立390',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transfer', label: '5.14转入', path: ['5.14转入'], width: 76 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '汇立390') },
    ],
  },
  {
    name: '蚂蚁',
    columns: [
      { key: 'status', label: '注册情况', path: ['注册情况'] },
      { key: 'login', label: '是否能登陆', path: ['是否能登陆'] },
      { key: 'username', label: '用户名', path: ['用户名'], width: 112 },
      { key: 'transaction_age', label: '动账时间', hint: '已过几个月', render: (_, row) => transactionAge(row, '蚂蚁') },
    ],
  },
]

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

function bankInfoValue(row, ...path) {
  let value = extractBankInfo(row)
  for (const key of path) {
    value = value?.[key]
  }
  return value ?? ''
}

function bankValue(row, bank, column) {
  if (column.render) return column.render(null, row)
  return bankInfoValue(row, bank, ...(column.path || []))
}

function flattenValues(value) {
  if (value == null) return []
  if (typeof value !== 'object') return [String(value)]
  return Object.values(value).flatMap(flattenValues)
}

function parseDate(value) {
  if (!value) return null
  const text = String(value).trim()
  const full = text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (full) return new Date(Number(full[1]), Number(full[2]) - 1, Number(full[3]))

  const monthDay = text.match(/(^|[^\d])(\d{1,2})[./月](\d{1,2})(日)?/)
  if (monthDay) {
    const now = new Date()
    return new Date(now.getFullYear(), Number(monthDay[2]) - 1, Number(monthDay[3]))
  }
  return null
}

function monthsSince(date) {
  const now = new Date()
  let months = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
  if (now.getDate() < date.getDate()) months -= 1
  return Math.max(months, 0)
}

function transactionAge(row, bank) {
  const info = bankInfoValue(row, bank)
  if (!info || typeof info !== 'object') return ''

  const explicitDate = info['动账时间'] || info['最后动账'] || info['最后动账日期']
  const dateFromLabel = Object.keys(info).find(key => key.includes('转入') && info[key])
  const date = parseDate(explicitDate) || parseDate(dateFromLabel)

  if (!date) return ''
  return `已过${monthsSince(date)}个月`
}

function cellText(value) {
  if (value === '' || value == null) return '-'
  return String(value)
}

function columnWidth(column) {
  return column.width ? { minWidth: column.width, width: column.width } : { minWidth: 78 }
}

function BankInfoTable({ data }) {
  const [search, setSearch] = useState('')
  const topScrollRef = useRef(null)
  const tableScrollRef = useRef(null)
  const filtered = search
    ? data.filter(row => String(row.search_text || '').toLowerCase().includes(search.toLowerCase()))
    : data

  useEffect(() => {
    const top = topScrollRef.current
    const table = tableScrollRef.current
    if (!top || !table) return

    let syncing = false
    const sync = (source, target) => {
      if (syncing) return
      syncing = true
      target.scrollLeft = source.scrollLeft
      requestAnimationFrame(() => { syncing = false })
    }
    const onTopScroll = () => sync(top, table)
    const onTableScroll = () => sync(table, top)

    top.addEventListener('scroll', onTopScroll)
    table.addEventListener('scroll', onTableScroll)
    return () => {
      top.removeEventListener('scroll', onTopScroll)
      table.removeEventListener('scroll', onTableScroll)
    }
  }, [])

  return (
    <div>
      <div className="data-table-toolbar" style={{ top: 'calc(var(--admin-nav-height) + var(--admin-page-head-height))' }}>
        <input
          type="text"
          placeholder="搜索手机编号、姓名、银行信息..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-md px-3 py-1.5 text-xs mb-2 w-full max-w-sm outline-none"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />

        <div ref={topScrollRef} className="top-scrollbar">
          <div className="top-scrollbar-inner" style={{ width: 3600 }} />
        </div>
      </div>
      <div
        ref={tableScrollRef}
        className="overflow-auto rounded-lg border"
        style={{ borderColor: 'var(--border)', maxHeight: 'calc(100vh - var(--admin-nav-height) - var(--admin-page-head-height) - 88px)' }}
      >
        <table className="w-full min-w-[3600px] border-collapse text-xs">
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {baseColumns.map(column => (
                <th
                  key={column.key}
                  rowSpan={2}
                  className="sticky z-30 border px-2 py-2 text-center font-semibold whitespace-nowrap"
                  style={{ ...columnWidth(column), top: 0, background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {column.label}
                </th>
              ))}
              {bankGroups.map(group => (
                <th
                  key={group.name}
                  colSpan={group.columns.length}
                  className="sticky z-30 border px-2 py-1.5 text-center font-semibold whitespace-nowrap"
                  style={{ top: 0, background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {group.name}
                </th>
              ))}
            </tr>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {bankGroups.flatMap(group =>
                group.columns.map(column => (
                  <th
                    key={`${group.name}-${column.key}`}
                    className="sticky z-30 border px-2 py-1.5 text-center font-medium whitespace-nowrap"
                    style={{ ...columnWidth(column), top: 34, background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <span className="block">{column.label}</span>
                    {column.hint && <span className="mt-0.5 block text-[11px]" style={{ color: 'var(--text-muted)' }}>{column.hint}</span>}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr
                key={row.id}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {baseColumns.map(column => (
                  <td
                    key={column.key}
                    className="border px-2 py-1.5 text-center whitespace-nowrap"
                    style={{ ...columnWidth(column), borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {cellText(bankInfoValue(row, ...(column.path || [])))}
                  </td>
                ))}
                {bankGroups.flatMap(group =>
                  group.columns.map(column => (
                    <td
                      key={`${group.name}-${column.key}`}
                      className="border px-2 py-1.5 text-center whitespace-nowrap"
                      style={{ ...columnWidth(column), borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      {cellText(bankValue(row, group.name, column))}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无数据</div>}
      </div>
    </div>
  )
}

export default function BankCards() {
  const [data, setData] = useState([])
  const load = () => api.get('/bank-cards').then(rows => {
    setData(
      rows
        .filter(row => row.bank_name === '银行信息' || (row.notes || '').includes(BANK_INFO_MARKER))
        .map(row => ({ ...row, search_text: flattenValues(extractBankInfo(row)).join(' ') }))
        .sort((a, b) => Number(a.person_id || a.id) - Number(b.person_id || b.id))
    )
  })
  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="admin-page-head flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">银行信息</h1>
      </div>
      <BankInfoTable data={data} />
    </div>
  )
}
