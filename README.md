# GTFS Fares Builder

**Live app:** https://sysdevrun.github.io/gtfs-fares-builder/

Upload a PDF or image of a bus/transit fare table and automatically generate [GTFS Fares v2](https://gtfs.org/documentation/schedule/examples/fares/) files ready to integrate into a GTFS feed.

## How it works

1. **Upload** a fare document (PDF, JPEG, PNG, GIF, or WebP)
2. **Extract** — Claude Sonnet analyzes the document and extracts all fare combinations into a structured format
3. **Review & edit** — a tabbed editor lets you verify and adjust the extracted data (network info, fare zones, rider categories, fare media, timeframes, fare products, transfer rules)
4. **Download** — generates GTFS Fares v2 files bundled as a ZIP

## Generated GTFS files

| File | Content |
|------|---------|
| `fare_products.txt` | Purchasable fare offerings with amounts |
| `fare_leg_rules.txt` | Fare rules per journey segment (zone pairs, timeframes) |
| `fare_transfer_rules.txt` | Transfer discounts and free transfer rules |
| `fare_media.txt` | Payment methods (cash, transit card, mobile, etc.) |
| `rider_categories.txt` | Rider types (adult, child, senior, student) |
| `networks.txt` | Transit network/operator |
| `areas.txt` | Fare zones |
| `timeframes.txt` | Peak/off-peak time periods |

## Setup

Requires a user-provided [Anthropic API key](https://console.anthropic.com/). No backend — runs entirely in the browser.

```bash
npm install
npm run dev
```

## Tech stack

- Vite + React + TypeScript
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) (browser mode with CORS)
- Tailwind CSS
- JSZip for ZIP generation
