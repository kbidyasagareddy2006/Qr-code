import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Sparkles,
  Layout,
  Type,
  Palette,
  Sliders,
  Check,
  RefreshCw,
  QrCode,
  ArrowLeft,
  FileImage,
} from 'lucide-react';
import { loadImage } from '../utils/qrRenderer';
import { ActiveTab } from './Header';

interface PosterDesignerProps {
  initialQrDataUrl?: string;
  initialTitle?: string;
  setActiveTab: (tab: ActiveTab) => void;
}

interface PosterTheme {
  id: string;
  name: string;
  bgType: 'gradient' | 'solid';
  bgColor: string;
  bgGradient?: string[];
  textColor: string;
  accentColor: string;
  cardBg: string;
}

const POSTER_THEMES: PosterTheme[] = [
  {
    id: 'clean-white',
    name: 'Minimal Clean',
    bgType: 'solid',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#4f46e5',
    cardBg: '#f8fafc',
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Dark',
    bgType: 'solid',
    bgColor: '#090d16',
    textColor: '#f8fafc',
    accentColor: '#38bdf8',
    cardBg: '#1e293b',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    bgType: 'gradient',
    bgColor: '#312e81',
    bgGradient: ['#312e81', '#1e1b4b'],
    textColor: '#ffffff',
    accentColor: '#818cf8',
    cardBg: '#ffffff',
  },
  {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    bgType: 'gradient',
    bgColor: '#9f1239',
    bgGradient: ['#9f1239', '#831843'],
    textColor: '#ffffff',
    accentColor: '#fb7185',
    cardBg: '#ffffff',
  },
  {
    id: 'emerald-botanical',
    name: 'Emerald Forest',
    bgType: 'gradient',
    bgColor: '#064e3b',
    bgGradient: ['#065f46', '#022c22'],
    textColor: '#ffffff',
    accentColor: '#34d399',
    cardBg: '#ffffff',
  },
  {
    id: 'warm-amber',
    name: 'Artisan Cafe',
    bgType: 'solid',
    bgColor: '#fdfbf7',
    textColor: '#451a03',
    accentColor: '#d97706',
    cardBg: '#ffffff',
  },
];

export const PosterDesigner: React.FC<PosterDesignerProps> = ({
  initialQrDataUrl,
  initialTitle,
  setActiveTab,
}) => {
  // Poster Content State
  const [heading, setHeading] = useState(initialTitle ? `SCAN FOR ${initialTitle.toUpperCase()}` : 'SCAN TO CONNECT');
  const [subtitle, setSubtitle] = useState('Point your smartphone camera at the QR code below');
  const [ctaText, setCtaText] = useState('POINT PHONE CAMERA TO SCAN');
  const [footerText, setFooterText] = useState('Instant Access · No App Download Required');
  const [businessName, setBusinessName] = useState('VEKTOR STUDIO');

  // Styling & Theme
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>(POSTER_THEMES[0]);
  const [qrScale, setQrScale] = useState<number>(0.55); // fraction of poster width
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(initialQrDataUrl);
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);
  const [cardShadow, setCardShadow] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // If no initial QR code provided, generate a default one
  useEffect(() => {
    if (!qrDataUrl) {
      // Create fallback dummy canvas
      const off = document.createElement('canvas');
      off.width = 400;
      off.height = 400;
      const ctx = off.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sample QR Code', 200, 200);
      }
      setQrDataUrl(off.toDataURL());
    }
  }, [qrDataUrl]);

  // Handle uploaded logo / brand icon
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle uploaded QR code image if user wants to replace it
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setQrDataUrl(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Render high-res poster onto canvas
  useEffect(() => {
    drawPoster();
  }, [
    heading,
    subtitle,
    ctaText,
    footerText,
    businessName,
    selectedTheme,
    qrScale,
    qrDataUrl,
    logoImage,
    cardShadow,
  ]);

  const drawPoster = async (targetWidth = 1200, targetHeight = 1600) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = targetWidth;
    const h = targetHeight;

    // 1. Draw Background
    if (selectedTheme.bgType === 'gradient' && selectedTheme.bgGradient) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, selectedTheme.bgGradient[0]);
      grad.addColorStop(1, selectedTheme.bgGradient[1]);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = selectedTheme.bgColor;
    }
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative hairline border
    ctx.strokeStyle = selectedTheme.textColor === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    let currentY = 120;

    // 2. Business Brand Tag / Top Logo
    if (logoImage) {
      try {
        const logo = await loadImage(logoImage);
        const logoSize = 110;
        ctx.drawImage(logo, (w - logoSize) / 2, currentY, logoSize, logoSize);
        currentY += logoSize + 40;
      } catch {}
    } else if (businessName) {
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText(businessName.toUpperCase(), w / 2, currentY);
      currentY += 60;
    }

    // 3. Main Heading
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '-0.5px';
    ctx.fillText(heading, w / 2, currentY);
    currentY += 45;

    // 4. Subtitle
    ctx.fillStyle = selectedTheme.textColor === '#ffffff' ? '#cbd5e1' : '#64748b';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, w / 2, currentY);
    currentY += 80;

    // 5. QR Code Card Container
    const qrSize = Math.round(w * qrScale);
    const cardPadding = 50;
    const cardWidth = qrSize + cardPadding * 2;
    const cardHeight = qrSize + cardPadding * 2;
    const cardX = (w - cardWidth) / 2;
    const cardY = currentY;

    // Card shadow
    if (cardShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = selectedTheme.cardBg;
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = selectedTheme.cardBg;
      roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
      ctx.fill();
    }

    // Card border
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
    ctx.stroke();

    // Draw the QR Code image
    if (qrDataUrl) {
      try {
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, cardX + cardPadding, cardY + cardPadding, qrSize, qrSize);
      } catch (e) {
        console.warn('Could not load QR image on poster:', e);
      }
    }

    currentY = cardY + cardHeight + 80;

    // 6. CTA Badge
    if (ctaText) {
      const ctaBtnW = Math.min(cardWidth, 680);
      const ctaBtnH = 80;
      const ctaBtnX = (w - ctaBtnW) / 2;

      ctx.fillStyle = selectedTheme.accentColor;
      roundRect(ctx, ctaBtnX, currentY, ctaBtnW, ctaBtnH, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '1px';
      ctx.fillText(ctaText, w / 2, currentY + 50);

      currentY += ctaBtnH + 60;
    }

    // 7. Footer text
    if (footerText) {
      ctx.fillStyle = selectedTheme.textColor === '#ffffff' ? '#94a3b8' : '#94a3b8';
      ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(footerText, w / 2, h - 80);
    }
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };

  const handleDownloadPoster = async () => {
    setIsExporting(true);
    // Create print-ready ultra high-res canvas (1800 x 2400)
    const exportCanvas = document.createElement('canvas');
    const oldRef = canvasRef.current;
    canvasRef.current = exportCanvas;

    await drawPoster(1800, 2400);

    const link = document.createElement('a');
    link.download = `poster_${heading.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    // Restore preview ref
    canvasRef.current = oldRef;
    drawPoster(1200, 1600);
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Poster Studio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Turn your QR code into professional table tents, window signs, or event flyers ready for print.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('generator')}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generator</span>
        </button>
      </div>

      {/* 2-Column Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Theme Preset Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1. Poster Style Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {POSTER_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border border-slate-300 shrink-0"
                      style={{
                        background:
                          theme.bgType === 'gradient' && theme.bgGradient
                            ? `linear-gradient(to bottom, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`
                            : theme.bgColor,
                      }}
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Copy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2. Headlines & Copy
            </label>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Brand / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. CAFE HORIZON"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Main Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. CONNECT TO WI-FI"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Point your phone camera to join"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Call-to-Action Button Label</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. SCAN WITH PHONE CAMERA"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Footer Disclaimer</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="e.g. Fast Free Access"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Sizing & Brand Uploads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Layout & Sizing
            </label>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>QR Code Size on Poster</span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {Math.round(qrScale * 100)}% width
                </span>
              </div>
              <input
                type="range"
                min="0.35"
                max="0.70"
                step="0.05"
                value={qrScale}
                onChange={(e) => setQrScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="truncate">Upload Brand Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                <QrCode className="w-4 h-4 text-slate-500" />
                <span className="truncate">Replace QR Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Preview & Export Station (6 cols) */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Poster Live Canvas
              </span>
              <span className="text-xs font-mono text-slate-400">1200 x 1600 px</span>
            </div>

            {/* Poster Canvas Preview */}
            <div className="w-full max-w-[360px] aspect-[3/4] bg-slate-100 rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'auto' }}
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPoster}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating High-Res Asset...' : 'Download Print-Ready Poster (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
