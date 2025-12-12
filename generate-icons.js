import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source SVG file
const svgPath = path.join(__dirname, 'src-tauri', 'icons', 'icon.svg');
const outputDir = path.join(__dirname, 'src-tauri', 'icons');

if (!fs.existsSync(svgPath)) {
  console.error(`Error: SVG file not found at ${svgPath}`);
  process.exit(1);
}

const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Tauri requires:
// - 32x32.png
// - 128x128.png
// - 128x128@2x.png (256x256)
// - icon.icns (Mac - skipping for Windows-focused task but usually needed)
// - icon.ico (Windows)
// - icon.png (512x512)

const configs = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 512, name: 'icon.png' }, // Main icon
];

console.log('Generating PNG icons from SVG...');

const generatedPngs = [];

// Generate PNGs
for (const config of configs) {
  try {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: config.size,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    const outputPath = path.join(outputDir, config.name);
    
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`✓ Generated ${config.name}`);
    generatedPngs.push({ size: config.size, path: outputPath });
  } catch (error) {
    console.error(`✗ Failed to generate ${config.name}:`, error.message);
  }
}

// Generate ICO
console.log('Generating icon.ico...');
try {
  // Use the 32 and 256 sizes for ICO
  const icoInputs = generatedPngs
    .filter(p => [32, 256].includes(p.size))
    .map(p => p.path);
    
  if (icoInputs.length > 0) {
    const icoBuffer = await pngToIco(icoInputs);
    fs.writeFileSync(path.join(outputDir, 'icon.ico'), icoBuffer);
    console.log('✓ Generated icon.ico');
  } else {
    console.warn('Skipping ICO generation: missing source PNGs');
  }
} catch (error) {
  console.error('✗ Failed to generate icon.ico:', error.message);
}

console.log('\n✓ Icon generation complete!');
