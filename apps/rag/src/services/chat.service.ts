import { chatModel } from "./embedding.service";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInput {
  userId: string;
  message: string;
  conversationHistory: ChatMessage[];
}

interface ChatResponse {
  reply: string;
  suggestAgent: boolean;
  agents?: { id: string; name: string }[];
}

const SYSTEM_PROMPT = `คุณเป็น AI Assistant ของแพลตฟอร์ม "Micro Estate" ตลาดอสังหาริมทรัพย์
หน้าที่ของคุณคือ:
1. ตอบคำถามเกี่ยวกับการซื้อ ขาย เช่า อสังหาริมทรัพย์ในไทย
2. ให้คำแนะนำเบื้องต้นเกี่ยวกับทำเล ราคา และขั้นตอนต่างๆ
3. ถ้าผู้ใช้มีความต้องการที่ชัดเจน (เช่น อยากหาคอนโดแถวสยาม งบ 5 ล้าน) ให้แนะนำให้พวกเขา "โพสต์ความต้องการหาที่พัก (Demand Post)" เพื่อให้ระบบจับคู่กับ Agent
4. พูดจาสุภาพ เป็นกันเอง และใช้ภาษาไทยเป็นหลัก
5. ห้ามตอบคำถามที่ไม่เกี่ยวกับอสังหาริมทรัพย์ หรือเรื่องการเมือง ศาสนา เรื่องละเอียดอ่อน

ถ้าผู้ใช้ดูเหมือนต้องการคุยกับคนจริงๆ หรือมีความซับซ้อนเกินกว่าที่คุณจะตอบได้ ให้แนะนำให้คุยกับ Agent`;

export async function chatWithAI(input: ChatInput): Promise<ChatResponse> {
  try {
    const history = input.conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add potential RAG context here in the future
    // For now, just direct chat

    const chat = chatModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "รับทราบครับ ผมพร้อมให้ความช่วยเหลือด้านอสังหาริมทรัพย์แล้วครับ มีอะไรให้ช่วยบอกได้เลยครับ",
            },
          ],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(input.message);
    const reply = result.response.text();

    // Simple heuristic to suggest agent
    const suggestAgent =
      reply.includes("คุยกับเจ้าหน้าที่") ||
      reply.includes("ติดต่อตัวแทน") ||
      input.message.includes("ติดต่อคน") ||
      input.message.includes("คุยกับคน");

    return {
      reply,
      suggestAgent,
    };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return {
      reply: "ขออภัยครับ ระบบเกิดข้อขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง",
      suggestAgent: false,
    };
  }
}
