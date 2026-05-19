-- 港股账号管理系统 D1 数据库

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  relationship TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  card_last4 TEXT,
  balance REAL DEFAULT 0,
  last_transaction_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sim_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  carrier TEXT,
  plan_name TEXT,
  monthly_cost REAL,
  plan_expiry_date DATE,
  balance REAL DEFAULT 0,
  usage_type TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brokers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
  bank_card_id INTEGER REFERENCES bank_cards(id),
  sim_card_id INTEGER REFERENCES sim_cards(id),
  broker_name TEXT NOT NULL,
  account_label TEXT,
  balance REAL DEFAULT 0,
  last_operation_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_name TEXT NOT NULL,
  stock_code TEXT,
  offer_price REAL,
  listing_date DATE,
  subscription_start DATE,
  subscription_end DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ipo_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ipo_id INTEGER REFERENCES ipos(id) ON DELETE CASCADE,
  broker_id INTEGER REFERENCES brokers(id) ON DELETE CASCADE,
  lots_applied INTEGER DEFAULT 0,
  amount REAL DEFAULT 0,
  is_won INTEGER DEFAULT 0,
  shares_won INTEGER DEFAULT 0,
  sell_price REAL,
  sell_date DATE,
  profit REAL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_cards_person ON bank_cards(person_id);
CREATE INDEX IF NOT EXISTS idx_sim_cards_person ON sim_cards(person_id);
CREATE INDEX IF NOT EXISTS idx_brokers_person ON brokers(person_id);
CREATE INDEX IF NOT EXISTS idx_ipo_subs_ipo ON ipo_subscriptions(ipo_id);
CREATE INDEX IF NOT EXISTS idx_ipo_subs_broker ON ipo_subscriptions(broker_id);

-- Default admin user (password: admin123, to be changed on first login)
-- SHA256 hash of 'admin123' with salt 'hkipo'
INSERT OR IGNORE INTO users (email, password_hash, name, role)
VALUES ('admin@luweicao.com', '$admin_placeholder$', '管理员', 'admin');
