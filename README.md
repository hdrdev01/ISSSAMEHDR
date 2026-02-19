# Image to JPEG Converter

A modern, single-page web application that converts images to JPEG format with adjustable quality settings. All processing happens client-side in the browser - no server uploads required.

## Features

- **Drag & Drop Upload**: Simply drag and drop your image files or click to browse
- **Multiple Format Support**: Supports PNG, WebP, GIF, BMP, and HEIC (browser-dependent)
- **Live Preview**: See both original and converted images side-by-side
- **Quality Control**: Adjust JPEG quality from 10-100% with a smooth slider (default: 80%)
- **File Size Comparison**: Real-time display of original vs. converted file sizes
- **Download Flow**: Easy one-click download of converted images
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Privacy-First**: All conversions happen in your browser - no data is uploaded

## Usage

1. Open `index.html` in any modern web browser
2. Drag and drop an image or click "Select Image" to browse
3. Adjust the quality slider to your preference (default: 80%)
4. Review the file size reduction and preview
5. Click "Download JPEG" to save your converted image

## Technical Details

- **Client-side Processing**: Uses HTML5 Canvas API for image conversion
- **No Dependencies**: Pure HTML, CSS, and JavaScript - no frameworks required
- **File Size Limit**: 50MB maximum for optimal performance
- **Background Handling**: Transparent images are converted with a white background

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- FileReader API
- Blob/URL APIs

## Notes

- Animated GIFs: Only the first frame will be converted to JPEG
- HEIC Support: Depends on browser capabilities (Safari/iOS have native support)
- Image Quality: Balance file size and visual quality using the slider
