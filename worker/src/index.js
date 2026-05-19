import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth.js'
import { authRoutes } from './routes/auth.js'
import { personsRoutes } from './routes/persons.js'
import { bankCardsRoutes } from './routes/bankCards.js'
import { simCardsRoutes } from './routes/simCards.js'
import { brokersRoutes } from './routes/brokers.js'
import { iposRoutes } from './routes/ipos.js'
import { dashboardRoutes } from './routes/dashboard.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Public routes
app.route('/api/auth', authRoutes)

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/persons', personsRoutes)
app.route('/api/bank-cards', bankCardsRoutes)
app.route('/api/sim-cards', simCardsRoutes)
app.route('/api/brokers', brokersRoutes)
app.route('/api/ipos', iposRoutes)
app.route('/api/dashboard', dashboardRoutes)

export default app
