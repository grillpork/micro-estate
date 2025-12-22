/**
 * Seed script for initial amenities data
 * Run this after database migration to populate default amenities
 *
 * Usage: bun run src/db/scripts/seed-amenities.ts
 */

import { db } from "../index";
import { amenities } from "../schema";
import { nanoid } from "nanoid";

interface AmenitySeed {
  name: string;
  nameTh: string;
  category:
    | "general"
    | "security"
    | "recreation"
    | "convenience"
    | "parking"
    | "wellness"
    | "outdoor"
    | "utilities";
  icon: string;
  order: number;
}

const amenitySeedData: AmenitySeed[] = [
  // ===== General =====
  {
    name: "Air Conditioning",
    nameTh: "เครื่องปรับอากาศ",
    category: "general",
    icon: "snowflake",
    order: 1,
  },
  {
    name: "Furnished",
    nameTh: "ตกแต่งเฟอร์นิเจอร์",
    category: "general",
    icon: "sofa",
    order: 2,
  },
  {
    name: "Partially Furnished",
    nameTh: "ตกแต่งเฟอร์นิเจอร์บางส่วน",
    category: "general",
    icon: "couch",
    order: 3,
  },
  {
    name: "Kitchen Appliances",
    nameTh: "เครื่องใช้ในครัว",
    category: "general",
    icon: "utensils",
    order: 4,
  },
  {
    name: "Washer",
    nameTh: "เครื่องซักผ้า",
    category: "general",
    icon: "washing-machine",
    order: 5,
  },
  {
    name: "Dryer",
    nameTh: "เครื่องอบผ้า",
    category: "general",
    icon: "dryer",
    order: 6,
  },
  {
    name: "Water Heater",
    nameTh: "เครื่องทำน้ำอุ่น",
    category: "general",
    icon: "thermometer",
    order: 7,
  },
  {
    name: "Balcony",
    nameTh: "ระเบียง",
    category: "general",
    icon: "door-open",
    order: 8,
  },
  {
    name: "Storage Room",
    nameTh: "ห้องเก็บของ",
    category: "general",
    icon: "warehouse",
    order: 9,
  },

  // ===== Security =====
  {
    name: "24-Hour Security",
    nameTh: "รปภ. 24 ชั่วโมง",
    category: "security",
    icon: "shield",
    order: 1,
  },
  {
    name: "CCTV",
    nameTh: "กล้องวงจรปิด",
    category: "security",
    icon: "video",
    order: 2,
  },
  {
    name: "Key Card Access",
    nameTh: "ระบบ Key Card",
    category: "security",
    icon: "key",
    order: 3,
  },
  {
    name: "Smoke Detector",
    nameTh: "เครื่องตรวจจับควัน",
    category: "security",
    icon: "bell",
    order: 4,
  },
  {
    name: "Fire Alarm",
    nameTh: "สัญญาณเตือนไฟไหม้",
    category: "security",
    icon: "bell-ring",
    order: 5,
  },
  {
    name: "Intercom",
    nameTh: "อินเตอร์คอม",
    category: "security",
    icon: "phone",
    order: 6,
  },
  {
    name: "Gated Community",
    nameTh: "หมู่บ้านจัดสรร",
    category: "security",
    icon: "gate",
    order: 7,
  },

  // ===== Recreation =====
  {
    name: "Swimming Pool",
    nameTh: "สระว่ายน้ำ",
    category: "recreation",
    icon: "waves",
    order: 1,
  },
  {
    name: "Kids Pool",
    nameTh: "สระเด็ก",
    category: "recreation",
    icon: "baby",
    order: 2,
  },
  {
    name: "Playground",
    nameTh: "สนามเด็กเล่น",
    category: "recreation",
    icon: "blocks",
    order: 3,
  },
  {
    name: "Games Room",
    nameTh: "ห้องเกม",
    category: "recreation",
    icon: "gamepad",
    order: 4,
  },
  {
    name: "Library",
    nameTh: "ห้องสมุด",
    category: "recreation",
    icon: "book",
    order: 5,
  },
  {
    name: "Sky Lounge",
    nameTh: "Sky Lounge",
    category: "recreation",
    icon: "cloud",
    order: 6,
  },
  {
    name: "Rooftop Garden",
    nameTh: "สวนบนดาดฟ้า",
    category: "recreation",
    icon: "flower",
    order: 7,
  },
  {
    name: "Cinema Room",
    nameTh: "ห้องชมภาพยนตร์",
    category: "recreation",
    icon: "film",
    order: 8,
  },

  // ===== Convenience =====
  {
    name: "Elevator",
    nameTh: "ลิฟต์",
    category: "convenience",
    icon: "chevrons-up",
    order: 1,
  },
  {
    name: "Lobby",
    nameTh: "ล็อบบี้",
    category: "convenience",
    icon: "door-closed",
    order: 2,
  },
  {
    name: "Mail Room",
    nameTh: "ห้องรับพัสดุ",
    category: "convenience",
    icon: "mail",
    order: 3,
  },
  {
    name: "Laundry Room",
    nameTh: "ห้องซักรีด",
    category: "convenience",
    icon: "shirt",
    order: 4,
  },
  {
    name: "Meeting Room",
    nameTh: "ห้องประชุม",
    category: "convenience",
    icon: "users",
    order: 5,
  },
  {
    name: "Co-Working Space",
    nameTh: "พื้นที่ Co-Working",
    category: "convenience",
    icon: "laptop",
    order: 6,
  },
  {
    name: "Convenience Store",
    nameTh: "ร้านสะดวกซื้อ",
    category: "convenience",
    icon: "store",
    order: 7,
  },
  {
    name: "Restaurant",
    nameTh: "ร้านอาหาร",
    category: "convenience",
    icon: "utensils-crossed",
    order: 8,
  },
  {
    name: "WiFi",
    nameTh: "อินเทอร์เน็ต WiFi",
    category: "convenience",
    icon: "wifi",
    order: 9,
  },
  {
    name: "Pet Friendly",
    nameTh: "อนุญาตให้เลี้ยงสัตว์",
    category: "convenience",
    icon: "paw-print",
    order: 10,
  },

  // ===== Parking =====
  {
    name: "Car Parking",
    nameTh: "ที่จอดรถยนต์",
    category: "parking",
    icon: "car",
    order: 1,
  },
  {
    name: "Covered Parking",
    nameTh: "ที่จอดรถมีหลังคา",
    category: "parking",
    icon: "warehouse",
    order: 2,
  },
  {
    name: "Visitor Parking",
    nameTh: "ที่จอดรถสำหรับผู้มาเยือน",
    category: "parking",
    icon: "car-front",
    order: 3,
  },
  {
    name: "Motorcycle Parking",
    nameTh: "ที่จอดรถมอเตอร์ไซค์",
    category: "parking",
    icon: "bike",
    order: 4,
  },
  {
    name: "EV Charging",
    nameTh: "สถานีชาร์จรถไฟฟ้า",
    category: "parking",
    icon: "plug-zap",
    order: 5,
  },

  // ===== Wellness =====
  {
    name: "Fitness Center",
    nameTh: "ฟิตเนส",
    category: "wellness",
    icon: "dumbbell",
    order: 1,
  },
  {
    name: "Yoga Room",
    nameTh: "ห้องโยคะ",
    category: "wellness",
    icon: "heart",
    order: 2,
  },
  {
    name: "Spa",
    nameTh: "สปา",
    category: "wellness",
    icon: "sparkles",
    order: 3,
  },
  {
    name: "Sauna",
    nameTh: "ซาวน่า",
    category: "wellness",
    icon: "flame",
    order: 4,
  },
  {
    name: "Steam Room",
    nameTh: "ห้องสตีม",
    category: "wellness",
    icon: "cloud-rain",
    order: 5,
  },
  {
    name: "Massage Room",
    nameTh: "ห้องนวด",
    category: "wellness",
    icon: "hand",
    order: 6,
  },

  // ===== Outdoor =====
  {
    name: "Garden",
    nameTh: "สวน",
    category: "outdoor",
    icon: "tree",
    order: 1,
  },
  {
    name: "BBQ Area",
    nameTh: "พื้นที่บาร์บีคิว",
    category: "outdoor",
    icon: "flame",
    order: 2,
  },
  {
    name: "Tennis Court",
    nameTh: "สนามเทนนิส",
    category: "outdoor",
    icon: "circle-dot",
    order: 3,
  },
  {
    name: "Basketball Court",
    nameTh: "สนามบาสเกตบอล",
    category: "outdoor",
    icon: "dribbble",
    order: 4,
  },
  {
    name: "Jogging Track",
    nameTh: "ลู่วิ่ง",
    category: "outdoor",
    icon: "footprints",
    order: 5,
  },
  {
    name: "Mini Golf",
    nameTh: "มินิกอล์ฟ",
    category: "outdoor",
    icon: "flag",
    order: 6,
  },
  {
    name: "Lake View",
    nameTh: "วิวทะเลสาบ",
    category: "outdoor",
    icon: "mountain-snow",
    order: 7,
  },
  {
    name: "Sea View",
    nameTh: "วิวทะเล",
    category: "outdoor",
    icon: "waves",
    order: 8,
  },
  {
    name: "City View",
    nameTh: "วิวเมือง",
    category: "outdoor",
    icon: "building",
    order: 9,
  },

  // ===== Utilities =====
  {
    name: "Backup Generator",
    nameTh: "เครื่องปั่นไฟสำรอง",
    category: "utilities",
    icon: "zap",
    order: 1,
  },
  {
    name: "Water Tank",
    nameTh: "ถังเก็บน้ำ",
    category: "utilities",
    icon: "droplet",
    order: 2,
  },
  {
    name: "Solar Panels",
    nameTh: "แผงโซลาร์เซลล์",
    category: "utilities",
    icon: "sun",
    order: 3,
  },
  {
    name: "Central Hot Water",
    nameTh: "ระบบน้ำร้อนส่วนกลาง",
    category: "utilities",
    icon: "thermometer-sun",
    order: 4,
  },
  {
    name: "Waste Management",
    nameTh: "ระบบจัดการขยะ",
    category: "utilities",
    icon: "trash-2",
    order: 5,
  },
];

async function seedAmenities() {
  console.log("🌱 Seeding amenities...");

  try {
    // Check if already seeded
    const existing = await db.select().from(amenities).limit(1);
    if (existing.length > 0) {
      console.log("⚠️  Amenities already exist. Skipping seed.");
      console.log(`   Found ${existing.length} amenities in database.`);
      return;
    }

    // Insert all amenities
    const values = amenitySeedData.map((a) => ({
      id: nanoid(),
      name: a.name,
      nameTh: a.nameTh,
      category: a.category,
      icon: a.icon,
      order: a.order,
      isActive: true,
    }));

    await db.insert(amenities).values(values);

    console.log(`✅ Successfully seeded ${values.length} amenities!`);

    // Print summary by category
    const summary = amenitySeedData.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log("\n📊 Summary by category:");
    Object.entries(summary).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} amenities`);
    });
  } catch (error) {
    console.error("❌ Error seeding amenities:", error);
    throw error;
  }
}

// Run if executed directly
seedAmenities()
  .then(() => {
    console.log("\n🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed:", error);
    process.exit(1);
  });
