# 🖼️ Image Optimization Guide for Marzouqi-Shop

## 📊 Current Performance Issues

### Critical Problems Identified:
- **Hero Image (`/public/heroo.png`)**: 2.6MB - causing slow LCP (Largest Contentful Paint)
- **Product Images (`/public/images/`)**: 650KB - 2.4MB each - causing slow page loads
- **Total Impact**: Users wait 4+ seconds for initial page load

### Performance Goals:
- ✅ Hero image: < 200KB (92% reduction)
- ✅ Product images: < 100KB each (85-95% reduction)
- ✅ LCP improvement: From ~4s → ~1.5s
- ✅ Format: WebP with PNG/JPG fallback

---

## 🚀 Quick Start - Automated Optimization

### Prerequisites:
```bash
# Install Sharp (Node.js image processing)
npm install --save-dev sharp

# Or use online tools (no installation needed):
# - https://squoosh.app/
# - https://tinypng.com/
# - https://imagecompressor.com/
```

### Option 1: Automated Script (Recommended)

Create `scripts/optimize-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HERO_IMAGE = './public/heroo.png';
const PRODUCT_IMAGES_DIR = './public/images';
const OUTPUT_DIR = './public/optimized';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Optimize hero image
async function optimizeHeroImage() {
  console.log('🖼️  Optimizing hero image...');
  
  const outputPath = path.join(OUTPUT_DIR, 'hero');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Create multiple sizes for responsive images
  const sizes = [
    { width: 1920, suffix: '-xl' },
    { width: 1280, suffix: '-lg' },
    { width: 768, suffix: '-md' },
    { width: 640, suffix: '-sm' },
  ];

  for (const { width, suffix } of sizes) {
    // WebP version
    await sharp(HERO_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outputPath, `hero${suffix}.webp`));
    
    // JPEG fallback
    await sharp(HERO_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(outputPath, `hero${suffix}.jpg`));
    
    console.log(`  ✅ Created hero${suffix} (${width}px)`);
  }
  
  console.log('✨ Hero image optimization complete!\n');
}

// Optimize product images
async function optimizeProductImages() {
  console.log('🛍️  Optimizing product images...');
  
  const outputPath = path.join(OUTPUT_DIR, 'products');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const files = fs.readdirSync(PRODUCT_IMAGES_DIR)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of files) {
    const inputPath = path.join(PRODUCT_IMAGES_DIR, file);
    const name = path.parse(file).name;
    
    // Create 800x800 WebP (for display)
    await sharp(inputPath)
      .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 })
      .toFile(path.join(outputPath, `${name}.webp`));
    
    // Create 800x800 JPEG fallback
    await sharp(inputPath)
      .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(outputPath, `${name}.jpg`));
    
    // Create thumbnail (400x400)
    await sharp(inputPath)
      .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 75 })
      .toFile(path.join(outputPath, `${name}-thumb.webp`));
    
    console.log(`  ✅ Optimized ${file}`);
  }
  
  console.log('✨ Product images optimization complete!\n');
}

// Run optimization
(async () => {
  try {
    await optimizeHeroImage();
    await optimizeProductImages();
    
    console.log('🎉 All images optimized successfully!');
    console.log('\n📁 Optimized images saved to:', OUTPUT_DIR);
    console.log('\n⚠️  Next steps:');
    console.log('1. Review optimized images in /public/optimized/');
    console.log('2. Update image paths in your components');
    console.log('3. Replace old images with optimized versions');
    console.log('4. Test the site to ensure images load correctly');
  } catch (error) {
    console.error('❌ Error optimizing images:', error);
    process.exit(1);
  }
})();
```

Run the script:
```bash
node scripts/optimize-images.js
```

---

## 📝 Manual Optimization Steps

### For Hero Image (`/public/heroo.png`):

1. **Go to https://squoosh.app/**
2. Upload `heroo.png`
3. Settings:
   - Format: WebP
   - Quality: 80
   - Resize: 1920px width (maintain aspect ratio)
4. Download as `hero-xl.webp`
5. Repeat for sizes: 1280px, 768px, 640px
6. Create JPEG fallbacks at 85% quality

### For Product Images (`/public/images/`):

1. **Go to https://squoosh.app/**
2. Upload each product image
3. Settings:
   - Format: WebP
   - Quality: 80
   - Resize: 800x800px (contain)
4. Download with `.webp` extension
5. Create JPEG fallback at 85% quality

---

## 🔄 Update Components with Responsive Images

### Update Hero Image in `src/pages/home.tsx`:

Replace lines 46-56 with:

```tsx
{/* Background image with responsive sources */}
<picture>
  <source
    media="(min-width: 1280px)"
    srcSet="/optimized/hero/hero-xl.webp"
    type="image/webp"
  />
  <source
    media="(min-width: 768px)"
    srcSet="/optimized/hero/hero-lg.webp"
    type="image/webp"
  />
  <source
    media="(min-width: 640px)"
    srcSet="/optimized/hero/hero-md.webp"
    type="image/webp"
  />
  <source srcSet="/optimized/hero/hero-sm.webp" type="image/webp" />
  
  {/* Fallback for browsers that don't support WebP */}
  <source
    media="(min-width: 1280px)"
    srcSet="/optimized/hero/hero-xl.jpg"
    type="image/jpeg"
  />
  <source
    media="(min-width: 768px)"
    srcSet="/optimized/hero/hero-lg.jpg"
    type="image/jpeg"
  />
  <source
    media="(min-width: 640px)"
    srcSet="/optimized/hero/hero-md.jpg"
    type="image/jpeg"
  />
  <source srcSet="/optimized/hero/hero-sm.jpg" type="image/jpeg" />
  
  <img
    src="/optimized/hero/hero-lg.jpg"
    alt=""
    aria-hidden="true"
    fetchPriority="high"
    loading="eager"
    decoding="async"
    width={1920}
    height={1080}
    className="absolute inset-0 w-full h-full object-cover object-center"
  />
</picture>
```

### Create Image Component (`src/components/optimized-image.tsx`):

```tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  className = "",
}: OptimizedImageProps) {
  // Convert /images/shoe-1.png -> /optimized/products/shoe-1.webp
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp').replace('/images/', '/optimized/products/');
  const jpgSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.jpg').replace('/images/', '/optimized/products/');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={jpgSrc} type="image/jpeg" />
      <img
        src={jpgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
```

### Update Product Card to use OptimizedImage:

In `src/components/product-card.tsx`, replace the `<img>` tag with:

```tsx
<OptimizedImage
  src={product.imageUrl}
  alt={product.name}
  width={640}
  height={640}
  loading={index < 4 ? "eager" : "lazy"}
  fetchPriority={index < 2 ? "high" : "low"}
  className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
/>
```

---

## ✅ Testing & Validation

### 1. Visual Quality Check
- Open site in browser
- Compare optimized images with originals
- Ensure no visible quality loss

### 2. Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun --collect.url=http://localhost:5173
```

**Target Metrics:**
- LCP: < 2.5s (currently ~4s)
- FCP: < 1.8s
- Image size: < 200KB for hero, < 100KB per product

### 3. Browser Compatibility
Test in:
- ✅ Chrome/Edge (WebP supported)
- ✅ Firefox (WebP supported)
- ✅ Safari (WebP supported since v14)
- ✅ Mobile browsers

### 4. Check File Sizes

```bash
# Before optimization
du -sh public/heroo.png public/images/*

# After optimization
du -sh public/optimized/hero/* public/optimized/products/*
```

---

## 📐 Best Practices

### Image Dimensions:
- **Hero**: 1920x1080 max (use responsive sizes)
- **Product Cards**: 800x800 (square)
- **Product Detail**: 1200x1200
- **Thumbnails**: 400x400

### Quality Settings:
- **WebP**: 75-80% (best quality/size ratio)
- **JPEG**: 80-85%
- **PNG**: Use TinyPNG or similar compressor

### Format Selection:
- **Photos/Complex**: WebP (80% smaller than JPEG)
- **Simple Graphics**: WebP or PNG
- **Fallback**: JPEG (for old browsers)

### Loading Strategy:
- **Above-the-fold** (first 2 products, hero): `loading="eager"` + `fetchpriority="high"`
- **Below-the-fold**: `loading="lazy"` + `fetchpriority="low"`

---

## 🔍 Monitoring

### Add to `package.json`:
```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js",
    "check-image-sizes": "du -sh public/images/* public/heroo.png"
  }
}
```

### Performance Budget:
Add to CI/CD:
```yaml
# .github/workflows/performance.yml
- name: Check image sizes
  run: |
    MAX_SIZE=200000  # 200KB in bytes
    for img in public/images/*; do
      size=$(stat -f%z "$img")
      if [ $size -gt $MAX_SIZE ]; then
        echo "❌ $img is too large: ${size} bytes"
        exit 1
      fi
    done
```

---

## 📚 Additional Resources

- [WebP Browser Support](https://caniuse.com/webp)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Squoosh Image Optimizer](https://squoosh.app/)
- [Google's Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

## 🎯 Expected Results

After optimization:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Hero Image | 2.6MB | ~180KB | **93% reduction** |
| Product Image (avg) | 1.5MB | ~85KB | **94% reduction** |
| Total Page Load | ~15MB | ~2MB | **87% reduction** |
| LCP | ~4s | ~1.5s | **62% faster** |
| FCP | ~2s | ~0.8s | **60% faster** |

---

**Last Updated**: December 2024  
**Next Review**: After implementing optimizations