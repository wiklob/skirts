import { parseGIF, decompressFrames } from 'gifuct-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractFrames() {
  const gifPath = path.join(__dirname, '../public/skirt_gif2.gif');
  const outputDir = path.join(__dirname, '../public/frames');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read GIF file
  const gifData = fs.readFileSync(gifPath);
  const gif = parseGIF(gifData);
  const frames = decompressFrames(gif, true);

  console.log(`Found ${frames.length} frames`);

  // Create canvas for rendering
  const { createCanvas } = await import('canvas');
  const canvas = createCanvas(frames[0].dims.width, frames[0].dims.height);
  const ctx = canvas.getContext('2d');

  // Extract each frame
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);

    const buffer = canvas.toBuffer('image/png');
    const framePath = path.join(outputDir, `frame_${String(i).padStart(4, '0')}.png`);
    fs.writeFileSync(framePath, buffer);
    console.log(`Extracted frame ${i + 1}/${frames.length}`);
  }

  console.log('Frame extraction complete!');
  console.log(`Frames saved to: ${outputDir}`);
}

extractFrames().catch(console.error);
