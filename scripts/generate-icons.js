import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';

function renderSvgToPng(svgPath, outputPath, width) {
  const svg = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  // Ensure target directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Generated ${outputPath} (${width}x${width})`);
}

async function main() {
  const svgPath = path.resolve('public/assets/weather_app_logo.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.error('SVG source not found:', svgPath);
    process.exit(1);
  }

  console.log('Generating PWA icons...');
  renderSvgToPng(svgPath, 'public/pwa-192x192.png', 192);
  renderSvgToPng(svgPath, 'public/pwa-512x512.png', 512);
  renderSvgToPng(svgPath, 'public/pwa-maskable-512x512.png', 512);
  renderSvgToPng(svgPath, 'public/apple-touch-icon.png', 180);
  renderSvgToPng(svgPath, 'public/favicon-32x32.png', 32);
  renderSvgToPng(svgPath, 'public/favicon-16x16.png', 16);
  renderSvgToPng(svgPath, 'public/android-chrome-192x192.png', 192);
  renderSvgToPng(svgPath, 'public/android-chrome-512x512.png', 512);
  
  console.log('Generating Android native launcher icons...');
  // Android launcher icon sizes (mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192)
  const androidMipmaps = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const m of androidMipmaps) {
    const resDir = path.resolve(`android/app/src/main/res/${m.dir}`);
    renderSvgToPng(svgPath, path.join(resDir, 'ic_launcher.png'), m.size);
    renderSvgToPng(svgPath, path.join(resDir, 'ic_launcher_round.png'), m.size);
    renderSvgToPng(svgPath, path.join(resDir, 'ic_launcher_foreground.png'), m.fgSize);
  }

  // Also replace drawable splash screens if needed
  const drawableDirs = [
    'drawable',
    'drawable-port-mdpi',
    'drawable-port-hdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
  ];
  for (const d of drawableDirs) {
    const resDir = path.resolve(`android/app/src/main/res/${d}`);
    renderSvgToPng(svgPath, path.join(resDir, 'splash.png'), 512);
  }

  console.log('All icons generated successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
