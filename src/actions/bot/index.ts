"use server";

import { prisma } from "@/lib/prisma";
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils";
import { onRealTimeChat } from "../conversation";
import { clerkClient } from "@clerk/nextjs/server";
import { onMailer } from "../mailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const onStoreConversations = async (
  id: string,
  message: string,
  role: "assistant" | "user"
) => {
  console.log(id, ": ", message);
  await prisma.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role,
        },
      },
    },
  });
};

export const onGetCurrentChatBot = async (id: string) => {
  console.log("🔎 Starting onGetCurrentChatBot with ID:", id);

  if (!id || typeof id !== "string" || id.trim() === "") {
    console.error("❌ Invalid ID passed to onGetCurrentChatBot:", id);
    return null;
  }

  try {
    console.log("🔄 About to query Prisma with ID:", id);
    console.log(
      "🔍 Prisma client:",
      prisma ? "Initialized" : "Not initialized"
    );

    const chatbot = await prisma.domain.findUnique({
      where: { id },
      select: {
        name: true,
        helpdesk: {
          select: {
            id: true,
            question: true,
            answer: true,
            domainId: true,
          },
        },
        chatbot: {
          select: {
            id: true,
            icon: true,
            welcomeMessage: true,
          },
        },
      },
    });

    console.log("🚀 Prisma query complete. Result:", chatbot);

    if (!chatbot) {
      console.warn("⚠️ No domain found for ID:", id);
      return null;
    }

    console.log("✅ Chatbot data retrieved:", chatbot);
    return chatbot;
  } catch (error) {
    console.error("❌ Error fetching chatbot:", error);
    console.error("Error details:", error.message);
    if (error.code) {
      console.error("Prisma error code:", error.code);
    }
    return null;
  }
};

let customerEmail: string | undefined;

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: "assistant" | "user"; content: string },
  author: "user" = "user",
  message: string
) => {
  // Log the parameters to verify the data
  console.log("onAiChatBotAssistant called with:", {
    id,
    chat,
    author,
    message,
  });

  // Check if chat is an array
  if (!Array.isArray(chat)) {
    console.error("Chat is not an array:", chat);
    return; // or handle this case appropriately
  }

  try {
    // Add more detailed logging
    console.log("Incoming message:", message);
    console.log("Domain ID:", id);

    const chatBotDomain = await prisma.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        filterQuestions: {
          where: {
            answered: null,
          },
          select: {
            question: true,
          },
        },
      },
    });

    // Log domain and questions
    console.log("Chat Bot Domain:", chatBotDomain);
    console.log("Filter Questions:", chatBotDomain?.filterQuestions);

    if (chatBotDomain) {
      const extractedEmail = extractEmailsFromString(message);
      if (extractedEmail) {
        customerEmail = extractedEmail[0];
        console.log("DEBUG: Extracted Email:", customerEmail); // Inspect extracted email
      } else {
        console.log("DEBUG: No emails found in message.");
      }

      console.log("Extracted Email:", customerEmail); // Log extracted email

      if (customerEmail) {
        console.log("DEBUG: Before checkCustomer query"); // Add this log
        const checkCustomer = await prisma.domain.findUnique({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                clerkId: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: {
                  startsWith: customerEmail,
                },
              },
              select: {
                email: true,
                id: true,
                questions: true,
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                    mailed: true,
                  },
                },
              },
            },
          },
        });

        console.log("DEBUG: After checkCustomer query:", checkCustomer);

        if (checkCustomer && !checkCustomer.customer.length) {
          console.log("Extracted Email:", customerEmail);

          const newCustomer = await prisma.domain.update({
            where: {
              id,
            },
            data: {
              customer: {
                create: {
                  email: customerEmail,
                  questions: {
                    create: chatBotDomain.filterQuestions,
                  },
                  chatRoom: {
                    create: {},
                  },
                },
              },
            },
          });

          console.log("New Customer Created:", newCustomer); // Log new customer

          if (newCustomer) {
            const response = {
              role: "assistant",
              content: `Welcome aboard ${
                customerEmail.split("@")[0]
              }! I'm glad to connect with you. Is there anything you need help with?`,
            };
            return {
              response,
            };
          }
        }

        if (checkCustomer && checkCustomer.customer[0].chatRoom[0].live) {
          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            message,
            author
          );

          if (!checkCustomer.customer[0].chatRoom[0].mailed) {
            const user = await clerkClient.users.getUser(
              checkCustomer.User?.clerkId!
            );
            onMailer(user.emailAddresses[0].emailAddress);

            const mailed = await prisma.chatRoom.update({
              where: {
                id: checkCustomer.customer[0].chatRoom[0].id,
              },
              data: {
                mailed: true,
              },
            });

            if (mailed) {
              return {
                live: true,
                chatRoom: checkCustomer.customer[0].chatRoom[0].id,
              };
            }
          }
          return {
            live: true,
            chatRoom: checkCustomer.customer[0].chatRoom[0].id,
          };
        }
        await onStoreConversations(
          checkCustomer?.customer[0].chatRoom[0].id!,
          message,
          author
        );

        // Prepare chat history for Gemini
        const chatHistory = chat.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

        // Gemini API call (keeping chatCompletion variable name)

        // Log chatHistory before Gemini call
        console.log("Chat History before Gemini:", chatHistory);

        const chatCompletion = await model.generateContent({
          contents: [
            {
              role: "model",
              parts: [
                {
                  text: `
                                  You will get an array of questions that you must ask the customer.
                                  
                                  Progress the conversation using those questions.
                                  
                                  When ever you ask a question from the array i need you to add a 
                                  keyword at the end of the question (complete) this keyword is 
                                  extremely important.
                                  
                                  Do not forget it.
                                  
                                  Only add this keyword when your asking a question from the array 
                                  of questions. No other question satisfies this condition.
                                  
                                  Always maintain character and stay respectful.
                                  
                                  The array of questions : [${chatBotDomain.filterQuestions
                                    .map((questions) => questions.question)
                                    .join(", ")}]

                                   if the customer says something out of context or inappropriate.
                                   Simply say this is beyond you and you will get a real user to 
                                   continue the conversation. And add a keyword (realtime) at the end.

                                   if the customer agrees to book an appointment send them this 
                                   link http://localhost:3000/portal/${id}/appointment/${
                    checkCustomer?.customer[0].id
                  }

                                  if the customer wants to buy a product redirect them to the payment page
                                  http://localhost:3000/portal/${id}/payment/${
                    checkCustomer?.customer[0].id
                  }
                                   `,
                },
              ],
            },
            ...chatHistory,
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        });

        // Log chatCompletion result
        console.log("Chat Completion Result:", chatCompletion);

        if (chatCompletion.response.text().includes("realtime")) {
          const realtime = await prisma.chatRoom.update({
            where: {
              id: checkCustomer?.customer[0].chatRoom[0].id,
            },
            data: {
              live: true,
            },
          });

          if (realtime) {
            const response = {
              role: "assistant",
              content: chatCompletion.response.text().replace("(realtime)", ""),
            };

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              response.content,
              "assistant"
            );
            return {
              response,
            };
          }
        }
        if (chat[chat.length - 1].content.includes("complete")) {
          const firstUnasweredQuestion =
            await prisma.customerResponses.findFirst({
              where: {
                customerId: checkCustomer?.customer[0].id,
                answered: null,
              },
              select: {
                id: true,
              },
              orderBy: {
                question: "asc",
              },
            });
          if (firstUnasweredQuestion) {
            await prisma.customerResponses.update({
              where: {
                id: firstUnasweredQuestion.id,
              },
              data: {
                answered: message,
              },
            });
          }
        }

        if (chatCompletion) {
          const generatedLink = extractURLfromString(
            chatCompletion.response.text() as string
          );

          if (generatedLink) {
            const link = generatedLink[0];
            const response = {
              role: "assistant",
              content: `Great! you can follow the link to proceed`,
              link: link.slice(0, -1),
            };

            await onStoreConversations(
              checkCustomer?.customer[0].chatRoom[0].id!,
              `${response.content} ${response.link}`,
              "assistant"
            );
            return {
              response,
            };
          }
          const response = {
            role: "assistant",
            content: chatCompletion.response.text(),
          };

          await onStoreConversations(
            checkCustomer?.customer[0].chatRoom[0].id!,
            `${response.content}`,
            "assistant"
          );
          return {
            response,
          };
        }
      }
      console.log("No customer found");

      // Gemini API call for new customer
      // Log chat before Gemini call for new customer
      console.log("Chat before Gemini (new customer):", chat);

      const chatCompletion = await model.generateContent({
        contents: [
          {
            role: "model",
            parts: [
              {
                text: `
                  You are a highly knowleadgeable and experienced sales representative
                   for a ${chatBotDomain.name} that offers a valuable product or service. 
                   Your goal is to have a natural, human-like conversation with the customer
                    in order to understand their needs, provide relevant information, and 
                    ultimately guide them towards making a purchase or redirect them to a link 
                    if they haven't provided all relevant information.
                    
                    Right now you are talking to a customer for the first time. Start by 
                    giving them a warm welcome on behalf of ${chatBotDomain.name} and make 
                    them feel welcomed.
                    
                    Your next task is lead the conversation naturally to get the customers email 
                    address. Be respectful and never break character.
                    `,
              },
            ],
          },
          ...chat.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      });

      // Log chatCompletion result for new customer
      console.log("Chat Completion Result (new customer):", chatCompletion);

      if (chatCompletion) {
        const response = {
          role: "assistant",
          content: chatCompletion.response.text(),
        };

        return {
          response,
        };
      }
    }
  } catch (error) {
    console.log(error);
  }
};
