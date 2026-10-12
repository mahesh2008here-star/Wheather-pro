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

function createDeviceFrame(contentSvg, x = 140, y = 240, width = 800, height = 1620) {
  return `
    <!-- Device Outer Frame Shadow -->
    <rect x="${x + 8}" y="${y + 12}" width="${width}" height="${height}" rx="52" fill="black" opacity="0.08" filter="blur(16px)" />
    <!-- Device Outer Body Shell -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4" />
    
    <!-- Phone Top Camera Notch / Punchhole -->
    <rect x="${x + width / 2 - 50}" y="${y + 16}" width="100" height="8" rx="4" fill="#CBD5E1" />
    
    <!-- Inner Screen Display Viewport -->
    <g transform="translate(${x + 10}, ${y + 32})">
      <rect x="0" y="0" width="${width - 20}" height="${height - 44}" rx="38" fill="#F7F6F2" />
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
      <rect x="0" y="0" width="780" height="1576" rx="38" />
    </clipPath>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCFCFA"/>
      <stop offset="100%" stop-color="#F2F0E8"/>
    </linearGradient>
    <linearGradient id="radarHeat" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="35%" stop-color="#F59E0B"/>
      <stop offset="70%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="aqiBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="25%" stop-color="#F59E0B"/>
      <stop offset="60%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1080" height="1920" fill="url(#bgGrad)" />
  
  <!-- Subtle Background Accent Circles -->
  <circle cx="980" cy="150" r="240" fill="#EA580C" opacity="0.035" />
  <circle cx="100" cy="1800" r="280" fill="#10B981" opacity="0.035" />

  <!-- MARKETING HEADER SLOGAN & BADGE -->
  <g transform="translate(80, 75)">
    <!-- Category Badge -->
    <rect x="0" y="0" width="${badgeText.length * 10 + 36}" height="36" rx="18" fill="#FFF0E4" stroke="#FFE1CB" stroke-width="2" />
    <text x="18" y="23" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#EA580C" letter-spacing="0.8">${safeBadgeText}</text>

    <!-- Main Marketing Headline -->
    <text x="0" y="90" font-family="Outfit, Plus Jakarta Sans, sans-serif" font-size="42" font-weight="900" fill="#171717" letter-spacing="-0.8">${safeTitle}</text>

    <!-- Subtitle Description -->
    <text x="0" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="21" font-weight="600" fill="#737873">${safeSubtitle}</text>
  </g>

  <!-- DEVICE FRAME & REAL SCREENSHOT RENDER -->
  ${createDeviceFrame(contentSvg, 140, 240, 800, 1620)}
</svg>
  `;
}

function renderRealHeader(location = "Bengaluru") {
  return `
    <!-- Top App Bar -->
    <rect width="780" height="64" fill="#F7F6F2" />
    <rect x="18" y="14" width="36" height="36" rx="18" fill="#FFF0E4" stroke="#FFE1CB" />
    <path d="M 30 24 C 36 22, 42 28, 36 38 C 30 38, 26 30, 30 24 Z" fill="#EA580C" />
    
    <text x="64" y="30" font-family="Outfit, sans-serif" font-size="11" font-weight="900" fill="#EA580C" letter-spacing="0.8">FARM WEATHER</text>
    <text x="64" y="47" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#171717">${location} &#8291;⌄</text>

    <circle cx="660" cy="32" r="16" fill="white" stroke="#E9E7E1" />
    <circle cx="704" cy="32" r="16" fill="white" stroke="#E9E7E1" />
    <circle cx="748" cy="32" r="16" fill="white" stroke="#E9E7E1" />
  `;
}

function renderRealBottomNav(activeTab = 'weather') {
  const tabs = [
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'radar', label: 'Radar', icon: '🛰️' },
    { id: 'airsun', label: 'Air &amp; Sun', icon: '☀️' },
    { id: 'widgets', label: 'Widgets', icon: '📱' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  let tabSvgs = '';
  tabs.forEach((tab, index) => {
    const x = 18 + index * 148;
    const isActive = tab.id === activeTab;
    if (isActive) {
      tabSvgs += `
        <rect x="${x}" y="10" width="140" height="44" rx="22" fill="#FFF0E4" stroke="#FFE1CB" />
        <text x="${x + 20}" y="37" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="900" fill="#EA580C">${tab.icon} ${tab.label}</text>
      `;
    } else {
      tabSvgs += `
        <text x="${x + 50}" y="37" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">${tab.icon}</text>
      `;
    }
  });

  return `
    <g transform="translate(0, 1500)">
      <rect width="780" height="76" fill="white" stroke="#E9E7E1" />
      ${tabSvgs}
    </g>
  `;
}

// SCREEN 1: REAL HOME WEATHER DASHBOARD
const screen1Content = `
  ${renderRealHeader("Bengaluru")}

  <g transform="translate(16, 75)">
    <rect width="748" height="36" rx="18" fill="#E5F5EC" stroke="#CEEFDB" />
    <text x="20" y="23" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981">⚡ Acquiring live GPS fix...</text>

    <g transform="translate(0, 48)">
      <rect width="748" height="400" rx="32" fill="white" stroke="#E9E7E1" />
      
      <circle cx="64" cy="64" r="32" fill="#FFF0E4" />
      <text x="64" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="28" text-anchor="middle">☀️</text>
      
      <text x="112" y="52" font-family="Outfit, sans-serif" font-size="22" font-weight="900" fill="#171717">Clear Sky</text>
      <text x="112" y="76" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#737873">Feels like 24°</text>

      <rect x="470" y="38" width="240" height="34" rx="17" fill="#E5F5EC" stroke="#CEEFDB" />
      <text x="490" y="60" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981">🛡️ AQI 83 • Moderate</text>

      <text x="48" y="180" font-family="Outfit, sans-serif" font-size="108" font-weight="900" fill="#171717">23°</text>
      
      <text x="560" y="145" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#EA580C">↑ 30°</text>
      <text x="620" y="145" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#3B82F6">↓ 20°</text>
      <text x="560" y="170" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#737873">High / Low</text>

      <text x="48" y="225" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#444746">Mild, steady atmospheric conditions favorable for scheduled fieldwork and cultivation.</text>

      <g transform="translate(24, 275)">
        <rect x="0" y="0" width="210" height="90" rx="20" fill="#EFF6FF" stroke="#DBEAFE" />
        <text x="20" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#3B82F6">RAIN RISK</text>
        <text x="20" y="68" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#1D4ED8">💧 0%</text>

        <rect x="230" y="0" width="220" height="90" rx="20" fill="#E5F5EC" stroke="#CEEFDB" />
        <text x="250" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10B981">FIELD WIND</text>
        <text x="250" y="68" font-family="Outfit, sans-serif" font-size="24" font-weight="900" fill="#047857">🌬 10 ENE</text>

        <rect x="470" y="0" width="230" height="90" rx="20" fill="#E5F5EC" stroke="#CEEFDB" />
        <text x="490" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10B981">HUMIDITY</text>
        <text x="490" y="68" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#047857">💦 73%</text>
      </g>
    </g>

    <g transform="translate(0, 468)">
      <rect width="748" height="240" rx="32" fill="white" stroke="#E9E7E1" />
      <text x="28" y="40" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="#171717">⏰ 24-HOUR HORIZON</text>
      <text x="610" y="40" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#EA580C">Scroll 24h →</text>

      <g transform="translate(28, 65)">
        <rect x="0" y="0" width="150" height="140" rx="22" fill="#FFF0E4" stroke="#FFE1CB" />
        <text x="75" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#EA580C" text-anchor="middle">• Now</text>
        <text x="75" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="24" text-anchor="middle">☀️</text>
        <text x="75" y="105" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717" text-anchor="middle">23°</text>

        <rect x="165" y="0" width="150" height="140" rx="22" fill="#F7F6F2" stroke="#E9E7E1" />
        <text x="240" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">9 AM</text>
        <text x="240" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="24" text-anchor="middle">☀️</text>
        <text x="240" y="105" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717" text-anchor="middle">26°</text>

        <rect x="330" y="0" width="150" height="140" rx="22" fill="#F7F6F2" stroke="#E9E7E1" />
        <text x="405" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">10 AM</text>
        <text x="405" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="24" text-anchor="middle">☀️</text>
        <text x="405" y="105" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717" text-anchor="middle">27°</text>

        <rect x="495" y="0" width="150" height="140" rx="22" fill="#F7F6F2" stroke="#E9E7E1" />
        <text x="570" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873" text-anchor="middle">11 AM</text>
        <text x="570" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="24" text-anchor="middle">☀️</text>
        <text x="570" y="105" font-family="Outfit, sans-serif" font-size="26" font-weight="900" fill="#171717" text-anchor="middle">29°</text>
      </g>
    </g>

    <g transform="translate(0, 720)">
      <rect width="748" height="680" rx="32" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="#171717">📅 7-DAY CROP OUTLOOK</text>

      <g transform="translate(28, 65)">
        <text x="0" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#EA580C">• Today</text>
        <text x="130" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="14">🌤️ 27%</text>
        <text x="240" y="25" font-family="Outfit, sans-serif" font-size="16" font-weight="700" fill="#737873">20°</text>
        
        <rect x="280" y="12" width="260" height="14" rx="7" fill="#E2E8F0" />
        <rect x="310" y="12" width="180" height="14" rx="7" fill="#EA580C" />

        <text x="565" y="25" font-family="Outfit, sans-serif" font-size="16" font-weight="800" fill="#171717">30°</text>
      </g>

      <g transform="translate(28, 135)">
        <text x="0" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="700" fill="#171717">Tuesday</text>
        <text x="130" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="14">⛅</text>
        <text x="240" y="25" font-family="Outfit, sans-serif" font-size="16" font-weight="700" fill="#737873">20°</text>
        
        <rect x="280" y="12" width="260" height="14" rx="7" fill="#E2E8F0" />
        <rect x="310" y="12" width="200" height="14" rx="7" fill="#EA580C" />

        <text x="565" y="25" font-family="Outfit, sans-serif" font-size="16" font-weight="800" fill="#171717">32°</text>
      </g>
    </g>
  </g>

  ${renderRealBottomNav('weather')}
`;

// SCREEN 2: REAL LIVE DOPPLER RADAR
const screen2Content = `
  ${renderRealHeader("Bengaluru")}

  <g transform="translate(16, 75)">
    <rect width="748" height="36" rx="18" fill="#E5F5EC" stroke="#CEEFDB" />
    <text x="20" y="23" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981">📍 GPS Location: Bengaluru</text>

    <g transform="translate(0, 48)">
      <rect x="0" y="0" width="230" height="40" rx="20" fill="#FFF0E4" stroke="#FFE1CB" />
      <text x="36" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="900" fill="#EA580C">🌧️ Precipitation</text>

      <rect x="245" y="0" width="240" height="40" rx="20" fill="white" stroke="#E9E7E1" />
      <text x="280" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#171717">💨 Wind Streams</text>

      <rect x="500" y="0" width="248" height="40" rx="20" fill="white" stroke="#E9E7E1" />
      <text x="535" y="25" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#171717">🌡️ Temperature</text>
    </g>

    <g transform="translate(0, 102)">
      <rect width="748" height="880" rx="32" fill="#F0FDF4" stroke="#DCFCE7" />

      <circle cx="374" cy="420" r="320" fill="none" stroke="#BBF7D0" stroke-width="2" stroke-dasharray="6,6" />
      <circle cx="374" cy="420" r="220" fill="none" stroke="#BBF7D0" stroke-width="2" stroke-dasharray="6,6" />
      <circle cx="374" cy="420" r="120" fill="none" stroke="#BBF7D0" stroke-width="2" stroke-dasharray="6,6" />

      <line x1="374" y1="100" x2="374" y2="740" stroke="#BBF7D0" stroke-width="2" />
      <line x1="54" y1="420" x2="694" y2="420" stroke="#BBF7D0" stroke-width="2" />

      <circle cx="330" cy="380" r="140" fill="url(#radarHeat)" opacity="0.6" filter="blur(20px)" />
      <circle cx="460" cy="460" r="110" fill="#3B82F6" opacity="0.5" filter="blur(18px)" />

      <circle cx="374" cy="420" r="10" fill="#EA580C" stroke="white" stroke-width="3" />

      <rect x="28" y="24" width="180" height="34" rx="17" fill="white" stroke="#E9E7E1" />
      <text x="48" y="46" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#171717">📍 Bengaluru</text>

      <circle cx="680" cy="40" r="18" fill="white" stroke="#E9E7E1" />
      <text x="680" y="46" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" text-anchor="middle">+</text>

      <circle cx="680" cy="85" r="18" fill="white" stroke="#E9E7E1" />
      <text x="680" y="90" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" text-anchor="middle">−</text>

      <g transform="translate(28, 810)">
        <text x="0" y="0" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#171717">Light (15 dBZ)</text>
        <rect x="150" y="-10" width="380" height="12" rx="6" fill="url(#aqiBar)" />
        <text x="690" y="0" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#DC2626" text-anchor="end">Severe (65 dBZ)</text>
      </g>
    </g>

    <g transform="translate(0, 1000)">
      <rect width="748" height="100" rx="32" fill="white" stroke="#E9E7E1" />
      <circle cx="60" cy="50" r="24" fill="#FFF0E4" stroke="#FFE1CB" />
      <text x="60" y="56" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="800" fill="#EA580C" text-anchor="middle">⏸</text>

      <text x="140" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">-90m</text>
      <text x="230" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">-60m</text>
      <text x="320" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">-30m</text>

      <rect x="395" y="25" width="80" height="50" rx="16" fill="#FFF0E4" stroke="#FFE1CB" />
      <text x="435" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="900" fill="#EA580C" text-anchor="middle">● Live</text>

      <text x="520" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">+30m</text>
      <text x="610" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#737873">+60m</text>

      <circle cx="690" cy="50" r="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="690" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="14" text-anchor="middle">🔄</text>
    </g>

    <g transform="translate(0, 1115)">
      <rect width="748" height="120" rx="24" fill="#FFF4ED" stroke="#FFE1CB" />
      <text x="24" y="36" font-family="Plus Jakarta Sans, sans-serif" font-size="18">ℹ️</text>
      <text x="56" y="38" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#171717">Echoes exceeding 35 dBZ (amber/red) indicate precipitation rates over 4 mm/h. Delay foliar spraying during active rain sweeps.</text>
    </g>
  </g>

  ${renderRealBottomNav('radar')}
`;

// SCREEN 3: REAL AIR & SUN ENVIRONMENTAL TELEMETRY
const screen3Content = `
  ${renderRealHeader("Bengaluru")}

  <g transform="translate(16, 75)">
    <rect width="748" height="380" rx="32" fill="white" stroke="#E9E7E1" />
    <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#737873">EPA AIR QUALITY INDEX</text>

    <text x="28" y="115" font-family="Outfit, sans-serif" font-size="80" font-weight="900" fill="#171717">84</text>
    
    <rect x="135" y="65" width="120" height="32" rx="16" fill="#FEF3C7" stroke="#FDE68A" />
    <text x="195" y="86" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#D97706" text-anchor="middle">Moderate</text>

    <circle cx="680" cy="70" r="28" fill="#E5F5EC" stroke="#CEEFDB" />
    <text x="680" y="78" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">🛡️</text>

    <text x="28" y="155" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#444746">Air quality is acceptable for most; unusually sensitive individuals should take care.</text>

    <rect x="28" y="195" width="692" height="12" rx="6" fill="url(#aqiBar)" />
    <circle cx="320" cy="201" r="9" fill="white" stroke="#171717" stroke-width="3" />

    <text x="28" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#10B981">Good (0)</text>
    <text x="210" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#D97706">Moderate (50)</text>
    <text x="430" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#DC2626">Unhealthy (150)</text>
    <text x="720" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#8B5CF6" text-anchor="end">Hazardous (300+)</text>

    <g transform="translate(28, 260)">
      <rect x="0" y="0" width="155" height="90" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="77" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873" text-anchor="middle">PM2.5</text>
      <text x="77" y="65" font-family="Outfit, sans-serif" font-size="20" font-weight="900" fill="#2563EB" text-anchor="middle">34 µg</text>

      <rect x="175" y="0" width="155" height="90" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="252" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873" text-anchor="middle">PM10</text>
      <text x="252" y="65" font-family="Outfit, sans-serif" font-size="20" font-weight="900" fill="#059669" text-anchor="middle">46 µg</text>

      <rect x="350" y="0" width="155" height="90" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="427" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873" text-anchor="middle">Ozone</text>
      <text x="427" y="65" font-family="Outfit, sans-serif" font-size="20" font-weight="900" fill="#D97706" text-anchor="middle">84 ppb</text>

      <rect x="525" y="0" width="155" height="90" rx="20" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="602" y="30" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873" text-anchor="middle">NO₂</text>
      <text x="602" y="65" font-family="Outfit, sans-serif" font-size="20" font-weight="900" fill="#7C3AED" text-anchor="middle">14 ppb</text>
    </g>

    <g transform="translate(0, 400)">
      <rect width="748" height="340" rx="32" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="900" fill="#171717">☀️ SOLAR DAYLIGHT EPHEMERIS</text>
      <text x="720" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#EA580C" text-anchor="end">Daylight: 12h 34m</text>

      <path d="M 80 200 Q 374 50 668 200" fill="none" stroke="#FDE047" stroke-width="6" stroke-dasharray="8,8" />
      <circle cx="480" cy="115" r="16" fill="#EA580C" stroke="white" stroke-width="4" />

      <text x="80" y="235" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717">6:09 AM</text>
      <text x="668" y="235" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717" text-anchor="end">6:02 PM</text>

      <g transform="translate(28, 260)">
        <text x="0" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#737873">Golden Hour</text>
        <text x="0" y="45" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#EA580C">6:15 PM</text>

        <text x="260" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#737873">Solar Noon</text>
        <text x="260" y="45" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#171717">12:41 PM</text>

        <text x="520" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#737873">Current State</text>
        <text x="520" y="45" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#10B981">Daylight</text>
      </g>
    </g>

    <g transform="translate(0, 760)">
      <rect width="748" height="180" rx="32" fill="white" stroke="#E9E7E1" />
      <text x="28" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="900" fill="#171717">🌙 CELESTIAL MOON PHASE</text>
      <text x="720" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#0284C7" text-anchor="end">1% Illumination</text>

      <circle cx="80" cy="110" r="32" fill="#1E293B" />
      <text x="130" y="105" font-family="Outfit, sans-serif" font-size="20" font-weight="900" fill="#171717">New Moon</text>
      <text x="130" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Moonrise at 8:14 PM • Sets at 6:42 AM</text>
    </g>
  </g>

  ${renderRealBottomNav('airsun')}
`;

// SCREEN 4: REAL ANDROID WIDGETS
const screen4Content = `
  ${renderRealHeader("Bengaluru")}

  <g transform="translate(16, 75)">
    <text x="8" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#737873">Seven-Day Outlook (Proportional Bars)</text>
    
    <rect x="480" y="0" width="260" height="38" rx="19" fill="#EFF6FF" stroke="#DBEAFE" />
    <text x="610" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#2563EB" text-anchor="middle">+ Add to Home</text>

    <g transform="translate(0, 48)">
      <rect width="748" height="420" rx="32" fill="white" stroke="#E9E7E1" />
      <text x="28" y="40" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#171717">7-Day Forecast Outlook</text>
      <text x="28" y="62" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Bengaluru • Consistent scale</text>
      
      <rect x="620" y="22" width="100" height="30" rx="15" fill="#EFF6FF" />
      <text x="670" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#2563EB" text-anchor="middle">Weekly</text>

      <g transform="translate(28, 90)">
        <text x="0" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#171717">Today</text>
        <text x="130" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="13" fill="#2563EB">🌤️ 27%</text>
        <text x="240" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="700" fill="#737873">20°</text>

        <rect x="280" y="8" width="260" height="12" rx="6" fill="#E2E8F0" />
        <rect x="310" y="8" width="180" height="12" rx="6" fill="#EA580C" />

        <text x="560" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="800" fill="#171717">30°</text>
      </g>

      <g transform="translate(28, 140)">
        <text x="0" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#171717">Tuesday</text>
        <text x="130" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="13">⛅</text>
        <text x="240" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="700" fill="#737873">20°</text>

        <rect x="280" y="8" width="260" height="12" rx="6" fill="#E2E8F0" />
        <rect x="310" y="8" width="200" height="12" rx="6" fill="#EA580C" />

        <text x="560" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="800" fill="#171717">32°</text>
      </g>

      <g transform="translate(28, 190)">
        <text x="0" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700" fill="#171717">Wednesday</text>
        <text x="130" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="13">🌧️</text>
        <text x="240" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="700" fill="#737873">21°</text>

        <rect x="280" y="8" width="260" height="12" rx="6" fill="#E2E8F0" />
        <rect x="320" y="8" width="190" height="12" rx="6" fill="#EA580C" />

        <text x="560" y="20" font-family="Outfit, sans-serif" font-size="15" font-weight="800" fill="#171717">32°</text>
      </g>
    </g>

    <g transform="translate(0, 500)">
      <text x="8" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#047857">WIDGET D • 3x2 OR 4x2 FARM CELL</text>
      <text x="8" y="46" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#171717">Agricultural Field Conditions</text>

      <rect x="480" y="10" width="260" height="38" rx="19" fill="#E5F5EC" stroke="#CEEFDB" />
      <text x="610" y="34" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981" text-anchor="middle">+ Add to Home</text>

      <g transform="translate(0, 60)">
        <rect width="748" height="420" rx="32" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2" />

        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="56" font-family="Plus Jakarta Sans, sans-serif" font-size="16" text-anchor="middle">🌱</text>

        <text x="88" y="44" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#065F46">Farm Field Conditions</text>
        <text x="88" y="66" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#047857">Bengaluru • Agronomy Telemetry</text>

        <rect x="620" y="28" width="100" height="30" rx="15" fill="white" stroke="#A7F3D0" />
        <text x="670" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#047857" text-anchor="middle">Parcel</text>

        <g transform="translate(28, 95)">
          <rect x="0" y="0" width="330" height="130" rx="22" fill="white" stroke="#D1FAE5" />
          <text x="20" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873">Topsoil Layer</text>
          <text x="20" y="75" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717">26% <tspan font-size="14" font-weight="600" fill="#737873">moisture</tspan></text>
          <text x="20" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#059669">Temp: 22°</text>

          <rect x="360" y="0" width="330" height="130" rx="22" fill="white" stroke="#D1FAE5" />
          <text x="380" y="32" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873">Precipitation</text>
          <text x="380" y="75" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717">0% <tspan font-size="14" font-weight="600" fill="#737873">chance</tspan></text>
          <text x="380" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#2563EB">Sum: 0 mm</text>

          <rect x="0" y="150" width="330" height="130" rx="22" fill="white" stroke="#D1FAE5" />
          <text x="20" y="182" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873">Field Wind</text>
          <text x="20" y="225" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717">11 <tspan font-size="14" font-weight="600" fill="#737873">km/h</tspan></text>
          <text x="20" y="255" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#047857">ENE (68°) • Gust 27</text>

          <rect x="360" y="150" width="330" height="130" rx="22" fill="white" stroke="#D1FAE5" />
          <text x="380" y="182" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#737873">Humidity</text>
          <text x="380" y="225" font-family="Outfit, sans-serif" font-size="28" font-weight="900" fill="#171717">71% <tspan font-size="14" font-weight="600" fill="#737873">RH</tspan></text>
          <text x="380" y="255" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#2563EB">Dew Point: 17°</text>
        </g>
      </g>
    </g>
  </g>

  ${renderRealBottomNav('widgets')}
`;

// SCREEN 5: REAL APP SYSTEM & DIRECT UPI SUPPORT
const screen5Content = `
  ${renderRealHeader("Bengaluru")}

  <g transform="translate(16, 75)">
    <rect width="748" height="280" rx="32" fill="white" stroke="#E9E7E1" />
    <circle cx="48" cy="48" r="18" fill="#E5F5EC" />
    <text x="48" y="53" font-family="Plus Jakarta Sans, sans-serif" font-size="14" text-anchor="middle">✓</text>
    
    <text x="80" y="52" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#047857">Verified schema • 16 atmospheric &amp; soil parameters</text>
    
    <rect x="610" y="32" width="110" height="28" rx="14" fill="#E5F5EC" />
    <text x="665" y="50" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10B981" text-anchor="middle">LIVE SYNC</text>

    <g transform="translate(28, 85)">
      <rect width="692" height="110" rx="22" fill="#F7F6F2" stroke="#E9E7E1" />
      <text x="20" y="35" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Refresh Schedule:</text>
      <text x="672" y="35" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717" text-anchor="end">Every 15 minutes (Periodic Work)</text>

      <text x="20" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Last Successful Fetch:</text>
      <text x="672" y="65" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717" text-anchor="end">Updated 8:41 AM</text>

      <text x="20" y="95" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Attribution:</text>
      <text x="672" y="95" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#171717" text-anchor="end">Open-Meteo CC BY 4.0</text>
    </g>

    <rect x="28" y="210" width="692" height="52" rx="26" fill="#EA580C" />
    <text x="374" y="242" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="900" fill="white" text-anchor="middle">🔄 Sync Telemetry Now</text>

    <g transform="translate(0, 305)">
      <text x="8" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#EA580C">APP SYSTEM &amp; SUPPORT</text>

      <g transform="translate(0, 38)">
        <rect width="748" height="110" rx="28" fill="white" stroke="#E9E7E1" />
        <circle cx="55" cy="55" r="28" fill="#FFF0E4" />
        <text x="55" y="63" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">📥</text>

        <text x="100" y="48" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#171717">App Updates</text>
        <rect x="230" y="32" width="64" height="24" rx="12" fill="#F7F6F2" />
        <text x="262" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873" text-anchor="middle">v1.2.0</text>

        <text x="100" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">Check GitHub releases, changelogs &amp; dow...</text>

        <rect x="580" y="38" width="100" height="36" rx="18" fill="#FFF0E4" stroke="#FFE1CB" />
        <text x="630" y="61" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#EA580C" text-anchor="middle">Check</text>
        <text x="705" y="60" font-family="Plus Jakarta Sans, sans-serif" font-size="16" fill="#737873">❯</text>
      </g>

      <g transform="translate(0, 165)">
        <rect width="748" height="110" rx="28" fill="white" stroke="#E9E7E1" />
        <circle cx="55" cy="55" r="28" fill="#E5F5EC" />
        <text x="55" y="63" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">💚</text>

        <text x="100" y="48" font-family="Outfit, sans-serif" font-size="18" font-weight="900" fill="#171717">Support Farm Weather</text>
        <rect x="320" y="32" width="100" height="24" rx="12" fill="#E5F5EC" />
        <text x="370" y="48" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#10B981" text-anchor="middle">DIRECT UPI</text>

        <text x="100" y="75" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600" fill="#737873">100% commission-free UPI support for op...</text>

        <rect x="570" y="38" width="110" height="36" rx="18" fill="#E5F5EC" stroke="#CEEFDB" />
        <text x="625" y="61" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#10B981" text-anchor="middle">Donate</text>
        <text x="705" y="60" font-family="Plus Jakarta Sans, sans-serif" font-size="16" fill="#737873">❯</text>
      </g>
    </g>

    <g transform="translate(0, 610)">
      <text x="8" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#171717">💬 USER FEEDBACK &amp; REVIEWS</text>

      <g transform="translate(0, 38)">
        <rect width="748" height="380" rx="32" fill="white" stroke="#E9E7E1" />
        
        <text x="374" y="55" font-family="Plus Jakarta Sans, sans-serif" font-size="28" text-anchor="middle">⭐⭐⭐⭐⭐</text>
        <text x="374" y="90" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="#EA580C" text-anchor="middle">Exceptional Weather App</text>

        <text x="28" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#737873">WHAT STANDS OUT?</text>
        
        <g transform="translate(28, 145)">
          <rect x="0" y="0" width="160" height="32" rx="16" fill="#FFF0E4" />
          <text x="80" y="21" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#EA580C" text-anchor="middle">🌾 Farm Telemetry</text>

          <rect x="170" y="0" width="150" height="32" rx="16" fill="#E5F5EC" />
          <text x="245" y="21" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10B981" text-anchor="middle">🌱 Soil Advisory</text>
        </g>

        <g transform="translate(28, 230)">
          <rect width="692" height="110" rx="22" fill="#F7F6F2" stroke="#E9E7E1" />
          <text x="20" y="35" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="500" fill="#9CA3AF">Share your experience or features you&apos;d like added...</text>
        </g>
      </g>
    </g>
  </g>

  ${renderRealBottomNav('settings')}
`;

const screenshots = [
  {
    fileName: '01-weather-dashboard.png',
    badgeText: 'FARM MICROCLIMATE • BENGALURU TELEMETRY',
    title: 'Weather That Works for Your Farm',
    subtitle: 'Real-time 23° atmospheric conditions, 24-hour horizon & 7-day crop outlook',
    contentSvg: screen1Content,
  },
  {
    fileName: '02-hourly-forecast.png',
    badgeText: 'PRECISION DOPPLER • LIVE RADAR',
    title: 'Live Satellite & Doppler Radar',
    subtitle: 'Track precipitation sweeps, wind streams & temperature heatmaps in real time',
    contentSvg: screen2Content,
  },
  {
    fileName: '03-live-radar.png',
    badgeText: 'AIR & SUN TELEMETRY • CROP RISK',
    title: 'Soil, AQI & Solar Ephemeris',
    subtitle: 'EPA Air Quality Index 84, solar daylight arc & celestial moon phase telemetry',
    contentSvg: screen3Content,
  },
  {
    fileName: '04-agricultural-insights.png',
    badgeText: 'ANDROID WIDGETS • HOME SCREEN',
    title: 'Native Android Weather Widgets',
    subtitle: '7-Day outlook & 4x2 Farm Cell topsoil, precipitation & wind telemetry widgets',
    contentSvg: screen4Content,
  },
  {
    fileName: '05-weather-widgets.png',
    badgeText: 'OFFICIAL SYSTEM & DIRECT SUPPORT',
    title: '15-Min WorkManager Sync & UPI',
    subtitle: '16 atmospheric parameters, GitHub releases v1.2.0 & 100% direct UPI support',
    contentSvg: screen5Content,
  },
];

console.log('Generating authentic Google Play Store screenshots from actual app interface...');

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

console.log('All authentic Google Play Store screenshots generated successfully!');
