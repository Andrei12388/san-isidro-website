import { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

async function seed() {

const ministries = [
"Music Ministry",
"Program Ministry",
"Children Ministry",
"Multimedia Ministry"
]

for (const name of ministries) {

const ministry = await prisma.ministry.upsert({
where: { name },
update: {},
create: { name }
})

const trainings = [
"Introduction",
"Basic Responsibilities",
"Team Coordination",
"Ministry Discipline",
"Advanced Training"
]

for (const t of trainings) {

await prisma.ministryTraining.create({
data:{
ministryId: ministry.id,
title: t
}
})

}

}

}

seed()