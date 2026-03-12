import Anthropic from '@anthropic-ai/sdk';
import type { FareStructure } from '../types/fareStructure';

const EXTRACTION_PROMPT = `Analyze this bus/transit fare document and extract ALL fare information into a structured JSON format.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "network": { "id": "kebab-case-id", "name": "Full Network Name" },
  "currency": "USD",
  "areas": [
    { "id": "zone-a", "name": "Zone A" }
  ],
  "riderCategories": [
    { "id": "adult", "name": "Adult", "isDefault": true },
    { "id": "child", "name": "Child", "isDefault": false }
  ],
  "fareMedia": [
    { "id": "cash", "name": "Cash", "type": 0 }
  ],
  "timeframes": [
    { "id": "peak", "name": "Peak", "startTime": "06:00:00", "endTime": "09:00:00" }
  ],
  "fareProducts": [
    {
      "id": "adult-cash-zone-a-to-zone-b",
      "name": "Adult Cash Zone A to Zone B",
      "amount": 2.50,
      "riderCategoryId": "adult",
      "fareMediaId": "cash",
      "fromAreaId": "zone-a",
      "toAreaId": "zone-b"
    }
  ],
  "transferRules": [
    {
      "transferCount": 2,
      "fareTransferType": 2,
      "fareProductId": "transfer-free"
    }
  ]
}

RULES:
- Use lowercase-kebab-case for ALL IDs
- fareMedia.type values: 0=none/cash, 1=paper ticket, 2=transit card, 3=contactless (cEMV), 4=mobile app
- fareTransferType: 0=sum of legs, 1=sum capped, 2=free transfer
- transferCount: -1 means unlimited transfers
- For fareProducts: generate ONE entry for EVERY distinct price combination of (riderCategory × fareMedia × zone pair × timeframe)
- If the fare is flat (same everywhere), omit fromAreaId and toAreaId from fareProducts
- If no timeframes mentioned, leave timeframes array empty and omit timeframeId from fareProducts
- If the document only shows one fare media (e.g. just cash), still include it
- Ensure exactly one riderCategory has isDefault: true
- Ensure the currency code is ISO 4217 (e.g. USD, EUR, GBP)
- If transfer info is not mentioned, leave transferRules as empty array []`;

export async function extractFares(
  apiKey: string,
  file: File,
): Promise<FareStructure> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const contentBlocks = await buildContentBlocks(file);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: [
          ...contentBlocks,
          { type: 'text' as const, text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return parseExtractedJSON(textBlock.text);
}

async function buildContentBlocks(file: File): Promise<Anthropic.ContentBlockParam[]> {
  const base64 = await fileToBase64(file);

  if (file.type === 'application/pdf') {
    return [
      {
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: base64,
        },
      },
    ];
  }

  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  return [
    {
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: mediaType,
        data: base64,
      },
    },
  ];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseExtractedJSON(text: string): FareStructure {
  // Try to extract JSON from the response (Claude might wrap it in markdown code blocks)
  let jsonStr = text.trim();

  // Remove markdown code block if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);

  // Basic validation
  if (!parsed.network?.id || !parsed.currency || !Array.isArray(parsed.fareProducts)) {
    throw new Error('Invalid fare structure: missing required fields (network, currency, fareProducts)');
  }

  return parsed as FareStructure;
}
