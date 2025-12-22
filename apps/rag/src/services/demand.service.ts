import { chatModel } from "./embedding.service";

// ===== Types =====
export interface DemandInput {
  intent: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  province?: string;
  district?: string;
  nearBts?: string;
  nearMrt?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  description?: string;
}

export interface ProcessedDemand {
  summary: string;
  tags: string[];
  readinessScore: number;
  normalizedIntent: "buy" | "rent";
  searchableText: string; // For embedding generation
}

// ===== Prompts =====
const SYSTEM_PROMPT = `คุณเป็น AI ผู้เชี่ยวชาญด้านอสังหาริมทรัพย์ในประเทศไทย 
หน้าที่ของคุณคือวิเคราะห์ความต้องการของลูกค้าและสรุปให้กระชับ`;

const PROCESS_DEMAND_PROMPT = `วิเคราะห์ความต้องการอสังหาริมทรัพย์ต่อไปนี้และตอบในรูปแบบ JSON:

ข้อมูลความต้องการ:
- ประเภท: {intent} ({propertyType})
- งบประมาณ: {budget}
- ทำเล: {location}
- ห้องนอน: {bedrooms}
- ห้องน้ำ: {bathrooms}
- พื้นที่: {area}
- รายละเอียดเพิ่มเติม: {description}

กรุณาตอบในรูปแบบ JSON ดังนี้:
{
  "summary": "สรุปความต้องการแบบสั้น 1-2 ประโยค เป็นภาษาไทย",
  "tags": ["tag1", "tag2", ...], // tags ที่เกี่ยวข้อง เช่น pet-friendly, near-bts, furnished ฯลฯ สูงสุด 10 tags
  "readinessScore": 1-100, // ประเมินความพร้อมในการซื้อ/เช่า จากความชัดเจนของข้อมูล
  "normalizedIntent": "buy" หรือ "rent"
}

เฉพาะ JSON เท่านั้น ไม่ต้องมีคำอธิบายอื่น`;

// ===== Available Tags (from shared constants) =====
const AVAILABLE_TAGS = [
  "pet-friendly",
  "no-pets",
  "parking",
  "no-parking-needed",
  "furnished",
  "unfurnished",
  "partially-furnished",
  "near-bts",
  "near-mrt",
  "near-airport-link",
  "near-mall",
  "near-school",
  "near-hospital",
  "pool",
  "gym",
  "security-24h",
  "high-floor",
  "low-floor",
  "city-view",
  "river-view",
  "garden-view",
];

/**
 * Process demand input and generate AI-enhanced metadata
 */
export async function processDemand(
  input: DemandInput
): Promise<ProcessedDemand> {
  // Build prompt with actual data
  const prompt = PROCESS_DEMAND_PROMPT.replace("{intent}", input.intent)
    .replace("{propertyType}", input.propertyType)
    .replace(
      "{budget}",
      input.budgetMin || input.budgetMax
        ? `${input.budgetMin?.toLocaleString() || "ไม่ระบุ"} - ${input.budgetMax?.toLocaleString() || "ไม่ระบุ"} บาท`
        : "ไม่ระบุ"
    )
    .replace(
      "{location}",
      [input.province, input.district, input.nearBts, input.nearMrt]
        .filter(Boolean)
        .join(", ") || "ไม่ระบุ"
    )
    .replace(
      "{bedrooms}",
      input.bedroomsMin
        ? `${input.bedroomsMin}${input.bedroomsMax ? `-${input.bedroomsMax}` : "+"} ห้อง`
        : "ไม่ระบุ"
    )
    .replace(
      "{bathrooms}",
      input.bathroomsMin ? `${input.bathroomsMin}+ ห้อง` : "ไม่ระบุ"
    )
    .replace(
      "{area}",
      input.areaMin
        ? `${input.areaMin}${input.areaMax ? `-${input.areaMax}` : "+"} ตร.ม.`
        : "ไม่ระบุ"
    )
    .replace("{description}", input.description || "ไม่มี");

  try {
    const result = await chatModel.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and filter tags
    const validTags = (parsed.tags || [])
      .filter((tag: string) => AVAILABLE_TAGS.includes(tag))
      .slice(0, 10);

    // Add inferred tags based on input
    if (input.nearBts && !validTags.includes("near-bts")) {
      validTags.push("near-bts");
    }
    if (input.nearMrt && !validTags.includes("near-mrt")) {
      validTags.push("near-mrt");
    }

    // Build searchable text for embedding
    const searchableText = buildSearchableText(input, parsed.summary);

    return {
      summary: parsed.summary || "",
      tags: validTags,
      readinessScore: Math.min(100, Math.max(1, parsed.readinessScore || 50)),
      normalizedIntent: parsed.normalizedIntent === "rent" ? "rent" : "buy",
      searchableText,
    };
  } catch (error) {
    console.error("Error processing demand:", error);

    // Return fallback with basic processing
    return {
      summary: `ต้องการ${input.intent === "rent" ? "เช่า" : "ซื้อ"}${input.propertyType} ${input.province || ""}`,
      tags: inferTags(input),
      readinessScore: calculateBasicReadinessScore(input),
      normalizedIntent: input.intent === "rent" ? "rent" : "buy",
      searchableText: buildSearchableText(input, ""),
    };
  }
}

/**
 * Build searchable text for embedding generation
 */
function buildSearchableText(input: DemandInput, summary: string): string {
  const parts = [
    input.intent === "rent" ? "เช่า rent" : "ซื้อ buy",
    input.propertyType,
    input.province,
    input.district,
    input.nearBts ? `ใกล้ BTS ${input.nearBts}` : null,
    input.nearMrt ? `ใกล้ MRT ${input.nearMrt}` : null,
    input.budgetMin || input.budgetMax
      ? `งบ ${input.budgetMin || 0}-${input.budgetMax || "ไม่จำกัด"}`
      : null,
    input.bedroomsMin ? `${input.bedroomsMin} ห้องนอน` : null,
    input.description,
    summary,
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Infer tags from structured input (fallback if AI fails)
 */
function inferTags(input: DemandInput): string[] {
  const tags: string[] = [];

  if (input.nearBts) tags.push("near-bts");
  if (input.nearMrt) tags.push("near-mrt");

  // Infer from description keywords
  const desc = (input.description || "").toLowerCase();
  if (desc.includes("สัตว์เลี้ยง") || desc.includes("pet")) {
    tags.push("pet-friendly");
  }
  if (desc.includes("เฟอร์") || desc.includes("furnished")) {
    tags.push("furnished");
  }
  if (desc.includes("จอดรถ") || desc.includes("parking")) {
    tags.push("parking");
  }
  if (desc.includes("สระว่ายน้ำ") || desc.includes("pool")) {
    tags.push("pool");
  }
  if (desc.includes("ฟิตเนส") || desc.includes("gym")) {
    tags.push("gym");
  }

  return tags.slice(0, 10);
}

/**
 * Calculate basic readiness score without AI
 */
function calculateBasicReadinessScore(input: DemandInput): number {
  let score = 20; // Base score

  // More specific = more ready
  if (input.budgetMin || input.budgetMax) score += 20;
  if (input.province) score += 15;
  if (input.district) score += 10;
  if (input.bedroomsMin) score += 10;
  if (input.nearBts || input.nearMrt) score += 10;
  if (input.description && input.description.length > 50) score += 15;

  return Math.min(100, score);
}
