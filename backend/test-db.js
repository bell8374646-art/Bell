// test-db.js
import prisma from './src/config/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  const users = await prisma.user.findMany();
  const match = await bcrypt.compare('Password123', users[0].password);
  console.log('Matches Password123:', match);
}

main().finally(() => prisma.$disconnect());
