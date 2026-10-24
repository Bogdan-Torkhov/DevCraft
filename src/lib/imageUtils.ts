/**
 * Helper utility to client-side resize and compress image files
 * into compact, high-quality WebP or JPEG Data URLs.
 * This guarantees zero server storage cost, instant loading, and fast SQLite persistence.
 */
export async function compressImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file (PNG, JPEG, WebP, GIF)"));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("File size exceeds 15MB. Please choose a smaller image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is unavailable"));
            return;
          }

          // Center-crop to 1:1 aspect ratio
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);

          // Attempt WebP at 0.85 quality; fallback to JPEG
          let dataUrl = canvas.toDataURL("image/webp", 0.85);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
