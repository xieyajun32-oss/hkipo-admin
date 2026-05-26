import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const simCardsRoutes = new Hono()
const fields = ['person_id', 'phone_number', 'carrier', 'plan_name', 'monthly_cost', 'plan_expiry_date', 'balance', 'usage_type', 'status', 'notes']
const crud = createCrudRoutes('sim_cards', fields)

simCardsRoutes.get('/', async (c) => {
  const url = new URL(c.req.url)
  const params = Object.fromEntries(url.searchParams)
  let query = 'SELECT * FROM sim_cards'
  const binds = []
  const wheres = []

  for (const [key, val] of Object.entries(params)) {
    if (fields.includes(key) && val) {
      wheres.push(`${key} = ?`)
      binds.push(val)
    }
  }
  if (wheres.length) query += ' WHERE ' + wheres.join(' AND ')
  query += ' ORDER BY id ASC'

  const results = await c.env.DB.prepare(query).bind(...binds).all()
  return c.json(results.results || [])
})
simCardsRoutes.get('/:id', crud.get)
simCardsRoutes.post('/', crud.create)
simCardsRoutes.put('/:id', crud.update)
simCardsRoutes.delete('/:id', crud.delete)

export { simCardsRoutes }
