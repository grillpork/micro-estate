/**
 * Omise Client-side Utilities
 * Handles Omise.js script loading and card tokenization
 */

import type { OmiseTokenResponse, CardFormData } from "@/types/payment";

// Omise Public Key (development)
const OMISE_PUBLIC_KEY = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || "";

// Track script loading state
let isScriptLoaded = false;
let isScriptLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load Omise.js script dynamically
 */
export function loadOmiseScript(): Promise<void> {
  // Return existing promise if loading
  if (loadPromise) {
    return loadPromise;
  }

  // Already loaded
  if (isScriptLoaded && window.Omise) {
    return Promise.resolve();
  }

  // Start loading
  isScriptLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.querySelector(
      'script[src="https://cdn.omise.co/omise.js"]'
    );

    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener("load", () => {
        isScriptLoaded = true;
        isScriptLoading = false;
        initializeOmise();
        resolve();
      });
      existingScript.addEventListener("error", () => {
        isScriptLoading = false;
        reject(new Error("Failed to load Omise.js"));
      });
      return;
    }

    // Create and append script
    const script = document.createElement("script");
    script.src = "https://cdn.omise.co/omise.js";
    script.async = true;

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      initializeOmise();
      resolve();
    };

    script.onerror = () => {
      isScriptLoading = false;
      loadPromise = null;
      reject(new Error("Failed to load Omise.js"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Initialize Omise with public key
 */
function initializeOmise(): void {
  if (window.Omise && OMISE_PUBLIC_KEY) {
    window.Omise.setPublicKey(OMISE_PUBLIC_KEY);
  }
}

/**
 * Create a card token using Omise.js
 */
export function createCardToken(cardData: CardFormData): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure script is loaded
      await loadOmiseScript();

      if (!window.Omise) {
        throw new Error("Omise.js not loaded");
      }

      if (!OMISE_PUBLIC_KEY) {
        throw new Error("Omise public key not configured");
      }

      // Create token
      window.Omise.createToken(
        "card",
        {
          name: cardData.name,
          number: cardData.number.replace(/\s/g, ""), // Remove spaces
          expiration_month: parseInt(cardData.expirationMonth, 10),
          expiration_year: parseInt(cardData.expirationYear, 10),
          security_code: cardData.securityCode,
        },
        (statusCode: number, response: OmiseTokenResponse) => {
          if (statusCode === 200 && response.object === "token") {
            resolve(response.id);
          } else if (response.object === "error") {
            reject(new Error(response.message));
          } else {
            reject(new Error("Failed to create card token"));
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
}

/**
 * Get card brand from number
 */
export function getCardBrand(number: string): string {
  const cleanNumber = number.replace(/\s/g, "");

  if (/^4/.test(cleanNumber)) {
    return "visa";
  } else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return "mastercard";
  } else if (/^3[47]/.test(cleanNumber)) {
    return "amex";
  } else if (/^62/.test(cleanNumber)) {
    return "unionpay";
  } else if (/^35[2-8]/.test(cleanNumber)) {
    return "jcb";
  }

  return "unknown";
}

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(number: string): boolean {
  const cleanNumber = number.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate expiration date
 */
export function validateExpirationDate(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Convert 2-digit year to 4-digit
  const fullYear = y < 100 ? 2000 + y : y;

  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && m < currentMonth) {
    return false;
  }

  return true;
}

/**
 * Check if Omise is configured
 */
export function isOmiseConfigured(): boolean {
  return !!OMISE_PUBLIC_KEY;
}

export { OMISE_PUBLIC_KEY };
