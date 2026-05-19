import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const iposRoutes = new Hono()
const fields = ['stock_name', 'stock_code', 'offer_price', 'listing_date', 'subscription_start', 'subscription_end', 'notes']
const crud = createCrudRoutes('ipos', fields)

iposRoutes.get('/', crud.list)
iposRoutes.get('/:id', crud.get)
iposRoutes.post('/', crud.create)
iposRoutes.put('/:id', crud.update)
iposRoutes.delete('/:id', crud.delete)

// Get subscriptions for an IPO
iposRoutes.get('/:id/subscriptions', async (c) => {
  const ipoId = c.req.param('id')
  const results = await c.env.DB.prepare(`
    SELECT s.*, b.account_label, b.broker_name, p.name as person_name
    FROM ipo_subscriptions s
    JOIN brokers b ON s.broker_id = b.id
    JOIN persons p ON b.person_id = p.id
    WHERE s.ipo_id = ?
    ORDER BY b.account_label
  `).bind(ipoId).all()
  return c.json(results.results || [])
})

// Batch subscribe: create subscription records for multiple brokers
iposRoutes.post('/:id/batch-subscribe', async (c) => {
  const ipoId = c.req.param('id')
  const { broker_ids, lots_applied, amount } = await c.req.json()
  
  if (!broker_ids || !broker_ids.length) return c.json({ error: '请选择账号' }, 400)

  const stmt = c.env.DB.prepare(
    'INSERT INTO ipo_subscriptions (ipo_id, broker_id, lots_applied, amount, status) VALUES (?, ?, ?, ?, ?)'
  )
  const batch = broker_ids.map(bid => stmt.bind(ipoId, bid, lots_applied || 1, amount || 0, 'pending'))
  await c.env.DB.batch(batch)
  return c.json({ success: true, count: broker_ids.length })
})

// Batch update results (won/lost)
iposRoutes.put('/:id/batch-result', async (c) => {
  const ipoId = c.req.param('id')
  const { results } = await c.req.json()
  // results: [{broker_id, is_won, shares_won}]
  
  const stmts = results.map(r => {
    const status = r.is_won ? 'won' : 'lost'
    return c.env.DB.prepare(
      'UPDATE ipo_subscriptions SET is_won = ?, shares_won = ?, status = ? WHERE ipo_id = ? AND broker_id = ?'
    ).bind(r.is_won ? 1 : 0, r.shares_won || 0, status, ipoId, r.broker_id)
  })
  await c.env.DB.batch(stmts)
  return c.json({ success: true })
})

// Batch sell
iposRoutes.put('/:id/batch-sell', async (c) => {
  const ipoId = c.req.param('id')
  const { sell_price, sell_date, broker_ids } = await c.req.json()
  
  let query = `UPDATE ipo_subscriptions SET sell_price = ?, sell_date = ?, status = 'sold',
    profit = (shares_won * ? - amount) WHERE ipo_id = ?`
  const binds = [sell_price, sell_date || new Date().toISOString().slice(0,10), sell_price, ipoId]
  
  if (broker_ids && broker_ids.length) {
    query += ` AND broker_id IN (${broker_ids.map(() => '?').join(',')})`
    binds.push(...broker_ids)
  }
  
  await c.env.DB.prepare(query).bind(...binds).run()
  return c.json({ success: true })
})

export { iposRoutes }
