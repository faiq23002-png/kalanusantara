// ============================================================================
// src/ui/icons.js
// Set Ikon SVG Garis Tebal Konsisten (16+ Ikon Utama v3 — Tanpa Emoji)
// ============================================================================

const SVG_PATHS = {
  keris: `<path d="M12 2c2.2 2.8-2.2 5 0 7.8s-2.2 5 0 7.7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M7 17.5h10l-1.8 4H8.8l-1.8-4Z" fill="#D8A444" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  panah: `<path d="M5 3c7 3 9 11 0 18" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M5 3v18" stroke="#D8A444" stroke-width="1.6"/><path d="M3 12h17m0 0-3.5-3.5M20 12l-3.5 3.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`,
  tombak: `<path d="M4 20 15.5 8.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><polygon points="20 4 13.5 6.5 17.5 10.5 20 4" fill="#D8A444" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12.5 11.5 15 9" stroke="#D8A444" stroke-width="2.2" stroke-linecap="round"/>`,
  tinju: `<path d="M7 11V7a2 2 0 1 1 4 0v3m0-3V6a2 2 0 1 1 4 0v4m0-3a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5v-4a2 2 0 0 1 3-1.7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M5 14h14" stroke="#D8A444" stroke-width="2"/>`,
  surya: `<circle cx="12" cy="12" r="4" fill="#D8A444" stroke="currentColor" stroke-width="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2m0-14.2-2.2 2.2M7.1 16.9l-2.2 2.2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  jamu: `<path d="M9 3h6m-5 0v4l-4 7a3 3 0 0 0 2.6 4.5h6.8A3 3 0 0 0 18 14l-4-7V3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M7.5 14h9" stroke="#4F6F3B" stroke-width="2.4"/>`,
  gobog: `<circle cx="12" cy="12" r="8.5" fill="#D8A444" stroke="currentColor" stroke-width="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.8" fill="#2A1A12" stroke="currentColor" stroke-width="1.6"/>`,
  buku: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Zm16 0A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" fill="none"/>`,
  museum: `<path d="M3 9l9-5 9 5H3Zm3 2v7m4-7v7m4-7v7m4-7v7M3 20h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  gapura: `<path d="M4 20V9l3-3v14M20 20V9l-3-3v14M7 20h10M9 20v-6h6v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  main: `<polygon points="7 5 19 12 7 19 7 5" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`,
  toko: `<path d="M3 9l2-5h14l2 5M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  rapor: `<path d="M6 3h9l3 3v15H6V3Zm3 8h6m-6 4h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  guru: `<path d="M2 9l10-5 10 5-10 5-10-5Zm4 2v5c3 2 9 2 12 0v-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  setelan: `<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  bintang: `<polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.7 5.8 21 7 14 2 9.3 9 8.5 12 2" fill="#F2D27A" stroke="#8E6A22" stroke-width="1.5" stroke-linejoin="round"/>`,
  bintang_kosong: `<polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.7 5.8 21 7 14 2 9.3 9 8.5 12 2" fill="#3b2a1c" stroke="#8E6A22" stroke-width="1.5" stroke-linejoin="round"/>`,
  bintangKosong: `<polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.7 5.8 21 7 14 2 9.3 9 8.5 12 2" fill="#3b2a1c" stroke="#8E6A22" stroke-width="1.5" stroke-linejoin="round"/>`,
  gembok: `<rect x="5" y="11" width="14" height="10" rx="2" fill="#2A1A12" stroke="currentColor" stroke-width="2.2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
  jeda: `<path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>`,
  suara: `<path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m2.8-9.8a9 9 0 0 1 0 12.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  suara_mati: `<path d="M11 5 6 9H3v6h3l5 4V5Zm10 4-6 6m0-6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  lompat: `<path d="m6 13 6-6 6 6M6 19l6-6 6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  dash: `<path d="m5 6 6 6-6 6m8-12 6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  hati: `<path d="M12 20.5s-7.5-4.6-9.3-9A5.2 5.2 0 0 1 12 6.3a5.2 5.2 0 0 1 9.3 5.2c-1.8 4.4-9.3 9-9.3 9Z" fill="#B4492F" stroke="currentColor" stroke-width="1.8"/>`,
  artefak: `<path d="M8 3h8l-1 4 3 5v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-6l3-5-1-4Z" fill="#D8A444" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  cek: `<path d="m5 12 5 5L20 7" stroke="#4F6F3B" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  tutup: `<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`
};

export function iconSVG(name, size = 18, extraClass = '') {
  const inner = SVG_PATHS[name] || SVG_PATHS.surya;
  return `<svg class="svg-ico ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
}

export function renderStarsSVG(count = 0, max = 3, size = 16) {
  let html = '';
  for (let i = 0; i < max; i++) {
    html += iconSVG(i < count ? 'bintang' : 'bintang_kosong', size);
  }
  return html;
}

export const starPairSVG = renderStarsSVG;
