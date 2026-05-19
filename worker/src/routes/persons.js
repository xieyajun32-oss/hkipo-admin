import { Hono } from 'hono'
import { createCrudRoutes } from '../utils/crud.js'

const personsRoutes = new Hono()
const fields = ['name', 'relationship', 'notes']
const crud = createCrudRoutes('persons', fields)

personsRoutes.get('/', crud.list)
personsRoutes.get('/:id', crud.get)
personsRoutes.post('/', crud.create)
personsRoutes.put('/:id', crud.update)
personsRoutes.delete('/:id', crud.delete)

export { personsRoutes }
