PRAGMA foreign_keys = ON;

-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  desc TEXT NOT NULL, -- project description
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Components table
CREATE TABLE components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT,       -- optional file link
  image_url TEXT,      -- optional image link
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Contributors table
CREATE TABLE contributors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);

-- Join table for project contributors
CREATE TABLE project_contributors (
  project_id INTEGER NOT NULL,
  contributor_id INTEGER NOT NULL,
  PRIMARY KEY (project_id, contributor_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX idx_components_project_id ON components(project_id);
CREATE INDEX idx_project_contributors_project ON project_contributors(project_id);
