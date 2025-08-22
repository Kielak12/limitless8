
// lib/db.ts — helpers for D1 (env.DB)
export interface Env {
  DB: D1Database
}

export async function ensureSchema(env: Env){
  // Create tables if they don't exist (safe for first run)
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      plan TEXT,
      pages INTEGER,
      cms TEXT,
      seo TEXT,
      budget TEXT,
      message TEXT,
      user_agent TEXT,
      ip TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
  `);
}

export function json(data: any, init: ResponseInit = {}): Response{
  return new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json'}, ...init});
}

export function methodNotAllowed(allowed='GET,POST'){ 
  return new Response('Method Not Allowed', {status:405, headers:{'Allow': allowed}});
}

export function unauthorized(){ return new Response('Unauthorized', {status:401}); }
