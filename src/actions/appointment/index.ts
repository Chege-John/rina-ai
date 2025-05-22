"use server";

import { prisma } from "@/lib/prisma";

export const onDomainCustomerResponses = async (customerId: string) => {
  try {
    const customerQuestions = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      select: {
        email: true,
        questions: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    });

    if (customerQuestions) {
      return customerQuestions;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onGetAllDomainBookings = async (domainId: string) => {
  try {
    const bookings = await prisma.bookings.findMany({
      where: {
        domainId,
      },
      select: {
        slot: true,
        date: true,
      },
    });

    if (bookings) {
      return bookings;
    }
  } catch (error) {
    console.log(error);
  }
};

export const onBookNewAppointment = async (
  domainId: string,
  customerId: string,
  email: string,
  slot: string,
  date: Date
) => {
  try {
    const booking = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        booking: {
          create: {
            domainId,
            slot,
            date,
            email,
          },
        },
      },
    });

    if (booking) {
      return { status: 200, message: "Booking created successfully" };
    }
  } catch (error) {
    console.log(error);
  }
};

export const saveAnswers = async (
  questions: Record<string, string>, // Expecting a Record object, not a tuple
  customerId: string
) => {
  try {
    // Iterate through the questions object
    for (const questionId in questions) {
      // Ensure questionId is a valid key and questions[questionId] contains the answer
      await prisma.customer.update({
        where: {
          id: customerId,
        },
        data: {
          questions: {
            update: {
              where: {
                id: questionId, // Use questionId as key
              },
              data: {
                answered: questions[questionId], // Assign the corresponding answer
              },
            },
          },
        },
      });
    }

    return { status: 200, message: "Answers saved successfully" };
  } catch (error) {
    console.log(error);
    throw new Error("Error saving answers");
  }
};

export const onGetAllBookingsForCurrentUser = async (clerkId: string) => {
  try {
    const bookings = await prisma.bookings.findMany({
      where: {
        Customer: {
          Domain: {
            User: {
              clerkId,
            },
          },
        },
      },
      select: {
        id: true,
        slot: true,
        createdAt: true,
        date: true,
        email: true,
        domainId: true,
        Customer: {
          select: {
            Domain: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (bookings) {
      return { bookings };
    }
  } catch (error) {
    console.log(error);
  }
};
