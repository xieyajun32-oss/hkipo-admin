import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const bankCardsRoutes = new Hono()
const fields = ['person_id', 'bank_name', 'card_last4', 'balance', 'last_transaction_date', 'status', 'notes']
const crud = createCrudRoutes('bank_cards', fields)

bankCardsRoutes.get('/', crud.list)
bankCardsRoutes.get('/:id', crud.get)
bankCardsRoutes.post('/', crud.create)
bankCardsRoutes.put('/:id', crud.update)
bankCardsRoutes.delete('/:id', crud.delete)

export { bankCardsRoutes }
