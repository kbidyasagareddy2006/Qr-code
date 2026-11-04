import QRCode from 'qrcode';
import { QRCustomization, DotPattern, EyePattern } from '../types/qr';

// Built-in vector icon SVG strings converted to Data URLs
export const PRESET_LOGOS: Record<string, { label: string; svg: string }> = {
  link: {
    label: 'Link',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  },
  wifi: {
    label: 'Wi-Fi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>`,
  },
  whatsapp: {
    label: 'WhatsApp',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  },
  instagram: {
    label: 'Instagram',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  },
  youtube: {
    label: 'YouTube',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg>`,
  },
  phone: {
    label: 'Phone',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  },
  email: {
    label: 'Email',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  },
  mapPin: {
    label: 'Location',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  },
  star: {
    label: 'Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  shop: {
    label: 'Store',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
  },
};

export function getLogoDataUrl(presetKey: string): string | undefined {
  const item = PRESET_LOGOS[presetKey];
  if (!item) return undefined;
  return `data:image/svg+xml;utf8,${encodeURIComponent(item.svg)}`;
}

// Calculate color contrast ratio (WCAG 2.1)
export function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 21; // fallback max
  }
}

// Helper to determine if a module belongs to one of the 3 corner finder patterns
function isFinderPattern(r: number, c: number, moduleCount: number): boolean {
  // Top-left: rows 0..6, cols 0..6
  if (r <= 6 && c <= 6) return true;
  // Top-right: rows 0..6, cols (count-7)..count-1
  if (r <= 6 && c >= moduleCount - 7) return true;
  // Bottom-left: rows (count-7)..count-1, cols 0..6
  if (r >= moduleCount - 7 && c <= 6) return true;
  return false;
}

// Helper to check if row/col is in center area reserved for logo
function isCenterLogoArea(
  r: number,
  c: number,
  moduleCount: number,
  logoFraction: number
): boolean {
  if (logoFraction <= 0) return false;
  const center = moduleCount / 2;
  const halfSpan = (moduleCount * logoFraction) / 2;
  return (
    r >= center - halfSpan &&
    r <= center + halfSpan &&
    c >= center - halfSpan &&
    c <= center + halfSpan
  );
}

// Draw a single finder pattern (7x7) on canvas
function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  cellSize: number,
  pattern: EyePattern,
  outerColor: string,
  innerColor: string
) {
  const size = cellSize * 7;
  const innerSize = cellSize * 3;
  const innerOffset = cellSize * 2;

  ctx.save();

  // Outer frame (7x7 with 5x5 cutout)
  ctx.fillStyle = outerColor;

  if (pattern === 'circle') {
    // Outer circle
    ctx.beginPath();
    ctx.arc(startX + size / 2, startY + size / 2, size / 2, 0, Math.PI * 2);
    ctx.arc(startX + size / 2, startY + size / 2, size / 2 - cellSize, 0, Math.PI * 2, true);
    ctx.fill();

    // Center pupil
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.arc(
      startX + size / 2,
      startY + size / 2,
      innerSize / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else if (pattern === 'rounded') {
    const outerRadius = cellSize * 2.2;
    const innerRadius = cellSize * 1.2;

    // Draw outer thick rounded stroke
    ctx.beginPath();
    roundRect(ctx, startX, startY, size, size, outerRadius);
    roundRect(
      ctx,
      startX + cellSize,
      startY + cellSize,
      size - cellSize * 2,
      size - cellSize * 2,
      Math.max(2, outerRadius - cellSize),
      true
    );
    ctx.fill();

    // Inner pupil
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    roundRect(
      ctx,
      startX + innerOffset,
      startY + innerOffset,
      innerSize,
      innerSize,
      innerRadius
    );
    ctx.fill();
  } else if (pattern === 'leaf') {
    // Leaf / teardrop shape: one outer corner fully rounded, others slight
    ctx.beginPath();
    ctx.moveTo(startX + size, startY);
    ctx.arcTo(startX + size, startY + size, startX, startY + size, cellSize * 1.5);
    ctx.arcTo(startX, startY + size, startX, startY, cellSize * 1.5);
    ctx.arcTo(startX, startY, startX + size, startY, cellSize * 3);
    ctx.closePath();

    // Cutout inner
    ctx.rect(startX + size - cellSize, startY + cellSize, -(size - cellSize * 2), size - cellSize * 2);
    ctx.fill();

    // Leaf pupil
    ctx.fillStyle = innerColor;
    ctx.beginPath();
    roundRect(
      ctx,
      startX + innerOffset,
      startY + innerOffset,
      innerSize,
      innerSize,
      cellSize
    );
    ctx.fill();
  } else {
    // Standard square
    ctx.fillRect(startX, startY, size, cellSize);
    ctx.fillRect(startX, startY + size - cellSize, size, cellSize);
    ctx.fillRect(startX, startY + cellSize, cellSize, size - cellSize * 2);
    ctx.fillRect(startX + size - cellSize, startY + cellSize, cellSize, size - cellSize * 2);

    // Inner square pupil
    ctx.fillStyle = innerColor;
    ctx.fillRect(startX + innerOffset, startY + innerOffset, innerSize, innerSize);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  anticlockwise = false
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.moveTo(x + radius, y);
  if (!anticlockwise) {
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
  } else {
    ctx.arcTo(x, y, x, y + height, radius);
    ctx.arcTo(x, y + height, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y, radius);
    ctx.arcTo(x + width, y, x, y, radius);
  }
}

// Draw a single data dot based on DotPattern
function drawDataDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pattern: DotPattern,
  color: string
) {
  ctx.fillStyle = color;

  switch (pattern) {
    case 'dots': {
      const radius = size * 0.44;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const pad = size * 0.06;
      ctx.beginPath();
      roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.28);
      ctx.fill();
      break;
    }
    case 'diamond': {
      const pad = size * 0.1;
      const midX = x + size / 2;
      const midY = y + size / 2;
      ctx.beginPath();
      ctx.moveTo(midX, y + pad);
      ctx.lineTo(x + size - pad, midY);
      ctx.lineTo(midX, y + size - pad);
      ctx.lineTo(x + pad, midY);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'classy': {
      const pad = size * 0.05;
      ctx.beginPath();
      roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.4);
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x, y, size, size);
      break;
    }
  }
}

export interface RenderQROptions {
  text: string;
  customization: QRCustomization;
  canvas: HTMLCanvasElement;
  size?: number; // target px (e.g. 1024)
}

/**
 * Main rendering function: draws the custom QR code onto any canvas
 */
export async function renderQRCodeToCanvas({
  text,
  customization,
  canvas,
  size = 1024,
}: RenderQROptions): Promise<void> {
  const {
    foregroundColor = '#0f172a',
    backgroundColor = '#ffffff',
    transparentBackground = false,
    eyeOuterColor = foregroundColor,
    eyeInnerColor = foregroundColor,
    dotPattern = 'square',
    eyePattern = 'square',
    errorCorrection = 'M',
    logoUrl,
    logoPreset,
    logoSize = 0.22,
    logoPadding = 6,
    logoShape = 'circle',
    title,
    subtitle,
    frameStyle = 'none',
    frameColor = '#0f172a',
    frameTextColor = '#ffffff',
  } = customization;

  // Resolve logo source
  let resolvedLogoUrl = logoUrl;
  if (!resolvedLogoUrl && logoPreset && PRESET_LOGOS[logoPreset]) {
    resolvedLogoUrl = getLogoDataUrl(logoPreset);
  }

  // If a logo is present, boost error correction to Q or H if currently L or M
  let effectiveEC = errorCorrection;
  if (resolvedLogoUrl && (effectiveEC === 'L' || effectiveEC === 'M')) {
    effectiveEC = 'H';
  }

  // Generate QR module matrix
  const qr = QRCode.create(text || 'https://vektorqr.app', {
    errorCorrectionLevel: effectiveEC,
  });

  const moduleCount = qr.modules.size;
  const data = qr.modules.data; // Uint8Array: 1 for dark, 0 for light

  // Determine layout dimensions
  const hasFrame = frameStyle !== 'none' && (Boolean(title) || Boolean(subtitle));
  let topMargin = 0;
  let bottomMargin = 0;
  let qrAreaSize = size;

  if (hasFrame) {
    if (frameStyle === 'simple-bottom') {
      bottomMargin = Math.round(size * 0.16);
      qrAreaSize = size - bottomMargin;
    } else if (frameStyle === 'badge') {
      topMargin = Math.round(size * 0.14);
      qrAreaSize = size - topMargin;
    } else if (frameStyle === 'card') {
      topMargin = Math.round(size * 0.12);
      bottomMargin = Math.round(size * 0.14);
      qrAreaSize = size - topMargin - bottomMargin;
    } else if (frameStyle === 'balloon') {
      bottomMargin = Math.round(size * 0.18);
      qrAreaSize = size - bottomMargin;
    }
  }

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Background
  if (!transparentBackground) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Calculate QR grid padding (quiet zone)
  const quietModules = 4;
  const totalGridModules = moduleCount + quietModules * 2;
  const cellSize = qrAreaSize / totalGridModules;
  const qrOffsetX = cellSize * quietModules;
  const qrOffsetY = topMargin + cellSize * quietModules;

  // 1. Draw Data Modules (skipping finder patterns & logo zone)
  const effectiveLogoFraction = resolvedLogoUrl ? Math.max(0.18, Math.min(0.32, logoSize)) : 0;

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const isDark = data[r * moduleCount + c] === 1;

      // Skip finder pattern areas (will be drawn cleanly with custom eyes)
      if (isFinderPattern(r, c, moduleCount)) continue;

      // Skip center logo area if logo exists
      if (effectiveLogoFraction > 0 && isCenterLogoArea(r, c, moduleCount, effectiveLogoFraction)) {
        continue;
      }

      if (isDark) {
        const x = qrOffsetX + c * cellSize;
        const y = qrOffsetY + r * cellSize;
        drawDataDot(ctx, x, y, cellSize, dotPattern, foregroundColor);
      }
    }
  }

  // 2. Draw 3 Corner Finder Patterns
  // Top-Left (0, 0)
  drawFinderPattern(
    ctx,
    qrOffsetX,
    qrOffsetY,
    cellSize,
    eyePattern,
    eyeOuterColor,
    eyeInnerColor
  );

  // Top-Right (0, moduleCount - 7)
  drawFinderPattern(
    ctx,
    qrOffsetX + (moduleCount - 7) * cellSize,
    qrOffsetY,
    cellSize,
    eyePattern,
    eyeOuterColor,
    eyeInnerColor
  );

  // Bottom-Left (moduleCount - 7, 0)
  drawFinderPattern(
    ctx,
    qrOffsetX,
    qrOffsetY + (moduleCount - 7) * cellSize,
    cellSize,
    eyePattern,
    eyeOuterColor,
    eyeInnerColor
  );

  // 3. Draw Center Logo if provided
  if (resolvedLogoUrl) {
    const logoPx = qrAreaSize * effectiveLogoFraction;
    const centerX = size / 2;
    const centerY = topMargin + qrAreaSize / 2;
    const logoX = centerX - logoPx / 2;
    const logoY = centerY - logoPx / 2;

    // Draw background shield behind logo for contrast
    ctx.save();
    ctx.fillStyle = backgroundColor || '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = Math.round(size * 0.015);
    ctx.shadowOffsetY = Math.round(size * 0.005);

    const shieldPad = logoPadding * (size / 512);
    const shieldX = logoX - shieldPad;
    const shieldY = logoY - shieldPad;
    const shieldSize = logoPx + shieldPad * 2;

    if (logoShape === 'circle') {
      ctx.beginPath();
      ctx.arc(centerX, centerY, shieldSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (logoShape === 'rounded') {
      ctx.beginPath();
      roundRect(ctx, shieldX, shieldY, shieldSize, shieldSize, shieldSize * 0.25);
      ctx.fill();
    } else {
      ctx.fillRect(shieldX, shieldY, shieldSize, shieldSize);
    }
    ctx.restore();

    // Load and render logo image
    try {
      const img = await loadImage(resolvedLogoUrl);
      ctx.save();
      if (logoShape === 'circle') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoPx / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (logoShape === 'rounded') {
        ctx.beginPath();
        roundRect(ctx, logoX, logoY, logoPx, logoPx, logoPx * 0.2);
        ctx.clip();
      }
      ctx.drawImage(img, logoX, logoY, logoPx, logoPx);
      ctx.restore();
    } catch {
      // If logo image fails, fallback gracefully without corrupting canvas
    }
  }

  // 4. Draw Frame / Title / Captions if selected
  if (hasFrame) {
    ctx.save();
    const framePrimary = frameColor || foregroundColor;
    const textPrimary = frameTextColor || '#ffffff';

    if (frameStyle === 'simple-bottom') {
      const bannerHeight = bottomMargin - Math.round(size * 0.04);
      const bannerY = size - bannerHeight - Math.round(size * 0.02);
      const bannerPadX = Math.round(size * 0.06);

      ctx.fillStyle = framePrimary;
      ctx.beginPath();
      roundRect(
        ctx,
        bannerPadX,
        bannerY,
        size - bannerPadX * 2,
        bannerHeight,
        Math.round(bannerHeight * 0.25)
      );
      ctx.fill();

      // Text
      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = title || 'SCAN ME';
      const fontSize = Math.round(bannerHeight * 0.42);
      ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(label, size / 2, bannerY + bannerHeight / 2);
    } else if (frameStyle === 'badge') {
      const badgeHeight = topMargin - Math.round(size * 0.03);
      const badgeY = Math.round(size * 0.02);
      const badgeWidth = Math.min(size * 0.7, (title?.length || 7) * (badgeHeight * 0.6) + 40);
      const badgeX = (size - badgeWidth) / 2;

      ctx.fillStyle = framePrimary;
      ctx.beginPath();
      roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2);
      ctx.fill();

      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = title || 'SCAN ME';
      const fontSize = Math.round(badgeHeight * 0.45);
      ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(label, size / 2, badgeY + badgeHeight / 2);
    } else if (frameStyle === 'card') {
      // Header text
      if (title) {
        ctx.fillStyle = foregroundColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.round(topMargin * 0.4);
        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(title, size / 2, topMargin / 2);
      }
      // Footer text
      if (subtitle) {
        ctx.fillStyle = framePrimary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.round(bottomMargin * 0.32);
        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(subtitle, size / 2, size - bottomMargin / 2);
      }
    }
    ctx.restore();
  }
}

// Image Loader helper
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generate a standalone, lossless SVG string for vector export
 */
export function generateQRCodeSVG({
  text,
  customization,
}: {
  text: string;
  customization: QRCustomization;
}): string {
  const {
    foregroundColor = '#0f172a',
    backgroundColor = '#ffffff',
    transparentBackground = false,
    eyeOuterColor = foregroundColor,
    eyeInnerColor = foregroundColor,
    dotPattern = 'square',
    eyePattern = 'square',
    errorCorrection = 'M',
    logoPreset,
    logoUrl,
    logoSize = 0.22,
  } = customization;

  const resolvedLogoUrl = logoUrl || (logoPreset ? getLogoDataUrl(logoPreset) : undefined);
  let effectiveEC = errorCorrection;
  if (resolvedLogoUrl && (effectiveEC === 'L' || effectiveEC === 'M')) {
    effectiveEC = 'H';
  }

  const qr = QRCode.create(text || 'https://vektorqr.app', {
    errorCorrectionLevel: effectiveEC,
  });

  const moduleCount = qr.modules.size;
  const data = qr.modules.data;
  const quietZone = 4;
  const total = moduleCount + quietZone * 2;
  const viewBoxSize = total * 10;
  const cellSize = 10;

  let svgElements: string[] = [];

  // Background
  if (!transparentBackground) {
    svgElements.push(
      `<rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${backgroundColor}" />`
    );
  }

  const effectiveLogoFraction = resolvedLogoUrl ? Math.max(0.18, Math.min(0.32, logoSize)) : 0;

  // Data modules
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isFinderPattern(r, c, moduleCount)) continue;
      if (effectiveLogoFraction > 0 && isCenterLogoArea(r, c, moduleCount, effectiveLogoFraction)) {
        continue;
      }

      if (data[r * moduleCount + c] === 1) {
        const x = (c + quietZone) * cellSize;
        const y = (r + quietZone) * cellSize;

        if (dotPattern === 'dots') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          svgElements.push(
            `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.44}" fill="${foregroundColor}" />`
          );
        } else if (dotPattern === 'rounded') {
          svgElements.push(
            `<rect x="${x + 0.6}" y="${y + 0.6}" width="${cellSize - 1.2}" height="${cellSize - 1.2}" rx="${cellSize * 0.28}" fill="${foregroundColor}" />`
          );
        } else if (dotPattern === 'diamond') {
          const midX = x + cellSize / 2;
          const midY = y + cellSize / 2;
          svgElements.push(
            `<polygon points="${midX},${y + 1} ${x + cellSize - 1},${midY} ${midX},${y + cellSize - 1} ${x + 1},${midY}" fill="${foregroundColor}" />`
          );
        } else {
          svgElements.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${foregroundColor}" />`
          );
        }
      }
    }
  }

  // Helper for finder patterns in SVG
  const drawSVGEye = (col: number, row: number) => {
    const startX = (col + quietZone) * cellSize;
    const startY = (row + quietZone) * cellSize;
    const eyeSize = cellSize * 7;
    const pupilSize = cellSize * 3;
    const pupilOffset = cellSize * 2;

    if (eyePattern === 'circle') {
      const cx = startX + eyeSize / 2;
      const cy = startY + eyeSize / 2;
      svgElements.push(
        `<circle cx="${cx}" cy="${cy}" r="${eyeSize / 2}" fill="none" stroke="${eyeOuterColor}" stroke-width="${cellSize}" />`
      );
      svgElements.push(
        `<circle cx="${cx}" cy="${cy}" r="${pupilSize / 2}" fill="${eyeInnerColor}" />`
      );
    } else if (eyePattern === 'rounded') {
      svgElements.push(
        `<rect x="${startX + cellSize / 2}" y="${startY + cellSize / 2}" width="${eyeSize - cellSize}" height="${eyeSize - cellSize}" rx="${cellSize * 1.5}" fill="none" stroke="${eyeOuterColor}" stroke-width="${cellSize}" />`
      );
      svgElements.push(
        `<rect x="${startX + pupilOffset}" y="${startY + pupilOffset}" width="${pupilSize}" height="${pupilSize}" rx="${cellSize * 0.8}" fill="${eyeInnerColor}" />`
      );
    } else {
      // Standard square
      svgElements.push(
        `<rect x="${startX + cellSize / 2}" y="${startY + cellSize / 2}" width="${eyeSize - cellSize}" height="${eyeSize - cellSize}" fill="none" stroke="${eyeOuterColor}" stroke-width="${cellSize}" />`
      );
      svgElements.push(
        `<rect x="${startX + pupilOffset}" y="${startY + pupilOffset}" width="${pupilSize}" height="${pupilSize}" fill="${eyeInnerColor}" />`
      );
    }
  };

  // Top-left, top-right, bottom-left
  drawSVGEye(0, 0);
  drawSVGEye(moduleCount - 7, 0);
  drawSVGEye(0, moduleCount - 7);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%">${svgElements.join('')}</svg>`;
}
