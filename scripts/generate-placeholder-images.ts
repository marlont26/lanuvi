// Generates the SVG placeholder photography used by the mock catalog.
// Run with: npm run images
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_PRODUCTS } from "../src/lib/mock-data";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "products");
mkdirSync(outDir, { recursive: true });

const palettes: Record<string, { bg: [string, string]; jar: string; content: string; cap: string }> = {
  yogures: { bg: ["#F3F0FF", "#E4DCFB"], jar: "#FBFAFF", content: "#EFE9FE", cap: "#7C5CD6" },
  mermeladas: { bg: ["#FFF1F2", "#FBD9DF"], jar: "#FFF8F8", content: "#B3315A", cap: "#7E1F3C" },
  cuchareables: { bg: ["#FFF7EC", "#F7E3C4"], jar: "#FFFCF6", content: "#D9A05B", cap: "#8A5A22" },
};

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text: string, max = 18) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function jarSvg({
  title,
  subtitle,
  category,
  variant,
}: {
  title: string;
  subtitle: string;
  category: string;
  variant: 1 | 2;
}) {
  const p = palettes[category];
  const lines = wrap(title);
  const tilt = variant === 2 ? "rotate(-6 400 430)" : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${escape(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.bg[0]}"/>
      <stop offset="100%" stop-color="${p.bg[1]}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.jar}" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${p.jar}" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="640" cy="150" r="120" fill="#ffffff" opacity="0.35"/>
  <ellipse cx="400" cy="690" rx="210" ry="34" fill="#000000" opacity="0.07"/>
  <g ${tilt}>
    <rect x="255" y="250" width="290" height="420" rx="46" fill="url(#glass)" stroke="#00000014"/>
    <rect x="285" y="400" width="230" height="240" rx="30" fill="${p.content}"/>
    <rect x="285" y="400" width="230" height="26" rx="13" fill="#ffffff" opacity="0.35"/>
    <rect x="245" y="205" width="310" height="66" rx="26" fill="${p.cap}"/>
    <rect x="300" y="452" width="200" height="120" rx="18" fill="#ffffff" opacity="0.92"/>
    <text x="400" y="498" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" letter-spacing="6" fill="${p.cap}">LANUVI</text>
    <text x="400" y="536" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" fill="#5b5b5b">${escape(subtitle)}</text>
  </g>
  ${lines
    .map(
      (line, i) =>
        `<text x="400" y="${120 + i * 44}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="38" fill="#2f2a3a" opacity="0.85">${escape(line)}</text>`,
    )
    .join("\n  ")}
</svg>
`;
}

let count = 0;
for (const product of SEED_PRODUCTS) {
  const files = new Set([product.imageUrl, ...product.gallery]);
  for (const file of files) {
    const variant: 1 | 2 = file.endsWith("-2.svg") ? 2 : 1;
    writeFileSync(
      join(root, "public", file),
      jarSvg({
        title: product.name,
        subtitle: variant === 2 ? "Hecho en pequeños lotes" : product.category,
        category: product.category,
        variant,
      }),
    );
    count += 1;
  }
}
console.log(`Generated ${count} placeholder images in public/products`);
