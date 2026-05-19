import React, { useState } from 'react'

export default function DataTable({ columns, data, onEdit, onDelete, searchField }) {
  const [search, setSearch] = useState('')
  
  const filtered = search && searchField
    ? data.filter(row => String(row[searchField] || '').toLowerCase().includes(search.toLowerCase()))
    : data

  return (
    <div>
      {searchField && (
        <input type="text" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm mb-4 w-64" />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map(col => (
                <th key={col.key} className="text-left px-3 py-2 font-medium text-gray-600">{col.label}</th>
              ))}
              <th className="px-3 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-3 py-2 text-right space-x-2">
                  {onEdit && <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline">编辑</button>}
                  {onDelete && <button onClick={() => onDelete(row.id)} className="text-red-500 hover:underline">删除</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center text-gray-400 py-8">暂无数据</div>}
      </div>
    </div>
  )
}
