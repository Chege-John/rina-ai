/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use server";

import { prisma } from "@/lib/prisma";
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils";
import { onRealTimeChat } from "../conversation";
import { clerkClient } from "@clerk/nextjs/server";
import { onMailer } from "../mailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// UPGRADE TIP: Consider using "gemini-2.0-flash-exp" or "gemini-1.5-flash" for better performance
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
  },
});

export const onStoreConversations = async (
  id: string,
  message: string,
  role: "assistant" | "user" | "owner",
) => {
  console.log(id, ": ", message);
  const chatRoom = await prisma.chatRoom.update({
    where: {
      id,
    },
    data: {
      message: {
        create: {
          message,
          role: role === "assistant" ? "OWNER" : "CUSTOMER",
        },
      },
    },
    include: {
      message: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
  return chatRoom.message[0];
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
      prisma ? "Initialized" : "Not initialized",
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
    return null;
  }
};

export const onRealTimeChatMessage = async (
  chatroomId: string,
  message: string,
  author: "user" | "assistant",
  clientId?: string,
) => {
  try {
    const storedMsg = await onStoreConversations(
      chatroomId,
      message,
      author === "user" ? "user" : "assistant",
    );

    if (storedMsg) {
      await onRealTimeChat(
        chatroomId,
        message,
        storedMsg.id,
        author === "user" ? "user" : "assistant",
        clientId,
      );
      return { status: 200, message: "Message sent" };
    }
  } catch (error) {
    console.error("❌ Error in onRealTimeChatMessage:", error);
    return { status: 500, message: "Internal server error" };
  }
};

export const onAiChatBotAssistant = async (
  id: string,
  chat: { role: "assistant" | "user"; content: string; link?: string }[],
  author: "user" = "user",
  message: string,
) => {
  let customerEmail: string | undefined;
  console.log("onAiChatBotAssistant called with:", {
    id,
    chat,
    author,
    message,
  });

  if (!Array.isArray(chat)) {
    console.error("Chat is not an array:", chat);
    return;
  }

  try {
    console.log("Incoming message:", message);
    console.log("Domain ID:", id);

    const chatBotDomain = await prisma.domain.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        helpdesk: {
          select: {
            question: true,
            answer: true,
          },
        },
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

    console.log("Chat Bot Domain:", chatBotDomain);

    if (!chatBotDomain) {
      console.error("❌ No domain found with ID:", id);
      return {
        response: {
          role: "assistant",
          content: "Sorry, I couldn't find the configuration for this chatbot.",
        },
      };
    }

    // IMPROVED: Format knowledge base with better structure
    const knowledgeBase =
      chatBotDomain.helpdesk.length > 0
        ? chatBotDomain.helpdesk
            .map(
              (h, idx) => `[KB-${idx + 1}]\nQ: ${h.question}\nA: ${h.answer}`,
            )
            .join("\n\n")
        : "No knowledge base entries available.";

    if (chatBotDomain) {
      const extractedEmail = extractEmailsFromString(message);
      if (extractedEmail) {
        customerEmail = extractedEmail[0];
        console.log("DEBUG: Extracted Email from current message:", customerEmail);
      } else {
        console.log(
          "DEBUG: No emails found in current message. Checking history for USER emails...",
        );
        // ONLY extract emails from user-provided messages to avoid picking up the bot's own support email
        for (let i = chat.length - 1; i >= 0; i--) {
          if (chat[i].role === "user") {
            const historyEmail = extractEmailsFromString(chat[i].content);
            if (historyEmail) {
              customerEmail = historyEmail[0];
              console.log("DEBUG: Extracted Email from history:", customerEmail);
              break;
            }
          }
        }
      }

      console.log("Extracted Email Result:", customerEmail);

      if (customerEmail) {
        console.log("DEBUG: Before checkCustomer query");
        const checkCustomer = await prisma.domain.findUnique({
          where: {
            id,
          },
          select: {
            user: {
              select: {
                clerkId: true,
              },
            },
            name: true,
            customer: {
              where: {
                email: {
                  equals: customerEmail,
                },
              },
              select: {
                email: true,
                id: true,
                questions: {
                  select: {
                    question: true,
                    answered: true,
                  },
                },
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

        if (checkCustomer && !checkCustomer.customer.length) {
          console.log("DEBUG: Creating new customer for email:", customerEmail);

          await prisma.domain.update({
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
        }

        // Re-fetch customer info if we just created one, or use existing
        const customerData = await prisma.customer.findFirst({
          where: {
            email: customerEmail,
            domainId: id,
          },
          include: {
            chatRoom: {
              select: {
                id: true,
                live: true,
                mailed: true,
              },
            },
          },
        });

        if (
          customerData &&
          customerData.chatRoom.length > 0 &&
          customerData.chatRoom[0].live
        ) {
          console.log("DEBUG: Customer is in live mode");
          const chatRoomId = customerData.chatRoom[0].id;
          const storedMsg = await onStoreConversations(
            chatRoomId,
            message,
            author,
          );

          if (storedMsg) {
            await onRealTimeChat(chatRoomId, message, storedMsg.id, "user");
          }

          if (
            !customerData.chatRoom[0].mailed &&
            checkCustomer?.user?.clerkId
          ) {
            const clerkId = checkCustomer.user.clerkId;
            const clerk = await clerkClient();
            const user = await clerk.users.getUser(clerkId);
            await onMailer(
              user.emailAddresses[0].emailAddress,
              customerEmail,
              chatBotDomain.name,
            );
            await prisma.chatRoom.update({
              where: { id: chatRoomId },
              data: { mailed: true },
            });
          }
          return {
            live: true,
            chatRoom: chatRoomId,
          };
        }

        if (customerData && customerData.chatRoom.length > 0) {
          await onStoreConversations(
            customerData.chatRoom[0].id,
            message,
            author,
          );

          // IMPROVED: Track which filter questions are actually pending
          const answeredQuestions =
            checkCustomer?.customer[0]?.questions
              .filter((q) => q.answered)
              .map((q) => q.question) || [];

          const pendingQuestions = chatBotDomain.filterQuestions.filter(
            (q) => !answeredQuestions.includes(q.question),
          );

          // IMPROVED: More structured system prompt
          const systemPrompt = `You are Rina AI, a knowledgeable sales representative for ${chatBotDomain.name}.

═══════════════════════════════════════════════════════════════
🎯 YOUR PRIMARY DIRECTIVE:
═══════════════════════════════════════════════════════════════

A human agent may have just finished speaking with this customer. Your job is to seamlessly take back the conversation.

BEFORE responding, you MUST:
1. READ the entire conversation history to understand the current context.
2. SEARCH the Knowledge Base for relevant answers.
3. DO NOT ask questions the customer has already answered.

═══════════════════════════════════════════════════════════════
📚 KNOWLEDGE BASE:
═══════════════════════════════════════════════════════════════

${knowledgeBase}

═══════════════════════════════════════════════════════════════
📋 FILTER QUESTIONS STATUS:
═══════════════════════════════════════════════════════════════

ALREADY ANSWERED:
${answeredQuestions.map((q, i) => `✅ ${q}`).join("\n") || "None yet"}

STILL NEED TO ASK (In order):
${pendingQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n") || "All questions answered!"}

⚠️ CRITICAL: Only ask the NEXT pending question if it hasn't been addressed in the conversation history.

═══════════════════════════════════════════════════════════════
🎭 RESPONSE PROTOCOL:
═══════════════════════════════════════════════════════════════

1. Answer latest message using KNOWLEDGE BASE.
2. If returning from a human agent, acknowledge the transition if appropriate (e.g., "I'll take it from here!").
3. After answering, naturally progress to the NEXT pending filter question.
4. When asking a filter question, add (complete) at the end.
5. If customer wants a human again, add (realtime) at the end.

NOW RESPOND TO THE CUSTOMER'S LATEST MESSAGE.`;

          const chatHistory = chat.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          }));

          const chatCompletion = await model.generateContent({
            contents: [
              {
                role: "model",
                parts: [{ text: systemPrompt }],
              },
              ...chatHistory,
              {
                role: "user",
                parts: [{ text: message }],
              },
            ],
          });

          const responseText = chatCompletion.response.text();
          console.log("Chat Completion Result:", responseText);

          if (responseText.includes("(realtime)")) {
            console.log("DEBUG: AI requested realtime mode");
            const chatRoomId = customerData.chatRoom[0].id;
            const realtime = await prisma.chatRoom.update({
              where: {
                id: chatRoomId,
              },
              data: {
                live: true,
              },
            });

            if (realtime) {
              // Send email immediately when switching to realtime
              if (
                !customerData.chatRoom[0].mailed &&
                checkCustomer?.user?.clerkId
              ) {
                try {
                  const clerkId = checkCustomer.user.clerkId;
                  const clerk = await clerkClient();
                  const user = await clerk.users.getUser(clerkId);
                  await onMailer(
                    user.emailAddresses[0].emailAddress,
                    customerEmail,
                    chatBotDomain.name,
                  );
                  await prisma.chatRoom.update({
                    where: { id: chatRoomId },
                    data: { mailed: true },
                  });
                } catch (emailError) {
                  console.error(
                    "❌ Failed to send realtime notification email:",
                    emailError,
                  );
                }
              }

              const response = {
                role: "assistant" as const,
                content: responseText.replace("(realtime)", "").trim(),
              };

              await onStoreConversations(
                chatRoomId,
                response.content,
                "assistant",
              );
              return {
                live: true,
                chatRoom: chatRoomId,
                response,
              };
            }
          }

          if (
            chat.length > 0 &&
            chat[chat.length - 1].content.includes("(complete)")
          ) {
            const firstUnasweredQuestion =
              await prisma.customerResponses.findFirst({
                where: {
                  customerId: customerData.id,
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
            const generatedLink = extractURLfromString(responseText as string);
            const chatRoomId = customerData.chatRoom[0]?.id;

            if (generatedLink && chatRoomId) {
              const link = generatedLink[0];
              const response = {
                role: "assistant" as const,
                content: `Great! you can follow the link to proceed`,
                link: link.slice(0, -1),
              };

              await onStoreConversations(
                chatRoomId,
                `${response.content} ${response.link}`,
                "assistant",
              );
              return {
                response,
              };
            }

            const response = {
              role: "assistant" as const,
              content: responseText,
            };

            if (chatRoomId) {
              await onStoreConversations(
                chatRoomId,
                `${response.content}`,
                "assistant",
              );
            }
            return {
              response,
            };
          }
        }
      }

      // IMPROVED: Better prompt for new customers (before email)
      console.log("No customer found or customerEmail is undefined");
      console.log("Chat before Gemini (new customer):", chat);

      const conversationContext =
        chat.length > 0
          ? chat
              .map(
                (msg, idx) =>
                  `[${idx + 1}] ${msg.role === "assistant" ? "You" : "Visitor"}: ${msg.content}`,
              )
              .join("\n")
          : "This is the first message.";

      try {
        const systemPromptNewCustomer = `You are Rina AI, a professional sales representative for ${chatBotDomain.name}.

═══════════════════════════════════════════════════════════════
📚 KNOWLEDGE BASE (Use this to answer questions):
═══════════════════════════════════════════════════════════════

${knowledgeBase}

⚠️ ALWAYS check this Knowledge Base FIRST before responding to any question.

═══════════════════════════════════════════════════════════════
💬 CONVERSATION SO FAR:
═══════════════════════════════════════════════════════════════

${conversationContext}

═══════════════════════════════════════════════════════════════
🎯 YOUR GOALS:
═══════════════════════════════════════════════════════════════

1. Welcome the visitor warmly to ${chatBotDomain.name}
2. Answer ANY questions they have using the Knowledge Base above
3. Be helpful and build trust
4. Naturally guide them to share their email address so you can assist them better
5. NEVER contradict what you said in previous messages - review the conversation!

IMPORTANT:
- Read the conversation history above BEFORE responding
- If they ask something in the Knowledge Base, use that answer
- Be natural and conversational, not pushy
- Remember what you've already told them

Now respond to their latest message:`;

        const chatCompletion = await model.generateContent({
          contents: [
            {
              role: "model",
              parts: [{ text: systemPromptNewCustomer }],
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

        console.log("Chat Completion Result (new customer):", chatCompletion);

        if (chatCompletion) {
          const responseText = chatCompletion.response.text();
          const response = {
            role: "assistant",
            content: responseText,
          };

          return {
            response,
          };
        }
      } catch (geminiError: any) {
        console.error("❌ Gemini API Error (new customer):", geminiError);
        return {
          response: {
            role: "assistant",
            content: `I apologize, but I'm experiencing technical difficulties. Please try again in a moment.`,
          },
        };
      }
    }

    console.warn("⚠️ onAiChatBotAssistant reached end without returning");
    return {
      response: {
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing that right now.",
      },
    };
  } catch (error: any) {
    console.error("❌ Error in onAiChatBotAssistant:", error);
    return {
      response: {
        role: "assistant",
        content: `I apologize, but I encountered an error. Please try again.`,
      },
    };
  }
};
