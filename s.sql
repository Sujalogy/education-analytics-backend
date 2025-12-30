CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- For similarity search
CREATE EXTENSION IF NOT EXISTS tablefunc;

-- For crosstab
-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    -- Should be encrypted in production
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables metadata
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL,
    -- 'postgresql' or 'excel'
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Columns metadata
CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
    data_type VARCHAR(50),
    distinct_count INTEGER DEFAULT 0,
    null_count INTEGER DEFAULT 0,
    sample_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merged columns (virtual columns)
CREATE TABLE IF NOT EXISTS merged_columns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_column_ids INTEGER [] NOT NULL,
    strategy VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved analyses
CREATE TABLE IF NOT EXISTS saved_analyses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tables_connection ON tables(connection_id);

CREATE INDEX idx_columns_table ON columns(table_id);

CREATE INDEX idx_columns_name_trgm ON columns USING gin(name gin_trgm_ops);

CREATE INDEX idx_saved_analyses_name ON saved_analyses(name);