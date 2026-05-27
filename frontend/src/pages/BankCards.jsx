import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import DataTable from '../components/DataTable'

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

function bankInfoValue(row, ...path) {
  let value = extractBankInfo(row)
  for (const key of path) {
    value = value?.[key]
  }
  return value ?? ''
}

function flattenValues(value) {
  if (value == null) return []
  if (typeof value !== 'object') return [String(value)]
  return Object.values(value).flatMap(flattenValues)
}

const columns = [
  { key: 'code', label: '编号', render: (_, row) => bankInfoValue(row, '编号') },
  { key: 'phone_code', label: '手机编号', render: (_, row) => bankInfoValue(row, '手机编号') },
  { key: 'name', label: '姓名', render: (_, row) => bankInfoValue(row, '姓名') },
  { key: 'phillip_bound_bank', label: '辉立绑定银行', render: (_, row) => bankInfoValue(row, '辉立绑定银行') },
  { key: 'hsbc_status', label: '汇丰 注册情况', render: (_, row) => bankInfoValue(row, '汇丰', '注册情况') },
  { key: 'hsbc_login', label: '汇丰 是否能登陆', render: (_, row) => bankInfoValue(row, '汇丰', '是否能登陆') },
  { key: 'hsbc_username', label: '汇丰 用户名', render: (_, row) => bankInfoValue(row, '汇丰', '用户名') },
  { key: 'boc_status', label: '中银 注册情况', render: (_, row) => bankInfoValue(row, '中银', '注册情况') },
  { key: 'boc_login', label: '中银 是否能登陆', render: (_, row) => bankInfoValue(row, '中银', '是否能登陆') },
  { key: 'boc_username', label: '中银 用户名', render: (_, row) => bankInfoValue(row, '中银', '用户名') },
  { key: 'za_status', label: '众安 注册情况', render: (_, row) => bankInfoValue(row, '众安', '注册情况') },
  { key: 'za_login', label: '众安 是否能登陆', render: (_, row) => bankInfoValue(row, '众安', '是否能登陆') },
  { key: 'za_account', label: '众安 众安账号387', render: (_, row) => bankInfoValue(row, '众安', '众安账号387') },
  { key: 'za_username', label: '众安 用户名', render: (_, row) => bankInfoValue(row, '众安', '用户名') },
  { key: 'za_transfer', label: '众安 5.14转入', render: (_, row) => bankInfoValue(row, '众安', '5.14转入') },
  { key: 'astar_status', label: '天星395 天星', render: (_, row) => bankInfoValue(row, '天星395', '天星') },
  { key: 'astar_login', label: '天星395 天星登陆', render: (_, row) => bankInfoValue(row, '天星395', '天星登陆') },
  { key: 'astar_username', label: '天星395 用户名', render: (_, row) => bankInfoValue(row, '天星395', '用户名') },
  { key: 'astar_transfer', label: '天星395 5.14转入', render: (_, row) => bankInfoValue(row, '天星395', '5.14转入') },
  { key: 'citic_status', label: '中信 注册情况', render: (_, row) => bankInfoValue(row, '中信', '注册情况') },
  { key: 'citic_login', label: '中信 是否能登陆', render: (_, row) => bankInfoValue(row, '中信', '是否能登陆') },
  { key: 'citic_username', label: '中信 用户名', render: (_, row) => bankInfoValue(row, '中信', '用户名') },
  { key: 'citic_transfer', label: '中信 5.14转入', render: (_, row) => bankInfoValue(row, '中信', '5.14转入') },
  { key: 'phillip_status', label: '汇立390 注册情况', render: (_, row) => bankInfoValue(row, '汇立390', '注册情况') },
  { key: 'phillip_login', label: '汇立390 是否能登陆', render: (_, row) => bankInfoValue(row, '汇立390', '是否能登陆') },
  { key: 'phillip_username', label: '汇立390 用户名', render: (_, row) => bankInfoValue(row, '汇立390', '用户名') },
  { key: 'phillip_transfer', label: '汇立390 5.14转入', render: (_, row) => bankInfoValue(row, '汇立390', '5.14转入') },
  { key: 'ant_status', label: '蚂蚁 注册情况', render: (_, row) => bankInfoValue(row, '蚂蚁', '注册情况') },
  { key: 'ant_login', label: '蚂蚁 是否能登陆', render: (_, row) => bankInfoValue(row, '蚂蚁', '是否能登陆') },
  { key: 'ant_username', label: '蚂蚁 用户名', render: (_, row) => bankInfoValue(row, '蚂蚁', '用户名') },
]

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">银行信息</h1>
      </div>
      <DataTable columns={columns} data={data} searchField="search_text" wide />
    </div>
  )
}
