"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation"; // Add this import
import { onGetAllAccountDomains } from "../settings";

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
    console.error(error);
    return {
      status: 400,
      message: "An error occurred during user registration.",
    };
  }
};

export const onLoginUser = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/sign-in"); // Replace RedirectToSignIn with redirect
  }

  try {
    const authenticated = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    });

    if (!authenticated) {
      return { status: 404, error: "User not found" };
    }

    const domains = await onGetAllAccountDomains();
    return {
      status: 200,
      user: authenticated,
      domain: domains?.domains ?? [],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return {
      status: 400,
      error: errorMessage,
    };
  }
};
