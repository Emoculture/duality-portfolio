import { useEffect, useRef, useState } from "react";

const SOURCE = "/archive/user-000.png";
const OUTPUT_WIDTH = 240;

/** Deterministic, local rendering: the source image and saved progress are never modified. */
function drawPortrait(
  canvas: HTMLCanvasElement,
  source: HTMLImageElement,
  stage: number,
  square: boolean,
) {
  const level = Math.max(1, Math.min(6, stage - 1));
  const width = OUTPUT_WIDTH;
  const height = square ? OUTPUT_WIDTH : 180;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const small = document.createElement("canvas");
  small.width = [0, 160, 120, 100, 84, 72, 64][level];
  small.height = Math.round((small.width * height) / width);
  const pixels = small.getContext("2d", { willReadFrequently: true });
  if (!pixels) throw new Error("Canvas is unavailable");

  // Match the original object-fit: cover, including its vertical focal point.
  const targetRatio = width / height;
  const sourceRatio = source.naturalWidth / source.naturalHeight;
  const cropWidth =
    sourceRatio > targetRatio
      ? source.naturalHeight * targetRatio
      : source.naturalWidth;
  const cropHeight =
    sourceRatio > targetRatio
      ? source.naturalHeight
      : source.naturalWidth / targetRatio;
  const cropX = (source.naturalWidth - cropWidth) / 2;
  const cropY = (source.naturalHeight - cropHeight) * (square ? 0.5 : 0.43);
  pixels.drawImage(
    source,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    small.width,
    small.height,
  );

  const image = pixels.getImageData(0, 0, small.width, small.height);
  const tint = [0, 0.035, 0.18, 0.3, 0.43, 0.58, 0.7][level];
  for (let i = 0; i < image.data.length; i += 4) {
    const gray = Math.min(
      255,
      (image.data[i] * 0.299 +
        image.data[i + 1] * 0.587 +
        image.data[i + 2] * 0.114) *
        (1 + level * 0.02),
    );
    image.data[i] = gray * (1 - 0.55 * tint);
    image.data[i + 1] = gray * (1 - 0.06 * tint);
    image.data[i + 2] = gray * (1 - 0.46 * tint);
  }
  pixels.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(small, 0, 0, width, height);

  // Copy small strips from a stable frame; unlike a flashing glitch this is
  // deterministic, static, and respects reduced-motion without special timing.
  const base = document.createElement("canvas");
  base.width = width;
  base.height = height;
  const baseContext = base.getContext("2d");
  if (!baseContext) throw new Error("Canvas is unavailable");
  baseContext.drawImage(canvas, 0, 0);
  const random = (n: number) => {
    const x = Math.sin(n * 127.1 + level * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const bands = [0, 2, 4, 6, 8, 10, 14][level];
  for (let i = 0; i < bands; i++) {
    const y = Math.floor(random(i + 1) * height);
    const bandHeight = Math.max(
      2,
      Math.floor(((2 + random(i + 70) * level) * height) / 180),
    );
    const shift = Math.round((random(i + 50) - 0.5) * level * 6);
    context.drawImage(
      base,
      0,
      y,
      width,
      Math.min(bandHeight, height - y),
      shift,
      y,
      width,
      Math.min(bandHeight, height - y),
    );
  }

  if (level >= 5) {
    // Enlarge and displace a real section of the original face before
    // layering the eye fragments, preserving the identity of the source.
    context.globalAlpha = level === 6 ? 0.9 : 0.55;
    context.drawImage(
      base,
      width * 0.3,
      height * 0.3,
      width * 0.38,
      height * 0.22,
      width * 0.24,
      height * 0.3,
      width * 0.52,
      height * 0.24,
    );
    context.globalAlpha = 1;
  }
  if (level >= 3) {
    // These fragments come directly from the source frame, not a new face.
    const eyeWidth = width * 0.18;
    const eyeHeight = height * 0.16;
    const eyeY = height * (square ? 0.35 : 0.3);
    const eyeX = width * 0.31;
    const fragments = [
      [0.59, 0.35, 1.05, 1],
      [0.07, 0.54, 1.05, 1.08],
      [0.72, 0.53, 0.95, 0.95],
      [0.42, 0.61, 1.15, 1.05],
      [0.11, 0.2, 0.95, 0.95],
    ];
    const count = [0, 0, 0, 1, 2, 3, 5][level];
    for (let i = 0; i < count; i++) {
      const [x, y, sx, sy] = fragments[i];
      context.globalAlpha = level < 5 ? 0.78 : 0.94;
      context.drawImage(
        base,
        eyeX,
        eyeY,
        eyeWidth,
        eyeHeight,
        x * width,
        y * height,
        eyeWidth * sx,
        eyeHeight * sy,
      );
    }
    context.globalAlpha = 1;
    if (level >= 4) {
      const mouthY = height * 0.68;
      context.drawImage(
        base,
        width * 0.28,
        mouthY,
        width * 0.38,
        height * 0.1,
        width * 0.34,
        height * (level >= 6 ? 0.77 : 0.7),
        width * 0.44,
        height * 0.12,
      );
    }
  }

  const flecks = [0, 12, 40, 70, 110, 160, 230][level];
  for (let i = 0; i < flecks; i++) {
    const x = Math.floor(random(i + 100) * width);
    const y = Math.floor(random(i + 800) * height);
    const size = level < 3 ? 1 : Math.max(2, Math.round(level * 0.6));
    context.fillStyle =
      i % 4 === 0
        ? `rgba(184, 220, 173, ${0.06 + level * 0.025})`
        : `rgba(5, 20, 6, ${0.05 + level * 0.018})`;
    context.fillRect(x, y, size * (i % 7 === 0 ? 3 : 1), size);
  }
  if (level >= 5) {
    context.strokeStyle = `rgba(2, 13, 3, ${level === 6 ? 0.5 : 0.25})`;
    context.lineWidth = level === 6 ? 2 : 1;
    for (let x = 20; x < width; x += 43) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 25; y < height; y += 43) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  }
}

export default function ArchivePortrait({
  stage,
  className,
  alt,
  square = false,
}: {
  stage: number;
  className?: string;
  alt: string;
  square?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (stage <= 1) return;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled || !canvas.current) return;
      try {
        drawPortrait(canvas.current, image, stage, square);
        canvas.current.dataset.avatarReady = "true";
      } catch {
        setFailed(true);
      }
    };
    image.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    image.src = SOURCE;
    return () => {
      cancelled = true;
    };
  }, [stage, square]);

  if (stage <= 1 || failed)
    return (
      <img
        className={className}
        src={SOURCE}
        alt={alt}
        data-avatar-stage={stage}
      />
    );
  return (
    <canvas
      key={stage}
      ref={canvas}
      className={className}
      role="img"
      aria-label={alt}
      data-avatar-stage={stage}
    />
  );
}
