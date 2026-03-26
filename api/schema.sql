PRAGMA foreign_keys = ON;

-- USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cmpnt_creations INTEGER DEFAULT 0
);

-- PROJECTS
CREATE TABLE projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  desc TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  banner_url TEXT,
  downloads INTEGER DEFAULT 0,

  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMPONENTS
CREATE TABLE components (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  desc TEXT NOT NULL,
  ports TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  downloads INTEGER DEFAULT 0,

  dim_x INTEGER,
  dim_y INTEGER,
  dim_z INTEGER,

  owner_id TEXT NOT NULL,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMPONENT DOWNLOADS
CREATE TABLE component_downloads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  component_id TEXT NOT NULL,
  link TEXT NOT NULL,

  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

-- CONTRIBUTORS
CREATE TABLE contributors (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(project_id, user_id)
);

-- INDEXES (the ones that actually exist)
CREATE INDEX idx_components_project_id ON components(project_id);
CREATE INDEX idx_contributors_project_id ON contributors(project_id);
CREATE INDEX idx_contributors_user_id ON contributors(user_id);
