// Generates the lightweight SVG product / category artwork used across the store.
// Run: node --import ./scripts/register-ts.mjs scripts/generate-images.mjs
import fs from "node:fs";
import path from "node:path";
import { dbAll, closeDatabase } from "../lib/db.ts";

const root = process.cwd();
const outDir = path.join(root, "public", "images");
const productDir = path.join(outDir, "products");
const categoryDir = path.join(outDir, "categories");
for (const dir of [outDir, productDir, categoryDir]) fs.mkdirSync(dir, { recursive: true });

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

const light = `#f7f4ed`;
const stone = `#ece6d9`;
const ink = `#141a20`;
const brass = `#b3894f`;

function frame(id) {
  return `
  <rect width="1200" height="900" fill="url(#${id}-bg)"/>
  <rect x="46" y="46" width="1108" height="808" fill="none" stroke="${brass}" stroke-opacity="0.35" stroke-width="1.5"/>
  <g opacity="0.35" stroke="#cfc6b2" stroke-width="1">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${90 * i}" x2="1200" y2="${90 * i}"/>`).join("")}
  </g>`;
}

function defs(id, woodTone) {
  return `
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="1" stop-color="${stone}"/>
    </linearGradient>
    <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef1f4"/>
      <stop offset="0.28" stop-color="#c6ccd3"/>
      <stop offset="0.55" stop-color="#9aa4ae"/>
      <stop offset="0.78" stop-color="#dde2e7"/>
      <stop offset="1" stop-color="#aeb6bf"/>
    </linearGradient>
    <linearGradient id="${id}-brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e2c79a"/>
      <stop offset="0.5" stop-color="${brass}"/>
      <stop offset="1" stop-color="#856234"/>
    </linearGradient>
    <linearGradient id="${id}-wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${woodTone[0]}"/>
      <stop offset="0.5" stop-color="${woodTone[1]}"/>
      <stop offset="1" stop-color="${woodTone[2]}"/>
    </linearGradient>
    <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="${ink}" flood-opacity="0.18"/>
    </filter>
    <filter id="${id}-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>`;
}

const woodTones = {
  oak: ["#d8b184", "#c79a67", "#b07f4c"],
  walnut: ["#8d6748", "#74523a", "#55392a"],
  ash: ["#e3cba6", "#d4b78b", "#bd9d6f"],
  charcoal: ["#6f6259", "#574c45", "#3d3530"],
};

const woodOrder = ["oak", "walnut", "ash", "charcoal"];

function grain(id, x, y, w, h, random) {
  const lines = Array.from({ length: 9 }, (_, i) => {
    const yy = y + (h / 10) * (i + 1) + (random() - 0.5) * 14;
    const bend = w * (0.08 + random() * 0.16);
    return `<path d="M${x} ${yy} C${x + w * 0.28} ${yy - bend}, ${x + w * 0.62} ${yy + bend}, ${x + w} ${yy - bend * 0.4}" stroke="#4b3524" stroke-opacity="${0.12 + random() * 0.1}" stroke-width="${1 + random() * 1.6}" fill="none" stroke-linecap="round"/>`;
  }).join("");
  return `<g clip-path="url(#${id}-clip-${Math.round(x)})">${lines}</g>`;
}

function aluminumMotif(id, random) {
  const angle = -8 + random() * 16;
  return `
  <g transform="translate(600 460) rotate(${angle})" filter="url(#${id}-soft)">
    <g fill="url(#${id}-metal)" stroke="#6d7780" stroke-width="2.5">
      <polygon points="-300,-210 300,-210 300,-176 -266,-176 -266,40 -300,40"/>
      <polygon points="-300,72 -60,72 -60,210 -94,210 -94,106 -300,106"/>
      <polygon points="120,-40 300,-40 300,210 266,210 266,-6 120,-6"/>
    </g>
    <g stroke="#ffffff" stroke-opacity="0.75" stroke-width="2" fill="none">
      <polyline points="-266,-188 266,-188"/>
      <polyline points="-266,88 -94,88"/>
    </g>
    <rect x="-300" y="40" width="34" height="32" fill="url(#${id}-brass)"/>
    <rect x="266" y="-6" width="34" height="32" fill="url(#${id}-brass)"/>
    <path d="M-330 210 H330" stroke="${brass}" stroke-width="3" stroke-opacity="0.7"/>
  </g>`;
}

function woodMotif(id, random, tone) {
  const w = 760;
  const x = 220;
  const y = 140;
  const h = 620;
  return `
  <g filter="url(#${id}-soft)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#${id}-wood)"/>
    <clipPath id="${id}-clip-${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>
    ${grain(id, x, y, w, h, random)}
    <rect x="${x}" y="${y}" width="26" height="${h}" fill="url(#${id}-metal)" opacity="0.92"/>
    <rect x="${x + w - 26}" y="${y}" width="26" height="${h}" fill="url(#${id}-metal)" opacity="0.92"/>
    <rect x="${x + 26}" y="${y}" width="5" height="${h}" fill="${brass}" opacity="0.55"/>
    <rect x="${x + w - 31}" y="${y}" width="5" height="${h}" fill="${brass}" opacity="0.55"/>
  </g>
  <g stroke="none" fill="url(#${id}-brass)" opacity="0.9">
    <rect x="${x - 54}" y="${y + 40}" width="34" height="180"/>
    <rect x="${x + w + 20}" y="${y + h - 220}" width="34" height="180"/>
  </g>`;
}

function panelMotif(id, random, tone) {
  const slats = 5;
  const gap = 14;
  const width = 150;
  const total = slats * width + (slats - 1) * gap;
  const startX = (1200 - total) / 2;
  const rows = Array.from({ length: slats }, (_, i) => {
    const x = startX + i * (width + gap);
    const shade = 0.82 + random() * 0.28;
    return `
    <g filter="url(#${id}-soft)">
      <rect x="${x}" y="120" width="${width}" height="660" fill="url(#${id}-wood)" opacity="${shade.toFixed(2)}"/>
      <rect x="${x + 12}" y="120" width="6" height="660" fill="${brass}" opacity="0.35"/>
    </g>`;
  }).join("");
  return `
  ${rows}
  <rect x="${startX - 44}" y="96" width="${total + 88}" height="18" fill="url(#${id}-metal)"/>
  <rect x="${startX - 44}" y="786" width="${total + 88}" height="18" fill="url(#${id}-metal)"/>`;
}

function accessoryMotif(id, random) {
  return `
  <g filter="url(#${id}-soft)">
    <g transform="translate(590 470) rotate(-10)">
      <rect x="-330" y="-60" width="560" height="210" rx="18" fill="url(#${id}-metal)" stroke="#8b949d" stroke-width="2"/>
      <rect x="-250" y="-150" width="560" height="210" rx="18" fill="url(#${id}-brass)" opacity="0.75"/>
      <rect x="-170" y="-240" width="560" height="210" rx="18" fill="url(#${id}-metal)" stroke="#8b949d" stroke-width="2"/>
      <circle cx="-40" cy="-135" r="18" fill="#2b3238"/>
      <circle cx="90" cy="-90" r="18" fill="#2b3238"/>
      <path d="M-330 150 H230" stroke="${brass}" stroke-width="4" stroke-dasharray="10 14"/>
    </g>
  </g>
  <g fill="none" stroke="${ink}" stroke-opacity="0.35" stroke-width="2">
    <circle cx="950" cy="240" r="52"/>
    <circle cx="950" cy="240" r="30"/>
    <path d="M950 188 V150 M950 292 V330 M898 240 H860 M1002 240 H1040"/>
  </g>`;
}

function buildSvg({ seed, category, tone, variant }) {
  const id = `s${(seed % 100000) + variant}`;
  const random = rng(seed + variant * 7919);
  const wood = woodTones[tone] ?? woodTones.oak;
  let motif;
  if (category === "aluminum-trims") motif = aluminumMotif(id, random);
  else if (category === "wood-fiber-profiles") motif = woodMotif(id, random, wood);
  else if (category === "wall-panels") motif = panelMotif(id, random, wood);
  else motif = accessoryMotif(id, random);

  const watermarkOpacity = variant === 0 ? 0.32 : 0.24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img">
  ${defs(id, wood)}
  ${frame(id)}
  ${motif}
  <rect width="1200" height="900" filter="url(#${id}-grain)" opacity="0.05"/>
  <text x="1146" y="836" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="12" fill="${ink}" opacity="${watermarkOpacity}">WALLINE</text>
  <text x="1146" y="864" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="6" fill="${brass}" opacity="${watermarkOpacity}">WALLINE · 沃澜</text>
</svg>`;
}

function placeholder() {
  const id = "placeholder";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img">
  ${defs(id, woodTones.oak)}
  ${frame(id)}
  <g opacity="0.5" stroke="${brass}" fill="none" stroke-width="3">
    <path d="M380 520 L520 380 L660 520 L800 380"/>
    <circle cx="600" cy="470" r="150" stroke-dasharray="8 12"/>
  </g>
  <text x="600" y="700" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" letter-spacing="10" fill="${ink}" opacity="0.45">WALLINE</text>
</svg>`;
}

const products = await dbAll("SELECT slug, category FROM products ORDER BY id");
const categories = await dbAll("SELECT slug FROM categories ORDER BY sort");
await closeDatabase();

let written = 0;
for (const product of products) {
  const seed = hash(product.slug);
  const tone = woodOrder[seed % woodOrder.length];
  for (const variant of [0, 1]) {
    const file = path.join(productDir, `${product.slug}${variant === 0 ? "" : "-b"}.svg`);
    fs.writeFileSync(file, buildSvg({ seed, category: product.category, tone, variant }));
    written += 1;
  }
}
for (const category of categories) {
  const seed = hash(category.slug);
  fs.writeFileSync(path.join(categoryDir, `${category.slug}.svg`), buildSvg({ seed, category: category.slug, tone: woodOrder[seed % woodOrder.length], variant: 0 }));
  written += 1;
}
fs.writeFileSync(path.join(outDir, "placeholder.svg"), placeholder());
written += 1;

console.log(`Wrote ${written} SVG files to public/images`);
