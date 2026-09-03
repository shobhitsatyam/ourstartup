/**
 * Client-side high-quality image compressor for luxury jewelry products
 * - Resizes images to max 2000px on the longest side
 * - Converts large images to JPEG/WebP
 * - Targets file size <= 5MB
 * - Preserves fine jewelry detail and clarity
 */
export async function compressImage(file, options = {}) {
  const {
    maxDimension = 2000,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    quality = 0.88,
  } = options;

  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image for compression'));

      img.onload = async () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scaling to fit within maxDimension (2000px)
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        // Enable highest quality smoothing for jewelry textures and gemstones
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine best format (WebP or JPEG for superior compression)
        let outputMime = 'image/jpeg';
        let extension = 'jpg';

        if (file.type === 'image/webp') {
          outputMime = 'image/webp';
          extension = 'webp';
        } else if (file.type === 'image/png') {
          // Check if image has transparency; if so, WebP preserves it efficiently
          outputMime = 'image/webp';
          extension = 'webp';
        }

        const getBlob = (q) =>
          new Promise((res) => {
            canvas.toBlob(
              (blob) => res(blob),
              outputMime,
              q
            );
          });

        let blob = await getBlob(quality);

        // If still exceeds target maxSizeBytes (5MB), progressively step down quality
        if (blob && blob.size > maxSizeBytes) {
          blob = await getBlob(0.80);
        }
        if (blob && blob.size > maxSizeBytes) {
          blob = await getBlob(0.70);
        }

        if (!blob) {
          return resolve(file);
        }

        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const compressedFile = new File([blob], `${originalName}.${extension}`, {
          type: outputMime,
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an array of files in parallel
 */
export async function compressImages(files, options = {}) {
  return Promise.all(Array.from(files).map((file) => compressImage(file, options)));
}
