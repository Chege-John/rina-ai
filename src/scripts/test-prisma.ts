import { prisma } from "@/lib/prisma";

async function main() {
  try {
    const domains = await prisma.domain.findMany();
    console.log("Domains:", domains);
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
