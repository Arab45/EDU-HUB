const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_DIMENSION = 2048;
const WEBP_QUALITY = 0.82;

export async function compressImageFile(file) {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) return file;

  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to compress this image.");

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Unable to compress this image."));
        },
        "image/webp",
        WEBP_QUALITY
      );
    });

    if (compressedBlob.size >= file.size) return file;

    const compressedName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([compressedBlob], compressedName, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    image.close();
  }
}
