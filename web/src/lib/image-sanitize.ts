"use client";

/**
 * Re-codifica la imagen en un <canvas> para eliminar metadatos EXIF/GPS
 * y asegurar dimensiones web antes de subirla al servidor.
 */
export async function stripImageExif(file: File, maxDim = 1920): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const outType =
      file.type === "image/png"
        ? "image/png"
        : file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outType, outType === "image/png" ? undefined : 0.88),
    );
    if (!blob) return file;

    const ext =
      outType === "image/png" ? ".png" : outType === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, ext), {
      type: outType,
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Optimiza y comprime una imagen en el navegador (máx. 800px)
 * preservando estrictamente el canal alfa transparente en PNG/WebP.
 */
export async function optimizeImageToDataUrl(file: File, maxDim = 800): Promise<string> {
  if (typeof window === "undefined") return "";
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const hasAlphaFormat = file.type === "image/png" || file.type === "image/webp";
    if (hasAlphaFormat) {
      const webp = canvas.toDataURL("image/webp", 0.85);
      if (webp.startsWith("data:image/webp")) return webp;
      return canvas.toDataURL("image/png");
    }
    const webp = canvas.toDataURL("image/webp", 0.82);
    if (webp.startsWith("data:image/webp")) return webp;
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
