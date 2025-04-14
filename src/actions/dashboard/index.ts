"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
// import stripe from "stripe";

export const getUserClients = async () => {
  try {
    const user = await currentUser();
    if (user) {
      const clients = await prisma.customer.count({
        where: {
          Domain: {
            user: {
              clerkId: user.id,
            },
          },
        },
      });
      if (clients) {
        return clients;
      }
    }
  } catch (error) {
    console.error("Error fetching user", error);
  }
};

export const getUserPlanInfo = async () => {
  try {
    const user = await currentUser();
    if (user) {
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
              credits: true,
            },
          },
        },
      });
      if (plan) {
        return {
          plan: plan.subscription?.plan,
          credits: plan.subscription?.credits,
          domains: plan._count?.domains,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user", error);
  }
};

export const getUserTotalProductPrices = async () => {
  try {
    const user = await currentUser();
    if (user) {
      const products = await prisma.product.findMany({
        where: {
          Domain: {
            user: {
              clerkId: user.id,
            },
          },
        },
        select: {
          price: true,
        },
      });
      if (products) {
        const total = products.reduce((total, next) => total + next.price, 0);
        return total;
      }
    }
  } catch (error) {
    console.error("Error fetching product", error);
  }
};

{
  /*
  export const getUserTransactions = async () => {
  try {
    const user = await currentUser();
    if (user) {
      const connectedStripe = await prisma.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          stripeId: true,
        },
      });

      if (connectedStripe) {
        const transactions = await stripe.charges.list({
          stripeAccount: connectedStripe.stripeId!,
        });
        if (transactions) {
          return transactions;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching transactions", error);
  }
};*/
}
