CREATE TABLE IF NOT EXISTS shelters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(30),
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  occupied INTEGER NOT NULL DEFAULT 0 CHECK (occupied >= 0),
  accepts_pets BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_requests (
  id SERIAL PRIMARY KEY,
  requester_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  current_location VARCHAR(255) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('baixa', 'media', 'alta')),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'atendido')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
