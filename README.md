# QR Studio — Custom Vector QR Code Generator

A client-side web application for generating fully customized, print-ready, high-resolution QR codes with URL tracking parameter cleaning, shape styling, brand icons, and vector SVG/PDF export.

---

## 1. Commands & Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Vite development server on port 3000 |
| `npm run build` | Produce optimized static client-side bundle in `dist/` |
| `npm run lint` | Type-check TypeScript sources (`tsc --noEmit`) |
| `npm test` or `npx tsx src/utils/trackingCleaner.test.ts` | Run automated unit test suite for URL tracking cleaner |
| `npm run preview` | Preview production build locally |

### Static Deployment
The application is 100% client-side and requires no backend, database, or server APIs.
To deploy statically:
```bash
npm run build
# Deploy the contents of the `dist/` directory to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or AWS S3.
```

---

## 2. Architecture & Project Structure

All data processing, tracking cleaning, SVG rendering, and file exports run strictly in the browser. No URLs, text, or uploaded images are sent to any remote servers.

```
/
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # Project title, capabilities, and permissions
├── package.json                 # Dependencies and build scripts
├── src/
│   ├── main.tsx                 # React application entry
│   ├── App.tsx                  # Root component & 2-column layout
│   ├── index.css                # Tailwind CSS base styles & checkerboard pattern
│   ├── types/
│   │   └── qr.ts                # TypeScript types & interfaces
│   ├── data/
│   │   └── icons.ts             # Built-in SVG vector icons & domain suggestions
│   ├── utils/
│   │   ├── trackingCleaner.ts   # URL tracking cleaning engine & rules
│   │   ├── trackingCleaner.test.ts # Automated unit tests for tracking cleaner
│   │   ├── qrExport.ts          # High-res PNG, vector SVG, and vector PDF export
│   │   ├── colorContrast.ts     # WCAG contrast ratio & scannability evaluation
│   │   └── storage.ts           # Privacy-safe localStorage helper (styles only)
│   └── components/
│       ├── Navbar.tsx           # Top navigation bar
│       ├── ContentSection.tsx   # URL cleaner, protocol helper, and Unicode text
│       ├── PresetsBar.tsx       # Quick style presets (Classic, Rounded, Dots, Minimal)
│       ├── StyleSection.tsx     # Shapes for QR body and corner markers
│       ├── ColorSection.tsx     # Color pickers, HEX inputs, transparency, contrast
│       ├── LogoSection.tsx      # Upload raster logo & vector icon library
│       ├── PreviewPanel.tsx     # Real-time sticky QR preview with checkerboard
│       ├── ExportSection.tsx    # PNG, SVG, and vector PDF downloads
│       └── TestModal.tsx        # In-browser test runner modal for rule verification
```

---

## 3. How to Add a New Icon

To add a new icon to the built-in icon library:

1. Open `src/data/icons.ts`.
2. Append a new `IconDefinition` object to the `ICON_LIBRARY` array:

```typescript
{
  id: 'myservice',                     // Unique slug
  name: 'My Service',                  // Display name in search & badges
  category: 'Social',                  // 'Social' | 'Messaging' | 'Video & Music' | 'Services' | 'General'
  brandColor: '#0088CC',               // Primary brand HEX
  matchDomains: ['myservice.com'],     // Hostnames for smart suggestion prompt
  viewBox: '0 0 24 24',                // SVG coordinate box
  originalSvg: `                       // Multi-color or gradient brand SVG paths
    <circle cx="12" cy="12" r="11" fill="#0088CC" />
    <path fill="#ffffff" d="..." />
  `,
  monochromePaths: `                   // Single path/group that takes fill="currentColor"
    <path fill="currentColor" d="..." />
  `,
}
```
3. The icon is automatically searchable, categorized, and available with both original brand colors and monochrome coloring.

---

## 4. How to Add a New URL Tracking Rule

All URL cleaning rules are defined in `src/utils/trackingCleaner.ts` under `DEFAULT_TRACKING_CONFIG`.

### A. Adding a global tracking parameter:
If an advertising network adds a new tracking parameter (e.g. `xyz_clickid`):
```typescript
exactKeys: [
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'ttclid',
  'twclid',
  'mc_cid',
  'mc_eid',
  'xyz_clickid', // <--- Add here
],
```

### B. Adding a domain-specific rule:
To add tracking parameters that should **only** be stripped from a specific domain (without affecting other domains):
```typescript
domainRules: [
  {
    domainMatches: (hostname: string) => {
      const lower = hostname.toLowerCase();
      return lower === 'tiktok.com' || lower.endsWith('.tiktok.com');
    },
    keys: ['_t', '_r'],
  },
]
```

### C. Adding a signed parameter check:
If a service uses a new cryptographic signature parameter:
```typescript
signedParamKeys: [
  'x-amz-signature',
  'x-goog-signature',
  'signature',
  'sig',
  'myservice-sig', // <--- Add here
]
```

---

## 5. Icon Sources & Licensing Attribution

All vector icons in the local library are sourced under open, permissive terms (Simple Icons / MIT License / Lucide / Public Domain Brand Guidelines):

- **Brand Logos (Instagram, Facebook, X/Twitter, Threads, TikTok, LinkedIn, Pinterest, Reddit, WhatsApp, Telegram, Messenger, Discord, Signal, YouTube, Twitch, Spotify, SoundCloud, Google Maps, Google Drive, GitHub, PayPal)**:
  - Sourced from Simple Icons (CC0 1.0 Universal / MIT) and official brand asset packages.
  - Used nominatively to indicate service endpoints without modification of trademark identities.
- **General System Icons (Website, Link, Email, Phone, Location)**:
  - Sourced from Lucide / Feather Icons (ISC License).

---

## 6. Manual Verification & Scanning Checklist

Before releasing or printing generated QR codes, perform the following verification steps:

1. **URL Cleaning Check**:
   - Paste: `https://www.instagram.com/__crystal_el__?srtk=MTV4czhoaDQyaTJtNg%3D%3D&utm_source=qr`
   - Click **Clean tracking** -> verify URL becomes `https://www.instagram.com/__crystal_el__` and removed parameters display `srtk, utm_source`.
   - Click **Undo** -> verify original URL is restored.
   - Test YouTube URL: `https://www.youtube.com/watch?v=abc123&utm_source=qr` -> verify `v=abc123` is preserved.
2. **Unicode & Text Check**:
   - Switch to **Text** mode.
   - Enter Ukrainian text (e.g. `Тестове повідомлення українською мовою з емодзі 🚀`).
   - Scan with smartphone camera -> verify exact text is decoded.
3. **Vector SVG Check**:
   - Download the SVG file.
   - Open in vector editor (Figma, Illustrator, Inkscape) or inspect in browser developer tools.
   - Verify that `<rect>` and `<path>` vector nodes exist, rather than a single embedded raster base64 PNG.
4. **Vector PDF Check**:
   - Download the PDF file.
   - Open in Adobe Acrobat or browser PDF viewer.
   - Zoom in to 800% -> verify all QR modules and built-in icons remain razor sharp with vector lines.
   - Verify page dimensions match chosen size (e.g., 50×50 mm square page).
5. **Physical Camera Scanning**:
   - Scan each preset (Classic, Rounded, Dots, Minimal) directly from the screen using both iOS Camera and Android Google Lens.
   - Test with a central logo attached; ensure error correction H allows rapid scan recognition.
