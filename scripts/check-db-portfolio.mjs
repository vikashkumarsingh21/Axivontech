import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const projects = await prisma.portfolioProject.findMany();
    console.log(`DB Portfolio Projects count: ${projects.length}`);
    projects.forEach((p) => {
      console.log(`- ${p.title} (${p.slug}) -> ${p.status}`);
    });
  } catch (err) {
    console.log("DB query note:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
