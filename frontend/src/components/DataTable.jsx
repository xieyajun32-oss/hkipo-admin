import React, { useEffect, useRef, useState } from 'react'

export default function DataTable({ columns, data, onEdit, onDelete, searchField, wide = false, summaryRow }) {
  const [search, setSearch] = useState('')
  const topScrollRef = useRef(null)
  const tableScrollRef = useRef(null)
  const hasActions = Boolean(onEdit || onDelete)
  const tableMinWidth = wide ? 3000 : undefined
  
  const filtered = search && searchField
    ? data.filter(row => String(row[searchField] || '').toLowerCase().includes(search.toLowerCase()))
    : data
  const resolvedSummaryRow = typeof summaryRow === 'function' ? summaryRow(filtered) : summaryRow

  useEffect(() => {
    const top = topScrollRef.current
    const table = tableScrollRef.current
    if (!top || !table || !wide) return

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
  }, [wide])

  return (
    <div>
      {searchField && (
        <input type="text" placeholder="🔍 搜索..." value={search} onChange={e => setSearch(e.target.value)}
          className="rounded-md px-3 py-1.5 text-xs mb-2 w-60 outline-none"
          style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} />
      )}
      {wide && (
        <div ref={topScrollRef} className="top-scrollbar">
          <div className="top-scrollbar-inner" style={{ width: tableMinWidth }} />
        </div>
      )}
      <div ref={tableScrollRef} className="overflow-x-auto rounded-lg border" style={{borderColor: 'var(--border)'}}>
        <table className={`w-full text-xs ${wide ? 'min-w-[3000px]' : 'min-w-max'}`}>
          <thead>
            <tr style={{background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)'}}>
              {columns.map(col => (
                <th key={col.key} className={`${wide ? 'px-2' : 'px-3'} text-left py-2 font-medium whitespace-nowrap`} style={{color: 'var(--text-secondary)'}}>{col.label}</th>
              ))}
              {hasActions && <th className={`${wide ? 'px-2' : 'px-3'} py-2 text-right font-medium whitespace-nowrap`} style={{color: 'var(--text-secondary)'}}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="transition-colors" style={{borderBottom: '1px solid var(--border)'}}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map(col => (
                  <td key={col.key} className={`${wide ? 'px-2' : 'px-3'} py-1.5 whitespace-nowrap`} style={{color: 'var(--text-primary)'}}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] || '-')}
                  </td>
                ))}
                {hasActions && (
                  <td className={`${wide ? 'px-2' : 'px-3'} py-1.5 text-right space-x-2 whitespace-nowrap`}>
                    {onEdit && <button onClick={() => onEdit(row)} className="text-xs hover:underline" style={{color: 'var(--accent)'}}>编辑</button>}
                    {onDelete && <button onClick={() => onDelete(row.id)} className="text-xs hover:underline" style={{color: 'var(--danger)'}}>删除</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {resolvedSummaryRow && filtered.length > 0 && (
            <tfoot>
              <tr style={{background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)'}}>
                {columns.map(col => (
                  <td key={col.key} className={`${wide ? 'px-2' : 'px-3'} py-1.5 whitespace-nowrap font-semibold`} style={{color: 'var(--text-primary)'}}>
                    {resolvedSummaryRow[col.key] ?? '-'}
                  </td>
                ))}
                {hasActions && <td className={`${wide ? 'px-2' : 'px-3'} py-1.5 whitespace-nowrap`} />}
              </tr>
            </tfoot>
          )}
        </table>
        {filtered.length === 0 && <div className="text-center py-10" style={{color: 'var(--text-muted)'}}>暂无数据</div>}
      </div>
    </div>
  )
}
