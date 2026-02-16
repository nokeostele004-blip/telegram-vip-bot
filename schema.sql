CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id TEXT UNIQUE,
  referrer_id TEXT,
  created_at INTEGER
);

CREATE TABLE groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE,
  chat_id TEXT
);

CREATE TABLE packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER,
  name TEXT,
  price INTEGER,
  duration INTEGER,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE TABLE memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  group_id INTEGER,
  expire_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE,
  user_id INTEGER,
  group_id INTEGER,
  package_id INTEGER,
  status TEXT,
  created_at INTEGER
);

CREATE TABLE referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER,
  referred_id INTEGER,
  reward_given INTEGER DEFAULT 0
);
