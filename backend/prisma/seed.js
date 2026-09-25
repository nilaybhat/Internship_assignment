const { PrismaClient, Role } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password.util');

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'Admin@1234',
    role: Role.ADMIN,
  },
  {
    name: 'Demo User',
    email: 'user@demo.com',
    password: 'Demo@1234',
    role: Role.USER,
  },
];

async function main() {
  for (const demo of DEMO_USERS) {
    const exists = await prisma.user.findUnique({ where: { email: demo.email } });
    if (exists) {
      console.log(`Seed skipped (exists): ${demo.email}`);
      continue;
    }
    const password = await hashPassword(demo.password);
    await prisma.user.create({
      data: { name: demo.name, email: demo.email, password, role: demo.role },
    });
    console.log(`Seed created: ${demo.email} (${demo.role})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());