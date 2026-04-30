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

    // ADVANCED RAG: Dynamic Knowledge Retrieval
    // Instead of sending everything, we filter the KB for relevance to the current message
    // This prevents the AI from getting "confused" by irrelevant facts.
    const userWords = message.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const relevantHelpdesk = chatBotDomain.helpdesk.filter(h => {
      const content = (h.question + " " + h.answer).toLowerCase();
      return userWords.some(word => content.includes(word)) || chatBotDomain.helpdesk.length <= 5;
    });

    const knowledgeBase =
      relevantHelpdesk.length > 0
        ? relevantHelpdesk
            .map(
              (h, idx) => `[FACT-${idx + 1}]\nQ: ${h.question}\nA: ${h.answer}`,
            )
            .join("\n\n")
        : "No specific knowledge base entries found for this query. Use general knowledge or escalate if unsure.";

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

          // IMPROVED: More structured system prompt with intelligence upgrades
          const systemPrompt = `You are Rina AI, the elite sales & support lead for ${chatBotDomain.name}.

═══════════════════════════════════════════════════════════════
🧠 INTERNAL MENTAL CHECKLIST (Hidden from customer):
═══════════════════════════════════════════════════════════════
1. IDENTITY: I am speaking with ${customerEmail}.
2. CONTEXT: Review history to see if a human was just here.
3. KNOWLEDGE: Search the "RELEVANT FACTS" section for the exact answer.
4. QUALIFICATION: Which filter questions are still missing?
5. ACTION: Does the user need to book an appointment or talk to a human?

═══════════════════════════════════════════════════════════════
🎭 BRAND VOICE & TONE:
═══════════════════════════════════════════════════════════════
- TONE: Professional, warm, and highly efficient.
- STYLE: Use concise sentences. Avoid fluff. 
- EMPATHY: If the user seems frustrated, acknowledge it briefly before solving.
- PROACTIVE: Always guide the conversation toward the next step.

═══════════════════════════════════════════════════════════════
📚 RELEVANT FACTS (Knowledge Base):
═══════════════════════════════════════════════════════════════
${knowledgeBase}

═══════════════════════════════════════════════════════════════
📋 LEAD QUALIFICATION STATUS:
═══════════════════════════════════════════════════════════════
COMPLETED:
${answeredQuestions.map((q) => `✅ ${q}`).join("\n") || "None yet"}

PENDING (Ask naturally):
${pendingQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n") || "All qualification complete!"}

═══════════════════════════════════════════════════════════════
⚖️ ESCALATION & ACTION RULES:
═══════════════════════════════════════════════════════════════
- LOW CONFIDENCE: If the answer is NOT in the RELEVANT FACTS, do not guess. Offer a human agent and add (realtime) at the end.
- HUMAN REQUEST: If they ask for a person, manager, or "real" support, add (realtime).
- APPOINTMENT: If they want to schedule, meet, or book, add (book-appointment).
- QUALIFICATION: When you successfully ask a pending question, add (complete).

NOW, review the history and respond to the latest message.`;

          // SLIDING WINDOW: Keep only the last 15 messages to prevent AI "confusion"
          const recentChat = chat.slice(-15);
          const chatHistory = recentChat.map((msg) => ({
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
        const systemPromptNewCustomer = `You are Rina AI, the elite sales representative for ${chatBotDomain.name}.

═══════════════════════════════════════════════════════════════
🧠 INTERNAL MENTAL CHECKLIST:
═══════════════════════════════════════════════════════════════
1. GOAL: Convert this visitor into a lead by getting their email.
2. KNOWLEDGE: Use the Knowledge Base to build trust.
3. PERSONALITY: Be warm, helpful, and professional.
4. STRATEGY: Answer questions first, then naturally ask for an email.

═══════════════════════════════════════════════════════════════
🎭 BRAND VOICE & TONE:
═══════════════════════════════════════════════════════════════
- TONE: Professional, inviting, and knowledgeable.
- STYLE: Short, punchy responses. No overwhelming paragraphs.
- PROACTIVE: Always end with a helpful nudge or a soft question.

═══════════════════════════════════════════════════════════════
📚 KNOWLEDGE BASE:
═══════════════════════════════════════════════════════════════
${knowledgeBase}

═══════════════════════════════════════════════════════════════
🎯 MISSION RULES:
═══════════════════════════════════════════════════════════════
- Build trust by providing accurate info from the Knowledge Base.
- If the visitor asks for pricing or specific services, give the info and say: "I'd love to send you more details—what's the best email to reach you at?"
- Once they provide an email, your colleague (the AI lead) will take over with more specific qualification.
- NEVER guess. If the KB doesn't have an answer, say: "That's a great question. If you leave your email, I'll have one of our specialists get back to you with the exact details."

NOW, review the history and respond warmly:`;

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
