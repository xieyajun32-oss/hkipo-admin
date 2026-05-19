import React, { useState, useEffect } from 'react'

export default function FormModal({ title, fields, initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || {})
  useEffect(() => { setForm(initial || {}) }, [initial])

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form) }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'rgba(0,0,0,0.7)'}}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto border"
        style={{background: 'var(--bg-card)', borderColor: 'var(--border)'}}>
        <h2 className="text-lg font-bold mb-4" style={{color: 'var(--accent)'}}>{title}</h2>
        {fields.map(field => (
          <div key={field.key} className="mb-3">
            <label className="block text-xs mb-1" style={{color: 'var(--text-secondary)'}}>{field.label}</label>
            {field.type === 'select' ? (
              <select value={form[field.key] || ''} onChange={e => setForm({...form, [field.key]: e.target.value})}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}}>
                <option value="">请选择</option>
                {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <input type={field.type || 'text'} value={form[field.key] || ''}
                onChange={e => setForm({...form, [field.key]: e.target.value})}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}}
                placeholder={field.placeholder} required={field.required} />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-3 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border"
            style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}>取消</button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg font-medium"
            style={{background: 'var(--accent)', color: '#1a1a1a'}}>保存</button>
        </div>
      </form>
    </div>
  )
}
