import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.session.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('admin', 10);

  // Create admin & staff users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@bida.com',
      password,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Lý Minh Nhân',
      email: 'staff@bida.com',
      password,
      role: 'STAFF',
    },
  });

  // Create tables
  const tables = await prisma.table.createMany({
    data: [
      { name: 'Bàn 11', type: 'POOL', pricePerHour: 50000 },
      { name: 'Bàn 12', type: 'POOL', pricePerHour: 60000 },
      { name: 'Bàn 13', type: 'CAROM', pricePerHour: 40000 },
    ],
  });

  console.log('✅ Seed completed with users and tables');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
