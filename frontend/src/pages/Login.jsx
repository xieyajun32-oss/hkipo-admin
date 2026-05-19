import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/auth/login', { email, password })
      setToken(data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-primary)'}}>
      <form onSubmit={handleSubmit} className="rounded-xl p-8 w-96 border" style={{background: 'var(--bg-card)', borderColor: 'var(--border)'}}>
        <h1 className="text-xl font-bold mb-1 text-center" style={{color: 'var(--accent)'}}>港股管理后台</h1>
        <p className="text-center text-sm mb-6" style={{color: 'var(--text-muted)'}}>登录以继续</p>
        {error && <div className="border rounded-lg p-2 mb-4 text-sm" style={{borderColor: '#f87171', color: '#fca5a5', background: '#1a0000'}}>{error}</div>}
        <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 mb-3 text-sm outline-none" 
          style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} required />
        <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg px-4 py-2.5 mb-5 text-sm outline-none"
          style={{background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} required />
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{background: 'var(--accent)', color: '#1a1a1a'}}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
