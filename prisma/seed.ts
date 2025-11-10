import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Store info ---
  const store = await prisma.storeInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Kirin Billiards Club',
      address: '123 Billiard Street',
      phone: '0123456789',
      logo: '',
      vat: 10,
    },
  });

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kirin.com' },
    update: {},
    create: {
      name: 'Admin',
      username: 'admin',
      email: 'admin@kirin.com',
      password: 'minhnhan', // hash bằng bcrypt trong thực tế
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@kirin.com' },
    update: {},
    create: {
      name: 'Staff 1',
      username: 'staff1',
      email: 'staff@kirin.com',
      password: 'hashedpassword123',
      role: 'STAFF',
    },
  });

  // --- Tables ---
  const table1 = await prisma.table.create({
    data: {
      name: 'Table 1',
      type: 'POOL',
      pricePerHour: 50000,
    },
  });

  const table2 = await prisma.table.create({
    data: {
      name: 'Table 2',
      type: 'CAROM',
      pricePerHour: 60000,
    },
  });

  // --- Categories & Menu Items ---
  const drinksCategory = await prisma.category.create({
    data: { name: 'Drinks' },
  });

  const foodCategory = await prisma.category.create({
    data: { name: 'Food' },
  });

  const coke = await prisma.menuItem.create({
    data: {
      name: 'Coca Cola',
      price: 15000,
      categoryId: drinksCategory.id,
    },
  });

  const pizza = await prisma.menuItem.create({
    data: {
      name: 'Pizza',
      price: 80000,
      categoryId: foodCategory.id,
    },
  });

  // --- Menu ---
  const mainMenu = await prisma.menu.create({
    data: {
      name: 'Main Menu',
      menuItems: {
        create: [{ menuItemId: coke.id }, { menuItemId: pizza.id }],
      },
    },
  });

  // --- Session ---
  const session = await prisma.session.create({
    data: {
      tableId: table1.id,
      staffId: staff.id,
      startTime: new Date(),
    },
  });

  // --- Order ---
  const order = await prisma.order.create({
    data: {
      sessionId: session.id,
      createdById: staff.id,
      orderItems: {
        create: [
          { menuItemId: coke.id, quantity: 2 },
          { menuItemId: pizza.id, quantity: 1 },
        ],
      },
    },
  });

  // --- Bill ---
  const bill = await prisma.bill.create({
    data: {
      sessionId: session.id,
      createdById: staff.id,
      totalAmount: 2 * coke.price + 1 * pizza.price + table1.pricePerHour,
      items: {
        create: [
          {
            menuItemId: coke.id,
            quantity: 2,
            price: coke.price,
          },
          {
            menuItemId: pizza.id,
            quantity: 1,
            price: pizza.price,
          },
        ],
      },
    },
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
