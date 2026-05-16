#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/.bin/prisma migrate deploy

echo "Seeding initial users..."
node - << 'EOF'
const bcryptjs = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function seed() {
  const adminHash = await bcryptjs.hash('Admin123!', 12);
  const supervisorHash = await bcryptjs.hash('Super123!', 12);
  const r1 = await pool.query(
    `INSERT INTO "User" (id, username, "passwordHash", "displayName", role, active, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), 'admin', $1, 'Administrator', 'ADMIN', true, NOW(), NOW())
     ON CONFLICT (username) DO NOTHING`,
    [adminHash]
  );
  const r2 = await pool.query(
    `INSERT INTO "User" (id, username, "passwordHash", "displayName", role, active, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), 'supervisor', $1, 'Nadzornik', 'SUPERVISOR', true, NOW(), NOW())
     ON CONFLICT (username) DO NOTHING`,
    [supervisorHash]
  );
  if (r1.rowCount > 0) console.log('Created admin user (admin / Admin123!)');
  else console.log('Admin user already exists');
  if (r2.rowCount > 0) console.log('Created supervisor user (supervisor / Super123!)');
  else console.log('Supervisor user already exists');
  await pool.end();
}
seed().catch(e => { console.error('Seed warning:', e.message); process.exit(0); });
EOF

echo "Starting application..."
exec node server.js
