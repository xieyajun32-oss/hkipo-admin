import { jwtVerify } from 'jose'

export async function authMiddleware(c, next) {
  // Skip auth for login route
  if (c.req.path === '/api/auth/login') return next()
  
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未登录' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    c.set('user', payload)
    await next()
  } catch (e) {
    return c.json({ error: '登录已过期' }, 401)
  }
}
