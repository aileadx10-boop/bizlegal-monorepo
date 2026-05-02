import type { Env, LeadProfile } from "./types";
import type { JurisdictionSnapshot } from "./reports";

// Gemini 2.5 Flash Image ("Nano Banana") raw-fetch client.
// Returns base64-encoded image data + mime type.

const GEMINI_IMAGE_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

export interface GeminiImageResult {
  readonly base64: string;
  readonly mimeType: string;
  readonly width?: number;
  readonly height?: number;
}

export async function generateImage(
  env: Env,
  prompt: string,
  opts: { maxRetries?: number } = {}
): Promise<GeminiImageResult | null> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[gemini] GEMINI_API_KEY not set; skipping image generation");
    return null;
  }

  const maxRetries = opts.maxRetries ?? 2;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"]
    }
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(GEMINI_IMAGE_ENDPOINT, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const detail = (await res.text().catch(() => "<unreadable>")).slice(0, 400);
        throw new Error(`Gemini ${res.status}: ${detail}`);
      }
      const payload = (await res.json()) as {
        candidates?: ReadonlyArray<{
          content?: {
            parts?: ReadonlyArray<{
              inlineData?: { mimeType: string; data: string };
              text?: string;
            }>;
          };
        }>;
      };
      const inlineData = payload.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
        ?.inlineData;
      if (!inlineData) {
        throw new Error("Gemini response missing inlineData image payload");
      }
      return { base64: inlineData.data, mimeType: inlineData.mimeType };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, Math.pow(3, attempt) * 500));
      }
    }
  }
  console.warn("[gemini] image generation failed:", lastError);
  return null;
}

// ------------------------------------------------------------------
// Prompt builders (kept here so both snapshot + future Intelligence Reports
// share the same BizLegal-AI visual language)
// ------------------------------------------------------------------

export function snapshotHeroPrompt(snap: JurisdictionSnapshot): string {
  const [a, b] = snap.jurisdictions;
  const aName = a?.display_name ?? snap.request.jurisdiction_codes[0];
  const bName = b?.display_name ?? snap.request.jurisdiction_codes[1];
  const activity = snap.request.activity.slice(0, 120);

  return `Editorial-style infographic, wide 1200x630 aspect ratio for web hero image.

COMPOSITION: Split-screen comparison visualization contrasting two jurisdictions: "${aName}" on the left half, "${bName}" on the right half. Abstract architectural or cartographic motifs evoking regulatory frameworks — no photorealistic buildings, no literal flags, no human figures, no faces.

THEME: ${activity}. Convey "regulatory intelligence" with crisp geometric shapes, subtle gridlines, and flowing data-connection lines between the two halves.

COLOR PALETTE: Light off-white background (#f8f7ff). Primary accent deep purple (#5b21b6) and a pink-gradient complement (#ec4899). Use restrained color — 80% neutral tones, 20% accent.

STYLE: Minimalist, editorial, modern fintech/compliance aesthetic. Clean vector feel. Think The Economist infographics meets Stripe landing page. Subtle depth with soft shadows.

NO TEXT in the image. Pure visual. No logos. No watermarks. No country flags. No human figures.`;
}

export function leadHeroPrompt(profile: LeadProfile): string {
  const company = profile.company?.name ?? "a crypto/Web3 company";
  const vertical = profile.qualification?.vertical ?? "compliance";

  return `Abstract editorial illustration, 1200x630 aspect ratio.

SUBJECT: Regulatory intelligence signal for ${company}, vertical "${vertical}". Convey incoming-lead energy: a signal being received and parsed.

COMPOSITION: Abstract geometric composition — angular shapes, data-wave lines, a subtle "beacon" focal point. No human figures, no faces, no flags, no logos.

COLOR: Light background (#f8f7ff). Accents deep purple (#5b21b6) and pink gradient (#ec4899). Clean, restrained, modern.

STYLE: Stripe-landing-page aesthetic. Minimalist. Editorial. Vector-clean. No text in image.`;
}
