# Assets Folder Structure

This folder contains all static assets (images, icons, etc.) for the BidMaster application.

## Folder Structure

```
public/assets/
├── images/
│   ├── products/          # Product images (PNG, JPG, SVG)
│   │   ├── vintage-watch.png
│   │   ├── designer-handbag.png
│   │   ├── smartphone.png
│   │   ├── persian-rug.png
│   │   ├── gaming-laptop.png
│   │   └── camera-collection.png
│   └── avatars/          # User avatar images (PNG, JPG)
│       ├── sarah-johnson.png
│       ├── michael-chen.png
│       └── emily-davis.png
└── README.md
```

## How to Add Images

1. **Product Images**: Place product images in `images/products/` folder
   - Recommended format: PNG or JPG
   - Recommended size: 500x500px or larger
   - Naming: Use lowercase with hyphens (e.g., `vintage-watch.png`)

2. **Avatar Images**: Place user avatars in `images/avatars/` folder
   - Recommended format: PNG or JPG
   - Recommended size: 150x150px or larger
   - Naming: Use lowercase with hyphens (e.g., `sarah-johnson.png`)

## Usage in Code

Images are referenced using absolute paths starting from `/assets/`:

```javascript
// Product image
image: '/assets/images/products/vintage-watch.png'

// Avatar image
avatar: '/assets/images/avatars/sarah-johnson.png'
```

## Important Notes

- All images in `public/assets/` are served statically by Vite
- Images will be available at `/assets/images/...` in the browser
- No need to import images - just use the path string
- After adding images, restart the dev server if needed
- Images are copied to `dist/assets/` during build

## Image Requirements

- **Product Images**: 
  - Format: PNG, JPG, or SVG
  - Size: 500x500px minimum (larger is better for quality)
  - Aspect ratio: Square (1:1) recommended

- **Avatar Images**:
  - Format: PNG or JPG
  - Size: 150x150px minimum
  - Aspect ratio: Square (1:1) recommended

## Adding New Images

1. Save your image file in the appropriate folder
2. Update the path in `src/utils/sampleData.js` or your component
3. The image will be automatically available after saving

