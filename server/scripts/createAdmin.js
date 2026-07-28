const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@devastram.com';
  const password = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', password: hashedPassword }
    });
    console.log('Admin user updated successfully.');
  } else {
    await prisma.user.create({
      data: {
        username: 'Store Owner',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin user created successfully.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
