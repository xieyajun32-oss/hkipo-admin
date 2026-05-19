export function createCrudRoutes(tableName, fields) {
  return {
    async list(c) {
      const url = new URL(c.req.url)
      const params = Object.fromEntries(url.searchParams)
      let query = `SELECT * FROM ${tableName}`
      const binds = []
      const wheres = []

      for (const [key, val] of Object.entries(params)) {
        if (fields.includes(key) && val) {
          wheres.push(`${key} = ?`)
          binds.push(val)
        }
      }
      if (wheres.length) query += ' WHERE ' + wheres.join(' AND ')
      query += ' ORDER BY id DESC'

      const results = await c.env.DB.prepare(query).bind(...binds).all()
      return c.json(results.results || [])
    },

    async get(c) {
      const id = c.req.param('id')
      const row = await c.env.DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id).first()
      if (!row) return c.json({ error: '未找到' }, 404)
      return c.json(row)
    },

    async create(c) {
      const body = await c.req.json()
      const keys = Object.keys(body).filter(k => fields.includes(k))
      const vals = keys.map(k => body[k])
      const placeholders = keys.map(() => '?').join(', ')
      
      const result = await c.env.DB.prepare(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`
      ).bind(...vals).run()
      return c.json({ id: result.meta.last_row_id, success: true }, 201)
    },

    async update(c) {
      const id = c.req.param('id')
      const body = await c.req.json()
      const keys = Object.keys(body).filter(k => fields.includes(k))
      const vals = keys.map(k => body[k])
      const sets = keys.map(k => `${k} = ?`).join(', ')

      await c.env.DB.prepare(
        `UPDATE ${tableName} SET ${sets} WHERE id = ?`
      ).bind(...vals, id).run()
      return c.json({ success: true })
    },

    async delete(c) {
      const id = c.req.param('id')
      await c.env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run()
      return c.json({ success: true })
    }
  }
}
