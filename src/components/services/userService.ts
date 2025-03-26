import { prisma } from "@/lib/prisma";

async function getUserById(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log(`No user found with id: ${userId}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error retrieving user by id:", error);
    throw error; // Re-throw or handle error as needed
  }
}

export default getUserById;
