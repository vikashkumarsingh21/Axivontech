const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.brokerProfile.findMany().then(console.log).finally(() => prisma.$disconnect());
