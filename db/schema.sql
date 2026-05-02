-- Run this in your Supabase project: SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS employees (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'tech'
);

CREATE TABLE IF NOT EXISTS shifts (
  id          BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL
);
