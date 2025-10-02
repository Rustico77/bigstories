import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@bigstories.com" },
    update: {},
    create: {
      email: "admin@bigstories.com",
      password,
    },
  });

  console.log("✅ User seed done:", user);
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
