import { Hono } from 'hono'

const dashboardRoutes = new Hono()

dashboardRoutes.get('/summary', async (c) => {
  const [brokerStats, ipoStats, totalProfit] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as total, SUM(balance) as total_balance FROM brokers WHERE status = ?').bind('active').first(),
    c.env.DB.prepare('SELECT COUNT(DISTINCT ipo_id) as total_ipos FROM ipo_subscriptions').first(),
    c.env.DB.prepare('SELECT SUM(profit) as total_profit FROM ipo_subscriptions WHERE status = ?').bind('sold').first()
  ])

  return c.json({
    total_brokers: brokerStats?.total || 0,
    total_balance: brokerStats?.total_balance || 0,
    total_ipos: ipoStats?.total_ipos || 0,
    total_profit: totalProfit?.total_profit || 0
  })
})

dashboardRoutes.get('/alerts', async (c) => {
  const alerts = []
  const today = new Date().toISOString().slice(0, 10)

  // Bank cards not used in 90 days
  const dormantCards = await c.env.DB.prepare(`
    SELECT bc.*, p.name as person_name FROM bank_cards bc
    JOIN persons p ON bc.person_id = p.id
    WHERE bc.status = 'active' AND bc.last_transaction_date < date('now', '-90 days')
  `).all()
  for (const card of (dormantCards.results || [])) {
    alerts.push({ type: 'bank_dormant', level: 'warning', message: `${card.person_name} 的 ${card.bank_name} (${card.card_last4}) 已超过90天未动账`, data: card })
  }

  // SIM cards expiring in 30 days
  const expiringSims = await c.env.DB.prepare(`
    SELECT sc.*, p.name as person_name FROM sim_cards sc
    JOIN persons p ON sc.person_id = p.id
    WHERE sc.status = 'active' AND sc.plan_expiry_date BETWEEN date('now') AND date('now', '+30 days')
  `).all()
  for (const sim of (expiringSims.results || [])) {
    alerts.push({ type: 'sim_expiring', level: 'danger', message: `${sim.person_name} 的手机卡 ${sim.phone_number} 套餐即将到期 (${sim.plan_expiry_date})`, data: sim })
  }

  // Brokers not operated in 30 days
  const dormantBrokers = await c.env.DB.prepare(`
    SELECT b.*, p.name as person_name FROM brokers b
    JOIN persons p ON b.person_id = p.id
    WHERE b.status = 'active' AND b.last_operation_date < date('now', '-30 days')
  `).all()
  for (const broker of (dormantBrokers.results || [])) {
    alerts.push({ type: 'broker_dormant', level: 'warning', message: `${broker.person_name} 的 ${broker.broker_name} (${broker.account_label}) 已超过30天未操作`, data: broker })
  }

  return c.json(alerts)
})

export { dashboardRoutes }
