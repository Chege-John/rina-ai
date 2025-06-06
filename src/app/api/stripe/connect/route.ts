import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Fix: Change STRIPE_SECRET to STRIPE_SECRET_KEY (standard naming)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user)
      return new NextResponse("User not authenticated", { status: 401 });

    const account = await stripe.accounts.create({
      country: "US",
      type: "custom",
      business_type: "company",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      external_account: "btok_us",
      tos_acceptance: {
        date: 1547923073,
        ip: "172.18.80.19",
      },
    });

    if (account) {
      const approve = await stripe.accounts.update(account.id, {
        business_profile: {
          mcc: "5045",
          url: "https://bestcookieco.com",
        },
        company: {
          address: {
            city: "victoria",
            line1: "123 State st",
            postal_code: "V8P 1A1",
            state: "BC",
          },
          tax_id: "000000000",
          name: "The Best Cookie Co",
          phone: "8888675309",
        },
      });

      if (approve) {
        const person = await stripe.accounts.createPerson(account.id, {
          first_name: "Jenny",
          last_name: "Rosen",
          relationship: {
            representative: true,
            title: "CEO",
          },
        });
        if (person) {
          const approvePerson = await stripe.accounts.updatePerson(
            account.id,
            person.id,
            {
              address: {
                city: "victoria",
                line1: "123 State st",
                postal_code: "V8P 1A1",
                state: "BC",
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980,
              },
              ssn_last_4: "0000",
              phone: "8888675309",
              email: "jenny@bestcookie.com",
              relationship: {
                executive: true,
              },
            }
          );
          if (approvePerson) {
            const owner = await stripe.accounts.createPerson(account.id, {
              first_name: "Kathleen",
              last_name: "Banks",
              email: "kathleen@bestcookieco.com",
              address: {
                city: "victoria",
                line1: "123 State st",
                postal_code: "V8P 1A1",
                state: "BC",
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980,
              },
              phone: "8888675309",
              relationship: {
                owner: true,
                percent_ownership: 80,
              },
            });
            if (owner) {
              const complete = await stripe.accounts.update(account.id, {
                company: {
                  owners_provided: true,
                },
              });
              if (complete) {
                const saveAccountId = await prisma.user.update({
                  where: {
                    clerkId: user.id,
                  },
                  data: {
                    stripeId: account.id,
                  },
                });
                if (saveAccountId) {
                  // Fix: Update URLs for production
                  const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${process.env.NEXT_PUBLIC_URL}/callback/stripe/refresh`,
                    return_url: `${process.env.NEXT_PUBLIC_URL}/callback/stripe/success`,
                    type: "account_onboarding",
                    collection_options: {
                      fields: "currently_due",
                    },
                  });
                  return NextResponse.json({ url: accountLink.url });
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(
      "An error occured when calling the Stripe API to create an account:",
      error
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
