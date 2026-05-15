import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcryptjs.hash('Admin123!', 12);
  const supervisorPasswordHash = await bcryptjs.hash('Super123!', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      displayName: 'Administrator',
      role: 'ADMIN',
      active: true,
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { username: 'supervisor' },
    update: {},
    create: {
      username: 'supervisor',
      passwordHash: supervisorPasswordHash,
      displayName: 'Nadzornik',
      role: 'SUPERVISOR',
      active: true,
    },
  });

  console.log('Seeded users:', { admin: admin.username, supervisor: supervisor.username });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
