import React, { useState, useEffect } from 'react'

export default function FormModal({ title, fields, initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || {})

  useEffect(() => { setForm(initial || {}) }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto shadow-xl">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {fields.map(field => (
          <div key={field.key} className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">{field.label}</label>
            {field.type === 'select' ? (
              <select value={form[field.key] || ''} onChange={e => setForm({...form, [field.key]: e.target.value})}
                className="w-full border rounded px-3 py-1.5 text-sm">
                <option value="">请选择</option>
                {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <input type={field.type || 'text'} value={form[field.key] || ''}
                onChange={e => setForm({...form, [field.key]: e.target.value})}
                className="w-full border rounded px-3 py-1.5 text-sm"
                placeholder={field.placeholder} required={field.required} />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border rounded hover:bg-gray-50">取消</button>
          <button type="submit" className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-800">保存</button>
        </div>
      </form>
    </div>
  )
}
