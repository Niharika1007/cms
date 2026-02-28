import { prisma } from "./config/db";

async function main() {
  const users = await prisma.user.findMany();
  console.log(users);
}

main();