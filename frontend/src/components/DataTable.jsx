import React, { useState } from 'react'

export default function DataTable({ columns, data, onEdit, onDelete, searchField }) {
  const [search, setSearch] = useState('')
  
  const filtered = search && searchField
    ? data.filter(row => String(row[searchField] || '').toLowerCase().includes(search.toLowerCase()))
    : data

  return (
    <div>
      {searchField && (
        <input type="text" placeholder="🔍 搜索..." value={search} onChange={e => setSearch(e.target.value)}
          className="rounded-lg px-4 py-2 text-sm mb-4 w-64 outline-none"
          style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} />
      )}
      <div className="overflow-x-auto rounded-xl border" style={{borderColor: 'var(--border)'}}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr style={{background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{color: 'var(--text-secondary)'}}>{col.label}</th>
              ))}
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap" style={{color: 'var(--text-secondary)'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="transition-colors" style={{borderBottom: '1px solid var(--border)'}}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap" style={{color: 'var(--text-primary)'}}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  {onEdit && <button onClick={() => onEdit(row)} className="text-sm hover:underline" style={{color: 'var(--accent)'}}>编辑</button>}
                  {onDelete && <button onClick={() => onDelete(row.id)} className="text-sm hover:underline" style={{color: 'var(--danger)'}}>删除</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10" style={{color: 'var(--text-muted)'}}>暂无数据</div>}
      </div>
    </div>
  )
}
