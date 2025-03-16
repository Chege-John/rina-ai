"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;

  try {
    const plan = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        _count: {
          select: {
            domains: true,
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    const domainExists = await prisma.user.findFirst({
      where: {
        clerkId: user.id,
        domains: {
          some: {
            name: domain,
          },
        },
      },
    });

    if (!domainExists) {
      if (
        (plan?.subscription?.plan === "STANDARD" && plan._count.domains < 1) ||
        (plan?.subscription?.plan === "PRO" && plan._count.domains < 5) ||
        (plan?.subscription?.plan === "ULTIMATE" && plan._count.domains < 10)
      ) {
        const newDomain = await prisma.user.update({
          where: {
            clerkId: user.id,
          },
          data: {
            domains: {
              create: {
                name: domain,
                icon,
                chatbot: {
                  create: {
                    welcomeMessage: "Hey there, have a question? Text us here",
                  },
                },
              },
            },
          },
        });
        if (newDomain) {
          return {
            status: 200,
            message: "Domain added successfully",
          };
        }
        return {
          status: 400,
          message:
            "You've reached the maximum number of domains, upgrade your plan",
        };
      }
      return {
        status: 400,
        message:
          "You've reached the maximum number of domains, upgrade your plan",
      };
    }
    return {
      status: 400,
      message: "Domain already exists",
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await currentUser();
    if (!user) return;
    const plan = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });
    if (plan) {
      return plan.subscription?.plan;
    }
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
  }
};

export const onGetAllAccountDomains = async () => {
  const user = await currentUser();
  if (!user) return;
  try {
    const domains = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        domains: {
          select: {
            name: true,
            icon: true,
            id: true,
            customer: {
              select: {
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return { ...domains };
  } catch (error) {
    console.log(error);
  }
};

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const client = await clerkClient(); // Call and await clerkClient
    const update = await client.users.updateUser(user.id, {
      password,
    });

    if (update) {
      return { status: 200, message: "Password updated successfully" };
    }
    return { status: 400, message: "Failed to update password" };
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Internal server error" };
  }
};

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    const userDomain = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            name: true,
            icon: true,
            id: true,
            userId: true,
            chatbot: {
              select: {
                welcomeMessage: true,
                id: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (userDomain) {
      return userDomain;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    const domainExists = await prisma.domain.findFirst({
      where: {
        name: {
          contains: name,
        },
      },
    });

    if (!domainExists) {
      const domain = await prisma.domain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
      if (domain) {
        return {
          status: 200,
          message: "Domain updated successfully",
        };
      }
      return {
        status: 400,
        message: "Failed to update domain",
      };
    }
    return {
      status: 400,
      message: "Domain already exists",
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    const domain = await prisma.domain.update({
      where: {
        id,
      },
      data: {
        chatbot: {
          update: {
            data: {
              icon,
            },
          },
        },
      },
    });

    if (domain) {
      return {
        status: 200,
        message: "Domain updated successfully",
      };
    }

    return {
      status: 400,
      message: "Failed to update domain",
    };
  } catch (error) {
    console.log(error);
  }
};

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  console.log(message, domainId);
  try {
    const update = await prisma.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatbot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    });
    if (update) {
      return {
        status: 200,
        message: "Welcome message updated successfully",
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const onDeleteUserDomain = async (id: string) => {
  const user = await currentUser();
  if (!user) return;
  try {
    //first verify that domain belongs to user
    const validUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (validUser) {
      //check that domain belongs to this user and delete
      const deleteDomain = await prisma.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      });

      if (deleteDomain) {
        return {
          status: 200,
          message: `${deleteDomain.name} deleted successfully`,
        };
      }
      return {
        status: 400,
        message: "Failed to delete domain",
      };
    }
  } catch (error) {
    console.log(error);
  }
};
