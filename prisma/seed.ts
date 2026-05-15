import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminHash = await bcryptjs.hash('Admin123!', 12);
  const supervisorHash = await bcryptjs.hash('Super123!', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, displayName: 'Administrator', role: 'ADMIN', active: true },
  });

  const supervisor = await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: {},
    create: { username: 'supervisor', passwordHash: supervisorHash, displayName: 'Nadzornik', role: 'SUPERVISOR', active: true },
  });

  console.log('Seeded:', { admin: admin.username, supervisor: supervisor.username });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
