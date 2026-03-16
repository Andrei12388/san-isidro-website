import { prisma } from "../lib/prisma";

async function main() {
  const ministries = ["Music", "Program", "Children", "Multimedia"];
  
  for (const name of ministries) {
    await prisma.ministry.create({
      data: { name, description: `${name} Ministry` },
    });
  }

  console.log("Seeded ministries ✅");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});