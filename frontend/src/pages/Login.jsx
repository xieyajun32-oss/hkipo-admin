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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-xl font-bold mb-6 text-center">港股管理后台</h1>
        {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
        <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3 text-sm" required />
        <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 text-sm" required />
        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
