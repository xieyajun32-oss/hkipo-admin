const API_BASE = 'https://hkipo-api.xieyajun32.workers.dev/api'

function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const method = options.method || 'GET'
  const url = method === 'GET'
    ? `${API_BASE}${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`
    : `${API_BASE}${path}`

  const res = await fetch(url, { ...options, headers, cache: 'no-store' })
  const data = await res.json()
  if (res.status === 401) {
    clearToken()
    if (path !== '/auth/login') {
      window.location.href = '/login'
    }
    throw new Error(data.error || '未登录')
  }
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
}
