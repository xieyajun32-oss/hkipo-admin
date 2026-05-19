import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const simCardsRoutes = new Hono()
const fields = ['person_id', 'phone_number', 'carrier', 'plan_name', 'monthly_cost', 'plan_expiry_date', 'balance', 'usage_type', 'status', 'notes']
const crud = createCrudRoutes('sim_cards', fields)

simCardsRoutes.get('/', crud.list)
simCardsRoutes.get('/:id', crud.get)
simCardsRoutes.post('/', crud.create)
simCardsRoutes.put('/:id', crud.update)
simCardsRoutes.delete('/:id', crud.delete)

export { simCardsRoutes }
