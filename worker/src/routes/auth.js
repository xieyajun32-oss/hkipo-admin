import { Hono } from 'hono'
import { SignJWT } from 'jose'

const authRoutes = new Hono()

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'hkipo_salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) return c.json({ error: '请填写邮箱和密码' }, 400)

  const hash = await hashPassword(password)
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, role FROM users WHERE email = ? AND password_hash = ?'
  ).bind(email, hash).first()

  if (!user) return c.json({ error: '邮箱或密码错误' }, 401)

  const secret = new TextEncoder().encode(c.env.JWT_SECRET)
  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  return c.json({ token, user })
})

authRoutes.post('/register', async (c) => {
  const currentUser = c.get('user')
  if (!currentUser || currentUser.role !== 'admin') {
    return c.json({ error: '仅管理员可注册新用户' }, 403)
  }

  const { email, password, name, role } = await c.req.json()
  if (!email || !password) return c.json({ error: '邮箱和密码必填' }, 400)

  const hash = await hashPassword(password)
  try {
    await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, hash, name || '', role || 'viewer').run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '邮箱已存在' }, 409)
  }
})

authRoutes.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: '未登录' }, 401)
  return c.json(user)
})

// Init admin - first time setup
authRoutes.post('/init', async (c) => {
  const count = await c.env.DB.prepare('SELECT COUNT(*) as cnt FROM users').first()
  if (count.cnt > 0) return c.json({ error: '已初始化' }, 400)

  const { email, password, name } = await c.req.json()
  const hash = await hashPassword(password)
  await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
  ).bind(email, hash, name || '管理员', 'admin').run()
  return c.json({ success: true })
})

export { authRoutes }
