const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HERO_IMAGE = './public/heroo.png';
const PRODUCT_IMAGES_DIR = './public/images';
const OUTPUT_DIR = './public/optimized';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Ensure output directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get file size in KB
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

// Optimize hero image
async function optimizeHeroImage() {
  log('\n🖼️  Optimizing hero image...', colors.bright);

  const outputPath = path.join(OUTPUT_DIR, 'hero');
  ensureDir(outputPath);

  if (!fs.existsSync(HERO_IMAGE)) {
    log(`⚠️  Hero image not found at ${HERO_IMAGE}`, colors.yellow);
    return;
  }

  const originalSize = getFileSizeKB(HERO_IMAGE);
  log(`   Original size: ${originalSize} KB`, colors.blue);

  // Create multiple sizes for responsive images
  const sizes = [
    { width: 1920, suffix: '-xl', quality: 80 },
    { width: 1280, suffix: '-lg', quality: 80 },
    { width: 768, suffix: '-md', quality: 75 },
    { width: 640, suffix: '-sm', quality: 75 },
  ];

  for (const { width, suffix, quality } of sizes) {
    // WebP version
    const webpPath = path.join(outputPath, `hero${suffix}.webp`);
    await sharp(HERO_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(webpPath);

    const webpSize = getFileSizeKB(webpPath);

    // JPEG fallback
    const jpgPath = path.join(outputPath, `hero${suffix}.jpg`);
    await sharp(HERO_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: quality + 5, progressive: true })
      .toFile(jpgPath);

    const jpgSize = getFileSizeKB(jpgPath);

    log(`   ✅ Created hero${suffix} (${width}px): WebP ${webpSize}KB, JPEG ${jpgSize}KB`, colors.green);
  }

  log('✨ Hero image optimization complete!', colors.green);
}

// Optimize product images
async function optimizeProductImages() {
  log('\n🛍️  Optimizing product images...', colors.bright);

  const outputPath = path.join(OUTPUT_DIR, 'products');
  ensureDir(outputPath);

  if (!fs.existsSync(PRODUCT_IMAGES_DIR)) {
    log(`⚠️  Product images directory not found at ${PRODUCT_IMAGES_DIR}`, colors.yellow);
    return;
  }

  const files = fs.readdirSync(PRODUCT_IMAGES_DIR)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  if (files.length === 0) {
    log('   No images found to optimize', colors.yellow);
    return;
  }

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of files) {
    const inputPath = path.join(PRODUCT_IMAGES_DIR, file);
    const name = path.parse(file).name;

    const originalSize = parseFloat(getFileSizeKB(inputPath));
    totalOriginalSize += originalSize;

    try {
      // Create 800x800 WebP (for display)
      const webpPath = path.join(outputPath, `${name}.webp`);
      await sharp(inputPath)
        .resize(800, 800, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toFile(webpPath);

      const webpSize = parseFloat(getFileSizeKB(webpPath));

      // Create 800x800 JPEG fallback
      const jpgPath = path.join(outputPath, `${name}.jpg`);
      await sharp(inputPath)
        .resize(800, 800, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(jpgPath);

      const jpgSize = parseFloat(getFileSizeKB(jpgPath));

      // Create thumbnail (400x400)
      const thumbPath = path.join(outputPath, `${name}-thumb.webp`);
      await sharp(inputPath)
        .resize(400, 400, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      const thumbSize = parseFloat(getFileSizeKB(thumbPath));
      totalOptimizedSize += webpSize;

      const reduction = ((1 - webpSize / originalSize) * 100).toFixed(0);
      log(`   ✅ ${file}:`, colors.green);
      log(`      Original: ${originalSize.toFixed(2)}KB → WebP: ${webpSize.toFixed(2)}KB (${reduction}% reduction)`, colors.blue);
      log(`      JPEG: ${jpgSize.toFixed(2)}KB, Thumbnail: ${thumbSize.toFixed(2)}KB`, colors.blue);

    } catch (error) {
      log(`   ❌ Error processing ${file}: ${error.message}`, colors.red);
    }
  }

  const totalReduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(0);
  log(`\n📊 Total: ${totalOriginalSize.toFixed(2)}KB → ${totalOptimizedSize.toFixed(2)}KB (${totalReduction}% reduction)`, colors.bright);
  log('✨ Product images optimization complete!', colors.green);
}

// Generate usage statistics
async function generateStats() {
  log('\n📈 Optimization Statistics:', colors.bright);

  const heroPath = path.join(OUTPUT_DIR, 'hero');
  const productsPath = path.join(OUTPUT_DIR, 'products');

  if (fs.existsSync(heroPath)) {
    const heroFiles = fs.readdirSync(heroPath);
    log(`   Hero images: ${heroFiles.length} files created`, colors.blue);
  }

  if (fs.existsSync(productsPath)) {
    const productFiles = fs.readdirSync(productsPath);
    log(`   Product images: ${productFiles.length} files created`, colors.blue);
  }
}

// Main execution
(async () => {
  try {
    log('\n' + '='.repeat(60), colors.bright);
    log('  🚀 MARZOUQI-SHOP IMAGE OPTIMIZATION', colors.bright);
    log('='.repeat(60), colors.bright);

    ensureDir(OUTPUT_DIR);

    await optimizeHeroImage();
    await optimizeProductImages();
    await generateStats();

    log('\n' + '='.repeat(60), colors.bright);
    log('🎉 All images optimized successfully!', colors.green);
    log('='.repeat(60), colors.bright);

    log('\n📁 Optimized images saved to: ' + OUTPUT_DIR, colors.yellow);
    log('\n⚠️  Next steps:', colors.yellow);
    log('   1. Review optimized images in /public/optimized/', colors.reset);
    log('   2. Update image paths in your components', colors.reset);
    log('   3. Replace old images with optimized versions', colors.reset);
    log('   4. Test the site to ensure images load correctly', colors.reset);
    log('   5. Run Lighthouse audit to verify improvements\n', colors.reset);

  } catch (error) {
    log('\n❌ Error during optimization:', colors.red);
    log(error.message, colors.red);
    if (error.stack) {
      log('\nStack trace:', colors.red);
      log(error.stack, colors.reset);
    }
    process.exit(1);
  }
})();
