import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const outputDir = path.resolve('store-assets/screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createDeviceFrame(contentSvg, x = 130, y = 300, width = 820, height = 1540) {
  return `
    <!-- Device Shadow -->
    <rect x="${x + 10}" y="${y + 16}" width="${width}" height="${height}" rx="56" fill="black" opacity="0.08" filter="blur(20px)" />
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="56" fill="white" stroke="#E9E7E1" stroke-width="4" />
    <!-- Speaker & Camera Hole -->
    <rect x="${x + width / 2 - 60}" y="${y + 16}" width="120" height="10" rx="5" fill="#E9E7E1" />
    
    <!-- Screen Viewport Inner Container -->
    <g transform="translate(${x + 12}, ${y + 36})">
      <rect x="0" y="0" width="${width - 24}" height="${height - 48}" rx="40" fill="#F7F6F2" />
      <g clip-path="url(#screen-clip)">
        ${contentSvg}
      </g>
    </g>
  `;
}

function createBaseLayout({ title, subtitle, badgeText, contentSvg }) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeBadgeText = escapeXml(badgeText);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <clipPath id="screen-clip">
      <rect x="0" y="0" width="796" height="1492" rx="40" />
    </clipPath>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCFCFA"/>
      <stop offset="100%" stop-color="#F2F0E8"/>
    </linearGradient>
    <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#bgGrad)" />
  
  <!-- Subtle Agrarian Pattern Accents -->
  <circle cx="980" cy="150" r="220" fill="#EA580C" opacity="0.04" />
  <circle cx="100" cy="1800" r="300" fill="#10B981" opacity="0.04" />

  <!-- HEADER MARKETING TEXT AREA -->
  <g transform="translate(80, 80)">
    <!-- Category Badge -->
    <rect x="0" y="0" width="${badgeText.length * 11 + 32}" height="36" rx="18" fill="#FFF0E4" stroke="#FFE1CB" stroke-width="2" />
    <text x="16" y="23" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#EA580C" letter-spacing="1">${safeBadgeText}</text>

    <!-- Main Headline -->
    <text x="0" y="90" font-family="Outfit, Plus Jakarta Sans, sans-serif" font-size="44" font-weight="900" fill="#171717" letter-spacing="-1">${safeTitle}</text>

    <!-- Subtitle -->
    <text x="0" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="600" fill="#737873">${safeSubtitle}</text>
  </g>

  <!-- DEVICE FRAME & SCREENSHOT -->
  ${createDeviceFrame(contentSvg, 140, 240, 800, 1620)}
</svg>
  `;
}

// -------------------------------------------------------------
// SCREEN 1: WEATHER DASHBOARD
// -------------------------------------------------------------
const screen1Content = `
  <!-- App Header Bar -->
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Farm Weather</text>
  <rect x="580" y="20" width="190" height="34" rx="17" fill="#E5F5EC" stroke="#CEEFDB" />
  <text x="600" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#10B981">📍 Sacramento Field</text>

  <!-- Animated Farm Microclimate Hero -->
  <g transform="translate(16, 85)">
    <rect width="764" height="380" rx="32" fill="url(#heroSky)" />
    
    <!-- Sun -->
    <circle cx="660" cy="90" r="45" fill="#FACC15" opacity="0.9" />
    <circle cx="660" cy="90" r="60" fill="#FDE047" opacity="0.3" />

    <!-- Clouds -->
    <path d="M 120 110 Q 140 80 170 90 Q 200 80 220 100 Q 240 110 230 130 L 110 130 Z" fill="white" opacity="0.95" />
    <path d="M 420 140 Q 440 120 465 130 Q 485 120 500 135 L 400 135 Z" fill="white" opacity="0.8" />

    <!-- Green Field & Barn -->
    <path d="M 0 240 Q 380 200 764 240 L 764 380 L 0 380 Z" fill="#15803D" />
    <path d="M 0 280 Q 380 250 764 290 L 764 380 L 0 380 Z" fill="#166534" />

    <!-- Red Barn -->
    <rect x="80" y="170" width="130" height="90" fill="#DC2626" rx="4" />
    <polygon points="70,170 145,115 220,170" fill="#B91C1C" />
    <rect x="120" y="200" width="50" height="60" fill="white" rx="2" />

    <!-- Silo -->
    <rect x="225" y="150" width="45" height="110" fill="#94A3B8" rx="4" />
    <path d="M 225 150 Q 247 125 270 150 Z" fill="#64748B" />

    <!-- Cow -->
    <rect x="480" y="270" width="40" height="24" rx="6" fill="white" />
    <rect x="485" y="275" width="12" height="12" fill="#171717" />
    <rect x="510" y="280" width="8" height="8" fill="#171717" />

    <!-- Temperature & Weather Text -->
    <text x="36" y="80" font-family="Outfit, sans-serif" font-size="76" font-weight="900" fill="white">28°</text>
    <text x="36" y="115" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="800" fill="white">Sunny • Feels like 30°</text>
    
    <!-- Field Badges -->
    <rect x="36" y="135" width="120" height="28" rx="14" fill="rgba(255,255,255,0.25)" />
    <text x="50" y="154" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="white">🌱 Soil: 88%</text>

    <rect x="166" y="135" width="110" height="28" rx="14" fill="rgba(255,255,255,0.25)" />
    <text x="180" y="154" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="white">🐄 Cattle: 12</text>
  </g>

  <!-- Metric Cards Grid -->
  <g transform="translate(16, 480)">
    <!-- Humidity Card -->
    <rect x="0" y="0" width="370" height="180" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="24" y="38" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">HUMIDITY</text>
    <text x="24" y="90" font-family="Outfit, sans-serif" font-size="42" font-weight="900" fill="#171717">64%</text>
    <text x="24" y="125" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#10B981">Optimal Dew Point 16°C</text>
    <rect x="24" y="145" width="322" height="10" rx="5" fill="#F7F6F2" />
    <rect x="24" y="145" width="206" height="10" rx="5" fill="#3B82F6" />

    <!-- Wind Card -->
    <rect x="394" y="0" width="370" height="180" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="418" y="38" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">WIND SPEED</text>
    <text x="418" y="90" font-family="Outfit, sans-serif" font-size="42" font-weight="900" fill="#171717">12 <tspan font-size="22">km/h</tspan></text>
    <text x="418" y="125" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#EA580C">NW • Gusts up to 18 km/h</text>
    <rect x="418" y="145" width="322" height="10" rx="5" fill="#F7F6F2" />
    <rect x="418" y="145" width="140" height="10" rx="5" fill="#EA580C" />

    <!-- Rain Chance Card -->
    <rect x="0" y="200" width="370" height="180" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="24" y="238" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">RAIN PROBABILITY</text>
    <text x="24" y="290" font-family="Outfit, sans-serif" font-size="42" font-weight="900" fill="#171717">10%</text>
    <text x="24" y="325" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#10B981">No precipitation expected</text>

    <!-- Soil Moisture Card -->
    <rect x="394" y="200" width="370" height="180" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="418" y="238" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">SOIL MOISTURE</text>
    <text x="418" y="290" font-family="Outfit, sans-serif" font-size="42" font-weight="900" fill="#171717">88%</text>
    <text x="418" y="325" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#10B981">Well Watered Root Zone</text>
  </g>

  <!-- Actionable Recommendations Banner -->
  <g transform="translate(16, 880)">
    <rect width="764" height="130" rx="28" fill="#FFF4ED" stroke="#FFE1CB" />
    <text x="28" y="45" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#EA580C">🚜 FIELD ACTION RECOMMENDATION</text>
    <text x="28" y="80" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="700" fill="#171717">Optimal Morning Spraying Window Available</text>
    <text x="28" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Low wind speed (12 km/h) &amp; mild canopy temperature ideal for foliar nutrition.</text>
  </g>

  <!-- Parcel Quick Map Preview -->
  <g transform="translate(16, 1030)">
    <rect width="764" height="230" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">🗺️ Sacramento Parcel Map (7 Field Zones)</text>
    
    <rect x="28" y="65" width="220" height="135" rx="18" fill="#E5F5EC" stroke="#CEEFDB" />
    <text x="44" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#10B981">Tomato Field</text>
    <text x="44" y="125" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#047857">2.8 ha • Optimal</text>

    <rect x="272" y="65" width="220" height="135" rx="18" fill="#F7F6F2" stroke="#E9E7E1" />
    <text x="288" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#171717">Carrots &amp; Crops</text>
    <text x="288" y="125" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">3.1 ha • Irrigated</text>

    <rect x="516" y="65" width="220" height="135" rx="18" fill="#F7F6F2" stroke="#E9E7E1" />
    <text x="532" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#171717">Fruit Orchard</text>
    <text x="532" y="125" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">1.2 ha • Good</text>
  </g>
`;

// -------------------------------------------------------------
// SCREEN 2: HOURLY & DAILY FORECAST
// -------------------------------------------------------------
const screen2Content = `
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Forecast Timeline</text>
  <text x="580" y="44" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#EA580C">7-Day &amp; 24-Hour</text>

  <!-- 24-Hour Timeline Bar -->
  <g transform="translate(16, 90)">
    <rect width="764" height="260" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="24" y="40" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="#171717">24-HOUR HOURLY TIMELINE</text>

    <g transform="translate(24, 70)">
      <!-- Hour 1 -->
      <rect x="0" y="0" width="130" height="160" rx="20" fill="#171717" />
      <text x="65" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#9CA3AF" text-anchor="middle">Now</text>
      <text x="65" y="70" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle">28°</text>
      <text x="65" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">☀️</text>
      <text x="65" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">0% rain</text>

      <!-- Hour 2 -->
      <rect x="145" y="0" width="130" height="160" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="210" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873" text-anchor="middle">2 PM</text>
      <text x="210" y="70" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717" text-anchor="middle">29°</text>
      <text x="210" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">☀️</text>
      <text x="210" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">0% rain</text>

      <!-- Hour 3 -->
      <rect x="290" y="0" width="130" height="160" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="355" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873" text-anchor="middle">4 PM</text>
      <text x="355" y="70" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717" text-anchor="middle">27°</text>
      <text x="355" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">⛅</text>
      <text x="355" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">10% rain</text>

      <!-- Hour 4 -->
      <rect x="435" y="0" width="130" height="160" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="500" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873" text-anchor="middle">6 PM</text>
      <text x="500" y="70" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717" text-anchor="middle">24°</text>
      <text x="500" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">🌤️</text>
      <text x="500" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">15% rain</text>

      <!-- Hour 5 -->
      <rect x="580" y="0" width="130" height="160" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="645" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873" text-anchor="middle">8 PM</text>
      <text x="645" y="70" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717" text-anchor="middle">21°</text>
      <text x="645" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">🌙</text>
      <text x="645" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">5% rain</text>
    </g>
  </g>

  <!-- 7-Day Forecast Cards -->
  <g transform="translate(16, 370)">
    <text x="8" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">7-DAY AGRICULTURAL OUTLOOK</text>

    <!-- Day 1 Expanded Card -->
    <g transform="translate(0, 40)">
      <rect width="764" height="280" rx="28" fill="white" stroke="#EA580C" stroke-width="2" />
      
      <text x="24" y="44" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="900" fill="#171717">Today • Monday</text>
      <text x="24" y="70" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#EA580C">Sunny &amp; Dry • Max 29° / Min 17°</text>
      
      <text x="680" y="55" font-family="Outfit, sans-serif" font-size="32" font-weight="900" fill="#171717">29°</text>

      <!-- Agronomic Drawer Breakdown -->
      <rect x="24" y="95" width="716" height="155" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="44" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#737873">💧 PRECIPITATION</text>
      <text x="44" y="155" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">0.0 mm (0%)</text>

      <text x="280" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#737873">💦 CANOPY MOISTURE</text>
      <text x="280" y="155" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#10B981">Low Blight Risk</text>

      <text x="530" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#737873">☀️ UV INDEX PEAK</text>
      <text x="530" y="155" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#EA580C">6.5 (High)</text>

      <text x="44" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#171717">🌱 Agronomic Tip: Good day for cultivation and irrigation reservoir checks.</text>
    </g>

    <!-- Day 2 -->
    <g transform="translate(0, 340)">
      <rect width="764" height="110" rx="24" fill="white" stroke="#E9E7E1" />
      <text x="24" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">Tuesday</text>
      <text x="24" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Partly Cloudy • Rain 20%</text>
      <text x="680" y="60" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717">27° / 16°</text>
    </g>

    <!-- Day 3 -->
    <g transform="translate(0, 465)">
      <rect width="764" height="110" rx="24" fill="white" stroke="#E9E7E1" />
      <text x="24" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">Wednesday</text>
      <text x="24" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#38BDF8">Moderate Rain Showers • 6.2 mm</text>
      <text x="680" y="60" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717">22° / 14°</text>
    </g>

    <!-- Day 4 -->
    <g transform="translate(0, 590)">
      <rect width="764" height="110" rx="24" fill="white" stroke="#E9E7E1" />
      <text x="24" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">Thursday</text>
      <text x="24" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#10B981">Clearing Up &amp; Rainbow • Rain 10%</text>
      <text x="680" y="60" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717">25° / 15°</text>
    </g>
  </g>
`;

// -------------------------------------------------------------
// SCREEN 3: LIVE RADAR
// -------------------------------------------------------------
const screen3Content = `
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Live Doppler Radar</text>
  <rect x="580" y="20" width="190" height="34" rx="17" fill="#E5F5EC" stroke="#CEEFDB" />
  <text x="600" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#10B981">● LIVE SATELLITE</text>

  <!-- Map Container -->
  <g transform="translate(16, 85)">
    <rect width="764" height="1100" rx="32" fill="#E2E8F0" />
    
    <!-- Map Terrain Mock -->
    <path d="M 0 100 Q 200 80 400 200 T 764 400 L 764 1100 L 0 1100 Z" fill="#CBD5E1" />
    <path d="M 100 0 Q 300 400 200 800 T 600 1100" fill="none" stroke="#94A3B8" stroke-width="12" />

    <!-- Radar Precipitation Blobs -->
    <circle cx="340" cy="450" r="180" fill="#22C55E" opacity="0.45" />
    <circle cx="380" cy="480" r="110" fill="#EAB308" opacity="0.55" />
    <circle cx="400" cy="500" r="60" fill="#EF4444" opacity="0.7" />

    <!-- Farm Location Marker Pin -->
    <circle cx="380" cy="480" r="28" fill="#171717" stroke="white" stroke-width="4" />
    <circle cx="380" cy="480" r="8" fill="#EA580C" />
    
    <!-- Marker Tag -->
    <rect x="300" y="410" width="160" height="36" rx="12" fill="white" stroke="#E9E7E1" />
    <text x="380" y="433" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#171717" text-anchor="middle">Sacramento Farm</text>

    <!-- Floating Map Controls Header -->
    <rect x="24" y="24" width="716" height="70" rx="24" fill="white" opacity="0.95" />
    <text x="48" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#171717">Precipitation &amp; Wind Radar Layers</text>
    <rect x="580" y="40" width="130" height="36" rx="18" fill="#EA580C" />
    <text x="645" y="63" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="white" text-anchor="middle">Radar HD</text>

    <!-- Radar Playback Bar -->
    <g transform="translate(24, 980)">
      <rect width="716" height="90" rx="28" fill="white" opacity="0.95" />
      <circle cx="65" cy="45" r="28" fill="#EA580C" />
      <polygon points="60,35 75,45 60,55" fill="white" />
      
      <!-- Timeline Scrub -->
      <rect x="120" y="40" width="480" height="10" rx="5" fill="#E2E8F0" />
      <rect x="120" y="40" width="320" height="10" rx="5" fill="#EA580C" />
      <circle cx="440" cy="45" r="12" fill="#171717" stroke="white" stroke-width="3" />

      <text x="650" y="50" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717">LIVE</text>
    </g>
  </g>
`;

// -------------------------------------------------------------
// SCREEN 4: AGRICULTURAL & SOIL INSIGHTS
// -------------------------------------------------------------
const screen4Content = `
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Air, Sun &amp; Soil Telemetry</text>

  <g transform="translate(16, 90)">
    <!-- Air Quality Card -->
    <rect width="764" height="260" rx="28" fill="white" stroke="#E9E7E1" />
    <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="#171717">🍃 AIR QUALITY INDEX (AQI)</text>
    
    <text x="28" y="110" font-family="Outfit, sans-serif" font-size="56" font-weight="900" fill="#10B981">32</text>
    <text x="115" y="110" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="800" fill="#10B981">GOOD</text>
    <text x="28" y="145" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#737873">Clean agrarian canopy air with negligible PM2.5 particulate pollution.</text>

    <!-- AQI Scale Bar -->
    <rect x="28" y="180" width="708" height="14" rx="7" fill="#E2E8F0" />
    <rect x="28" y="180" width="180" height="14" rx="7" fill="#10B981" />
    <circle cx="160" cy="187" r="12" fill="#171717" stroke="white" stroke-width="3" />

    <!-- Details Grid -->
    <g transform="translate(0, 290)">
      <!-- UV Card -->
      <rect x="0" y="0" width="370" height="220" rx="28" fill="white" stroke="#E9E7E1" />
      <text x="24" y="38" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">☀️ UV INDEX</text>
      <text x="24" y="95" font-family="Outfit, sans-serif" font-size="44" font-weight="900" fill="#EA580C">6.4</text>
      <text x="24" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#EA580C">High • Protection Recommended</text>
      <text x="24" y="170" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#737873">Peak UV from 11:30 AM to 2:45 PM.</text>

      <!-- Evapotranspiration Card -->
      <rect x="394" y="0" width="370" height="220" rx="28" fill="white" stroke="#E9E7E1" />
      <text x="418" y="38" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#737873">🌱 EVAPOTRANSPIRATION</text>
      <text x="418" y="95" font-family="Outfit, sans-serif" font-size="44" font-weight="900" fill="#171717">4.2 <tspan font-size="22">mm/day</tspan></text>
      <text x="418" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#10B981">Moderate Canopy Loss</text>
      <text x="418" y="170" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#737873">Replenish 25 L/m² in tomato field.</text>
    </g>

    <!-- Solar Astronomy Arc Card -->
    <g transform="translate(0, 540)">
      <rect width="764" height="260" rx="28" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="#171717">☀️ SUN &amp; DAYLIGHT CYCLE</text>

      <path d="M 60 180 Q 382 40 704 180" fill="none" stroke="#FDE047" stroke-width="8" stroke-dasharray="10,10" />
      <circle cx="382" cy="110" r="20" fill="#FACC15" />

      <text x="60" y="220" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#171717">Sunrise 06:12 AM</text>
      <text x="704" y="220" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#171717" text-anchor="end">Sunset 07:48 PM</text>
      <text x="382" y="220" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#EA580C" text-anchor="middle">13 hrs 36 mins Daylight</text>
    </g>
  </g>
`;

// -------------------------------------------------------------
// SCREEN 5: HOME SCREEN WIDGETS
// -------------------------------------------------------------
const screen5Content = `
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Android Home Widgets</text>

  <g transform="translate(16, 90)">
    <!-- Compact Widget 2x2 -->
    <rect width="370" height="260" rx="32" fill="white" stroke="#E9E7E1" />
    <text x="24" y="40" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#EA580C">SACRAMENTO FIELD</text>
    <text x="24" y="95" font-family="Outfit, sans-serif" font-size="52" font-weight="900" fill="#171717">28°</text>
    <text x="24" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#171717">Sunny • 64% Hum</text>
    <rect x="24" y="160" width="130" height="32" rx="16" fill="#E5F5EC" />
    <text x="40" y="181" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981">🌱 Soil 88%</text>

    <!-- Medium Widget 4x2 -->
    <g transform="translate(0, 290)">
      <rect width="764" height="260" rx="32" fill="#171717" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#FACC15">FARM WEATHER WIDGET (4x2)</text>
      
      <text x="28" y="110" font-family="Outfit, sans-serif" font-size="64" font-weight="900" fill="white">28°C</text>
      <text x="28" y="145" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="700" fill="#9CA3AF">Sacramento Farm • Feels like 30°</text>

      <g transform="translate(380, 50)">
        <rect x="0" y="0" width="340" height="160" rx="20" fill="rgba(255,255,255,0.1)" />
        <text x="20" y="40" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="white">💧 Rain Chance: 10%</text>
        <text x="20" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="white">💨 Wind: 12 km/h NW</text>
        <text x="20" y="110" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#38BDF8">🔄 Synced 15m ago</text>
      </g>
    </g>

    <!-- Widget Info Card -->
    <g transform="translate(0, 580)">
      <rect width="764" height="220" rx="28" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">📱 Native Android Home-Screen Integration</text>
      <text x="28" y="80" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#737873">Periodic 15-minute background refresh via Android WorkManager.</text>
      <text x="28" y="110" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#737873">Zero battery drain with cached offline telemetry storage.</text>
      <rect x="28" y="140" width="220" height="40" rx="20" fill="#EA580C" />
      <text x="138" y="165" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="white" text-anchor="middle">Add to Home Screen</text>
    </g>
  </g>
`;

// -------------------------------------------------------------
// SCREEN 6: APP UPDATES & DIRECT SUPPORT
// -------------------------------------------------------------
const screen6Content = `
  <rect width="796" height="70" fill="white" />
  <text x="24" y="44" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Updates &amp; Direct Support</text>

  <g transform="translate(16, 90)">
    <!-- Version Card -->
    <rect width="764" height="260" rx="28" fill="#E5F5EC" stroke="#CEEFDB" />
    <circle cx="70" cy="70" r="32" fill="white" />
    <text x="70" y="78" font-family="Plus Jakarta Sans, sans-serif" font-size="24" text-anchor="middle">✓</text>

    <text x="120" y="65" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#065F46">You're up to date</text>
    <text x="120" y="95" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#047857">Farm Weather v1.2.0 is the latest release.</text>

    <rect x="28" y="140" width="708" height="90" rx="20" fill="white" stroke="#CEEFDB" />
    <text x="48" y="178" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800" fill="#171717">Official GitHub Release Channel</text>
    <text x="48" y="202" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">mahesh2008here-star / Wheather-pro</text>
    <rect x="580" y="160" width="130" height="36" rx="18" fill="#10B981" />
    <text x="645" y="183" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="white" text-anchor="middle">Check Again</text>

    <!-- Support Card -->
    <g transform="translate(0, 290)">
      <rect width="764" height="380" rx="28" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="900" fill="#171717">❤️ SUPPORT FARM WEATHER (DIRECT UPI)</text>
      <text x="28" y="72" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">100% Commission-free direct support for open-source agriculture weather.</text>

      <!-- Payee Box -->
      <rect x="28" y="95" width="708" height="90" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="48" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#737873">OFFICIAL PAYEE UPI VPA</text>
      <text x="48" y="160" font-family="Space Grotesk, monospace" font-size="20" font-weight="700" fill="#171717">mahesh.2008here@okicici</text>

      <!-- UPI App Buttons Grid -->
      <g transform="translate(28, 205)">
        <rect x="0" y="0" width="165" height="70" rx="16" fill="#4285F4" />
        <text x="82" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="white" text-anchor="middle">Google Pay</text>

        <rect x="180" y="0" width="165" height="70" rx="16" fill="#5F259F" />
        <text x="262" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="white" text-anchor="middle">PhonePe</text>

        <rect x="360" y="0" width="165" height="70" rx="16" fill="#00BAF2" />
        <text x="442" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="white" text-anchor="middle">Paytm</text>

        <rect x="540" y="0" width="165" height="70" rx="16" fill="#10B981" />
        <text x="622" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="white" text-anchor="middle">BHIM UPI</text>
      </g>
    </g>
  </g>
`;

const screenshots = [
  {
    fileName: '01-weather-dashboard.png',
    badgeText: 'FARM MICROCLIMATE • LIVE WEATHER',
    title: 'Weather That Works for Your Farm',
    subtitle: 'Real-time agriculture telemetry, animated fields & condition cards',
    contentSvg: screen1Content,
  },
  {
    fileName: '02-hourly-forecast.png',
    badgeText: 'PRECISION PLANNING • 7-DAY FORECAST',
    title: 'Plan Around the Forecast',
    subtitle: '24-hour timeline, canopy moisture & agronomic spray tips',
    contentSvg: screen2Content,
  },
  {
    fileName: '03-live-radar.png',
    badgeText: 'SATELLITE & RADAR • STORM TRACKING',
    title: 'Live Satellite & Doppler Radar',
    subtitle: 'Track rain clouds, storm fronts & wind patterns in real time',
    contentSvg: screen3Content,
  },
  {
    fileName: '04-agricultural-insights.png',
    badgeText: 'SOIL & AIR TELEMETRY • CROP HEALTH',
    title: 'Soil & Air Quality Insights',
    subtitle: 'Evapotranspiration rate, UV peak index & daylight cycles',
    contentSvg: screen4Content,
  },
  {
    fileName: '05-weather-widgets.png',
    badgeText: 'ANDROID WIDGETS • 15-MIN REFRESH',
    title: 'Custom Farm Weather Widgets',
    subtitle: 'Live home-screen telemetry cards with background WorkManager sync',
    contentSvg: screen5Content,
  },
  {
    fileName: '06-app-updates.png',
    badgeText: 'OFFICIAL RELEASES • OPEN SOURCE',
    title: 'Always Up-to-Date & Supported',
    subtitle: 'Automatic GitHub updates & direct 100% commission-free UPI support',
    contentSvg: screen6Content,
  },
];

console.log('Generating Google Play Store screenshots...');

for (const sc of screenshots) {
  const svgString = createBaseLayout(sc);
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width',
      value: 1080,
    },
  });

  const imageBuffer = resvg.render().asPng();
  const filePath = path.join(outputDir, sc.fileName);
  fs.writeFileSync(filePath, imageBuffer);
  console.log(`Saved ${sc.fileName} (${imageBuffer.length} bytes, 1080x1920)`);
}

console.log('All 6 Google Play Store screenshots created successfully!');
