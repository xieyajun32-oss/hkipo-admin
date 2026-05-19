import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const brokersRoutes = new Hono()
const fields = ['person_id', 'bank_card_id', 'sim_card_id', 'broker_name', 'account_label', 'balance', 'last_operation_date', 'status', 'notes']
const crud = createCrudRoutes('brokers', fields)

brokersRoutes.get('/', crud.list)
brokersRoutes.get('/:id', crud.get)
brokersRoutes.post('/', crud.create)
brokersRoutes.put('/:id', crud.update)
brokersRoutes.delete('/:id', crud.delete)

export { brokersRoutes }
