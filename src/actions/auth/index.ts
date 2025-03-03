"use server";

import { prisma } from "@/lib/prisma";

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string
) => {
  try {
    const registered = await prisma.user.create({
      data: {
        fullname,
        clerkId,
        type,
        subscription: {
          create: {},
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    });

    if (registered) {
      return {
        status: 200,
        user: registered,
      };
    }
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return {
      status: 400,
      message: "An error occurred during user registration.",
    };
  }
};
