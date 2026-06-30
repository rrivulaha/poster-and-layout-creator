/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Pre-defined vector SVG logos and graphics for Auroville Film Institute (AVFI)
 * and Himalayan Institute of Alternatives, Ladakh (HIAL), as well as general
 * publishing assets like laurel wreaths and musical staves.
 */

// 1. Official Black Logo (Wheel + Cursive "Auroville" + bold "FILM INSTITUTE")
export const AVFI_OFFICIAL_BLACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 300" width="100%" height="100%">
  <g transform="translate(225, 80)">
    <circle cx="0" cy="0" r="50" fill="none" stroke="#111111" stroke-width="6"/>
    <circle cx="0" cy="0" r="25" fill="none" stroke="#111111" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="8" fill="none" stroke="#111111" stroke-width="3"/>
    <circle cx="0" cy="0" r="3" fill="#111111"/>
    <line x1="0" y1="8" x2="0" y2="50" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
    <line x1="-7.61" y1="2.47" x2="-47.55" y2="15.45" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
    <line x1="-4.7" y1="-6.47" x2="-29.39" y2="-40.45" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
    <line x1="4.7" y1="-6.47" x2="29.39" y2="-40.45" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
    <line x1="7.61" y1="2.47" x2="47.55" y2="15.45" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
  </g>
  <text x="225" y="195" font-family="'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive" font-size="75" font-weight="700" text-anchor="middle" fill="#111111">Auroville</text>
  <text x="225" y="245" font-family="'Inter', 'Helvetica Neue', 'Arial', sans-serif" font-size="30" font-weight="800" letter-spacing="4.5" text-anchor="middle" fill="#111111">FILM INSTITUTE</text>
</svg>
`;

// 2. Official Orange/Gold Logo
export const AVFI_OFFICIAL_ORANGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 300" width="100%" height="100%">
  <g transform="translate(225, 80)">
    <circle cx="0" cy="0" r="50" fill="none" stroke="#f19e18" stroke-width="6"/>
    <circle cx="0" cy="0" r="25" fill="none" stroke="#f19e18" stroke-width="4.5"/>
    <circle cx="0" cy="0" r="8" fill="none" stroke="#f19e18" stroke-width="3"/>
    <circle cx="0" cy="0" r="3" fill="#f19e18"/>
    <line x1="0" y1="8" x2="0" y2="50" stroke="#f19e18" stroke-width="5" stroke-linecap="round"/>
    <line x1="-7.61" y1="2.47" x2="-47.55" y2="15.45" stroke="#f19e18" stroke-width="5" stroke-linecap="round"/>
    <line x1="-4.7" y1="-6.47" x2="-29.39" y2="-40.45" stroke="#f19e18" stroke-width="5" stroke-linecap="round"/>
    <line x1="4.7" y1="-6.47" x2="29.39" y2="-40.45" stroke="#f19e18" stroke-width="5" stroke-linecap="round"/>
    <line x1="7.61" y1="2.47" x2="47.55" y2="15.45" stroke="#f19e18" stroke-width="5" stroke-linecap="round"/>
  </g>
  <text x="225" y="195" font-family="'Dancing Script', 'Great Vibes', 'Brush Script MT', cursive" font-size="75" font-weight="700" text-anchor="middle" fill="#f19e18">Auroville</text>
  <text x="225" y="245" font-family="'Inter', 'Helvetica Neue', 'Arial', sans-serif" font-size="30" font-weight="800" letter-spacing="4.5" text-anchor="middle" fill="#f19e18">FILM INSTITUTE</text>
</svg>
`;

// 3. Auroville Film Institute Wheel Logo (Golden wheel with concentric rings and 12 spokes)
export const AUROVILLE_WHEEL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" stroke-width="4"/>
  <circle cx="50" cy="50" r="28" fill="none" stroke="#d4af37" stroke-width="3"/>
  <circle cx="50" cy="50" r="10" fill="#d4af37" />
  <!-- 12 Spokes -->
  <line x1="50" y1="5" x2="50" y2="95" stroke="#d4af37" stroke-width="2"/>
  <line x1="5" y1="50" x2="95" y2="50" stroke="#d4af37" stroke-width="2"/>
  <line x1="18.2" y1="18.2" x2="81.8" y2="81.8" stroke="#d4af37" stroke-width="2"/>
  <line x1="18.2" y1="81.8" x2="81.8" y2="18.2" stroke="#d4af37" stroke-width="2"/>
  <line x1="31.7" y1="7.2" x2="68.3" y2="92.8" stroke="#d4af37" stroke-width="1.5"/>
  <line x1="7.2" y1="31.7" x2="92.8" y2="68.3" stroke="#d4af37" stroke-width="1.5"/>
  <line x1="7.2" y1="68.3" x2="92.8" y2="31.7" stroke="#d4af37" stroke-width="1.5"/>
  <line x1="31.7" y1="92.8" x2="68.3" y2="7.2" stroke="#d4af37" stroke-width="1.5"/>
  <circle cx="50" cy="50" r="4" fill="#ffffff"/>
</svg>
`;

// 2. Full Auroville Film Institute Combined Logo (Golden wheel + Elegant Serif Text)
export const AVFI_COMBINED_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 100" width="450" height="100">
  <!-- Wheel Group -->
  <g transform="translate(10, 5)">
    <circle cx="45" cy="45" r="40" fill="none" stroke="#d4af37" stroke-width="4"/>
    <circle cx="45" cy="45" r="24" fill="none" stroke="#d4af37" stroke-width="3"/>
    <circle cx="45" cy="45" r="8" fill="#d4af37" />
    <line x1="45" y1="5" x2="45" y2="85" stroke="#d4af37" stroke-width="2"/>
    <line x1="5" y1="45" x2="85" y2="45" stroke="#d4af37" stroke-width="2"/>
    <line x1="16.7" y1="16.7" x2="73.3" y2="73.3" stroke="#d4af37" stroke-width="2"/>
    <line x1="16.7" y1="73.3" x2="73.3" y2="16.7" stroke="#d4af37" stroke-width="2"/>
    <circle cx="45" cy="45" r="3" fill="#ffffff"/>
  </g>
  <!-- Text Group -->
  <g transform="translate(110, 15)">
    <text x="0" y="32" font-family="'Playfair Display', 'Georgia', serif" font-size="34" font-weight="italic" font-style="italic" fill="#555555">Auroville</text>
    <text x="0" y="68" font-family="'Inter', 'Helvetica', sans-serif" font-size="28" font-weight="bold" letter-spacing="4" fill="#111111">FILM INSTITUTE</text>
  </g>
</svg>
`;

// 3. Himalayan Institute of Alternatives, Ladakh Logo (Brown/Dark Red Geometric Knot + Sans-Serif Text)
export const HIAL_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 100" width="550" height="100">
  <!-- Knot Group -->
  <g transform="translate(10, 10)">
    <path d="M 40,0 L 80,40 L 40,80 L 0,40 Z" fill="none" stroke="#8B2500" stroke-width="6"/>
    <path d="M 40,15 L 65,40 L 40,65 L 15,40 Z" fill="none" stroke="#8B2500" stroke-width="4"/>
    <path d="M 20,40 L 40,20 L 60,40 L 40,60 Z" fill="none" stroke="#8B2500" stroke-width="2"/>
    <line x1="40" y1="0" x2="40" y2="80" stroke="#8B2500" stroke-width="3"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#8B2500" stroke-width="3"/>
  </g>
  <!-- Text Group -->
  <g transform="translate(110, 20)">
    <text x="0" y="30" font-family="'Inter', 'Helvetica', sans-serif" font-size="24" font-weight="bold" letter-spacing="1" fill="#111111">HIMALAYAN INSTITUTE</text>
    <text x="0" y="60" font-family="'Inter', 'Helvetica', sans-serif" font-size="20" font-weight="medium" letter-spacing="0.5" fill="#555555">OF ALTERNATIVES, LADAKH</text>
  </g>
</svg>
`;

// 4. Festival Laurel Wreath (For movie screening awards/selection branding)
export const LAUREL_WREATH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="200" height="150">
  <path d="M 30,120 Q 15,60 60,30" fill="none" stroke="#111111" stroke-width="3"/>
  <path d="M 170,120 Q 185,60 140,30" fill="none" stroke="#111111" stroke-width="3"/>
  <!-- Left leaves -->
  <path d="M 25,110 Q 12,100 20,95 Q 30,105 25,110 Z" fill="#111111"/>
  <path d="M 20,90 Q 5,80 15,75 Q 25,85 20,90 Z" fill="#111111"/>
  <path d="M 18,70 Q 3,60 13,55 Q 23,65 18,70 Z" fill="#111111"/>
  <path d="M 22,50 Q 8,40 18,35 Q 28,45 22,50 Z" fill="#111111"/>
  <path d="M 32,35 Q 22,23 32,20 Q 40,30 32,35 Z" fill="#111111"/>
  <path d="M 47,25 Q 40,10 50,10 Q 55,22 47,25 Z" fill="#111111"/>
  <!-- Right leaves -->
  <path d="M 175,110 Q 188,100 180,95 Q 170,105 175,110 Z" fill="#111111"/>
  <path d="M 180,90 Q 195,80 185,75 Q 175,85 180,90 Z" fill="#111111"/>
  <path d="M 182,70 Q 197,60 187,55 Q 177,65 182,70 Z" fill="#111111"/>
  <path d="M 178,50 Q 192,40 182,35 Q 172,45 178,50 Z" fill="#111111"/>
  <path d="M 168,35 Q 178,23 168,20 Q 160,30 168,35 Z" fill="#111111"/>
  <path d="M 153,25 Q 160,10 150,10 Q 145,22 153,25 Z" fill="#111111"/>
</svg>
`;

// 5. Musical Staff / Treble Clef Graphic
export const MUSICAL_STAFF_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120" width="800" height="120">
  <line x1="10" y1="20" x2="790" y2="20" stroke="#111111" stroke-width="2"/>
  <line x1="10" y1="40" x2="790" y2="40" stroke="#111111" stroke-width="2"/>
  <line x1="10" y1="60" x2="790" y2="60" stroke="#111111" stroke-width="2"/>
  <line x1="10" y1="80" x2="790" y2="80" stroke="#111111" stroke-width="2"/>
  <line x1="10" y1="100" x2="790" y2="100" stroke="#111111" stroke-width="2"/>
  <!-- Treble Clef -->
  <path d="M 50,110 C 53,115 57,115 60,110 C 63,105 60,95 50,85 C 40,75 35,60 40,45 C 45,30 55,20 60,10 C 62,5 64,5 63,12 C 60,25 50,55 52,70 C 53,75 57,75 60,70 C 63,65 60,55 52,45 C 45,35 48,25 55,20 C 62,15 68,25 65,35 C 62,45 52,55 50,65 Z" fill="none" stroke="#111111" stroke-width="3"/>
</svg>
`;

// Helper function to turn an SVG string into an loadable base64 Data URL
export function svgToDataUrl(svgStr: string): string {
  const cleaned = svgStr.trim();
  const encoded = btoa(unescape(encodeURIComponent(cleaned)));
  return `data:image/svg+xml;base64,${encoded}`;
}

// 6. High quality Unsplash URLs for our templates (guaranteed direct public image links)
export const INSTITUTIONAL_ASSETS = {
  // Movie still 1: cinematic old man profile (for Bijoo Toppo Retrospective, look like the photo)
  cinematicElderProfile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600",
  // Movie still 2: tribal woman / girl in nature (for Humans of the Loop)
  girlInNature: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800&h=600",
  // Movie still 3: abstract cinematic jigsaw puzzle / textures (for Origin)
  originAbstract: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=1080&h=1080",
  // Movie still 4: old man on bicycle in forest (for CODA)
  elderBicycle: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&q=80&w=1080&h=720",
  // Newsletter cover main image: fallen tree / forest nature (for News & Notes)
  fallenTree: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1080&h=720",
  // White flower background texture (for Student ID card background watermark)
  whiteFlowerTexture: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1000&h=600",
  // Avatar picture 1 (for Faisal student card)
  studentAvatar1: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400",
  // Avatar picture 2 (for Akash student card)
  studentAvatar2: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400",
};

// Bundle standard vector assets for UI insertion
export const LIBRARY_ASSETS = [
  { id: "avfi_official_black", name: "Auroville Film Institute Logo (Black)", svg: AVFI_OFFICIAL_BLACK_SVG, type: "logo" as const },
  { id: "avfi_official_orange", name: "Auroville Film Institute Logo (Orange)", svg: AVFI_OFFICIAL_ORANGE_SVG, type: "logo" as const },
  { id: "avfi_wheel", name: "AVFI Wheel Symbol", svg: AUROVILLE_WHEEL_SVG, type: "symbol" as const },
  { id: "avfi_combined", name: "AVFI Wordmark", svg: AVFI_COMBINED_LOGO_SVG, type: "logo" as const },
  { id: "hial_combined", name: "HIAL Wordmark", svg: HIAL_LOGO_SVG, type: "logo" as const },
  { id: "laurel_wreath", name: "Laurel Wreath (Film Laurel)", svg: LAUREL_WREATH_SVG, type: "laurel" as const },
  { id: "musical_staff", name: "Musical Staff Clef", svg: MUSICAL_STAFF_SVG, type: "graphic" as const }
];
