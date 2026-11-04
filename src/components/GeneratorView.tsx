import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Globe,
  FileText,
  Wifi,
  Contact,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  MapPin,
  Calendar,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Palette,
  Image as ImageIcon,
  Type,
  ShieldCheck,
  AlertTriangle,
  Upload,
  X,
  FileImage,
  BookmarkPlus,
  RefreshCw,
} from 'lucide-react';
import {
  QRType,
  QRFormData,
  QRCustomization,
  DotPattern,
  EyePattern,
  ErrorCorrectionLevel,
  HistoryRecord,
} from '../types/qr';
import { formatQRContent } from '../utils/qrEncoding';
import {
  renderQRCodeToCanvas,
  generateQRCodeSVG,
  getContrastRatio,
  PRESET_LOGOS,
} from '../utils/qrRenderer';
import { BUILTIN_PRESETS, saveHistoryRecord, saveCustomTemplate } from '../utils/storage';
import { ActiveTab } from './Header';

interface GeneratorViewProps {
  initialType?: QRType;
  initialData?: any;
  initialCustomization?: QRCustomization;
  onSendToPoster: (qrDataUrl: string, title: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

const TYPE_CONFIGS: {
  type: QRType;
  label: string;
  icon: React.ReactNode;
  hint: string;
}[] = [
  { type: 'url', label: 'Website URL', icon: <Globe className="w-4 h-4" />, hint: 'Link to any website or web page' },
  { type: 'text', label: 'Plain Text', icon: <FileText className="w-4 h-4" />, hint: 'Display notes, codes, or instructions' },
  { type: 'wifi', label: 'Wi-Fi Network', icon: <Wifi className="w-4 h-4" />, hint: 'Instant connection for smartphones' },
  { type: 'vcard', label: 'Digital vCard', icon: <Contact className="w-4 h-4" />, hint: 'Contact details saved to phonebook' },
  { type: 'phone', label: 'Phone Call', icon: <Phone className="w-4 h-4" />, hint: 'Direct phone number dialer' },
  { type: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, hint: 'Prefilled email to send' },
  { type: 'sms', label: 'SMS Message', icon: <MessageSquare className="w-4 h-4" />, hint: 'Direct SMS messaging' },
  { type: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, hint: 'WhatsApp chat link with custom message' },
  { type: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, hint: 'Profile handle or post link' },
  { type: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" />, hint: 'Page or profile address' },
  { type: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, hint: 'Channel, video, or playlist link' },
  { type: 'location', label: 'Google Maps', icon: <MapPin className="w-4 h-4" />, hint: 'GPS coordinates or address search' },
  { type: 'calendar', label: 'Calendar Event', icon: <Calendar className="w-4 h-4" />, hint: 'Event with start/end time and location' },
];

const COLOR_PALETTES = [
  { name: 'Slate Dark', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Royal Indigo', fg: '#3730a3', bg: '#eef2ff' },
  { name: 'Emerald', fg: '#065f46', bg: '#ecfdf5' },
  { name: 'Sunset Rose', fg: '#9f1239', bg: '#fff1f2' },
  { name: 'Ocean Cyan', fg: '#0369a1', bg: '#f0f9ff' },
  { name: 'Amber Bronze', fg: '#78350f', bg: '#fffbeb' },
  { name: 'Dark Mode', fg: '#f8fafc', bg: '#090d16' },
  { name: 'Obsidian Gold', fg: '#d97706', bg: '#18181b' },
];

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  initialType = 'url',
  initialData,
  initialCustomization,
  onSendToPoster,
  setActiveTab,
}) => {
  // 1. Form state
  const [selectedType, setSelectedType] = useState<QRType>(initialType);

  // Form fields per type
  const [urlData, setUrlData] = useState({ url: initialData?.url || 'https://vektorqr.app' });
  const [textData, setTextData] = useState({ text: initialData?.text || 'Scan to view details' });
  const [wifiData, setWifiData] = useState({
    ssid: initialData?.ssid || 'Guest_WiFi',
    password: initialData?.password || 'SecurePass2026',
    encryption: (initialData?.encryption || 'WPA') as 'WPA' | 'WEP' | 'nopass',
    hidden: initialData?.hidden || false,
  });
  const [vcardData, setVcardData] = useState({
    firstName: initialData?.firstName || 'Alex',
    lastName: initialData?.lastName || 'Morgan',
    organization: initialData?.organization || 'Apex Creative Studios',
    title: initialData?.title || 'Design Architect',
    phone: initialData?.phone || '+1 (555) 234-5678',
    cell: initialData?.cell || '',
    email: initialData?.email || 'alex@apexcreative.io',
    url: initialData?.url || 'https://apexcreative.io',
    street: initialData?.street || '100 Innovation Way',
    city: initialData?.city || 'San Francisco',
    state: initialData?.state || 'CA',
    zip: initialData?.zip || '94107',
    country: initialData?.country || 'USA',
    note: initialData?.note || 'Digital vCard created with VektorQR',
  });
  const [phoneData, setPhoneData] = useState({ phone: initialData?.phone || '+15559876543' });
  const [emailData, setEmailData] = useState({
    email: initialData?.email || 'hello@partner.com',
    subject: initialData?.subject || 'Product Inquiry',
    body: initialData?.body || 'Hello, I scanned your QR code and would like more details.',
  });
  const [smsData, setSmsData] = useState({
    phone: initialData?.phone || '+15559876543',
    message: initialData?.message || 'Hello! Checking in regarding the project.',
  });
  const [whatsAppData, setWhatsAppData] = useState({
    phone: initialData?.phone || '15551234567',
    message: initialData?.message || 'Hi there! I scanned your QR code on VektorQR.',
  });
  const [instagramData, setInstagramData] = useState({ usernameOrUrl: initialData?.usernameOrUrl || 'vektordesign' });
  const [facebookData, setFacebookData] = useState({ usernameOrUrl: initialData?.usernameOrUrl || 'vektordesign' });
  const [youtubeData, setYoutubeData] = useState({ usernameOrUrl: initialData?.usernameOrUrl || '@designstudios' });
  const [locationData, setLocationData] = useState({
    latitude: initialData?.latitude || '37.7749',
    longitude: initialData?.longitude || '-122.4194',
    query: initialData?.query || 'San Francisco, CA',
  });
  const [calendarData, setCalendarData] = useState({
    title: initialData?.title || 'Product Showcase 2026',
    location: initialData?.location || 'Design Center Main Hall',
    description: initialData?.description || 'Keynote presentation and networking reception.',
    startDate: initialData?.startDate || '2026-11-15T18:00',
    endDate: initialData?.endDate || '2026-11-15T21:00',
    allDay: initialData?.allDay || false,
  });

  // 2. Customization state
  const [customization, setCustomization] = useState<QRCustomization>(
    initialCustomization || {
      foregroundColor: '#0f172a',
      backgroundColor: '#ffffff',
      transparentBackground: false,
      dotPattern: 'rounded',
      eyePattern: 'rounded',
      errorCorrection: 'M',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'circle',
      frameStyle: 'none',
      frameColor: '#0f172a',
      frameTextColor: '#ffffff',
      title: 'SCAN ME',
    }
  );

  // Custom eye colors toggle
  const [customEyeColors, setCustomEyeColors] = useState(
    Boolean(customization.eyeOuterColor || customization.eyeInnerColor)
  );

  // Active customization accordion
  const [activeAccordion, setActiveAccordion] = useState<'style' | 'colors' | 'logo' | 'frame' | 'presets'>('style');

  // Preview & Export state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportResolution, setExportResolution] = useState<number>(1024);
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [scanTestResult, setScanTestResult] = useState<{ success: boolean; data?: string } | null>(null);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // Construct current form payload
  const currentFormData: QRFormData = (() => {
    switch (selectedType) {
      case 'url':
        return { type: 'url', data: urlData };
      case 'text':
        return { type: 'text', data: textData };
      case 'wifi':
        return { type: 'wifi', data: wifiData };
      case 'vcard':
        return { type: 'vcard', data: vcardData };
      case 'phone':
        return { type: 'phone', data: phoneData };
      case 'email':
        return { type: 'email', data: emailData };
      case 'sms':
        return { type: 'sms', data: smsData };
      case 'whatsapp':
        return { type: 'whatsapp', data: whatsAppData };
      case 'instagram':
        return { type: 'instagram', data: instagramData };
      case 'facebook':
        return { type: 'facebook', data: facebookData };
      case 'youtube':
        return { type: 'youtube', data: youtubeData };
      case 'location':
        return { type: 'location', data: locationData };
      case 'calendar':
        return { type: 'calendar', data: calendarData };
    }
  })();

  const { raw: rawQRContent, displayTitle } = formatQRContent(currentFormData);

  // Contrast ratio check
  const contrastRatio = getContrastRatio(
    customization.foregroundColor,
    customization.transparentBackground ? '#ffffff' : customization.backgroundColor
  );
  const isContrastGood = contrastRatio >= 3.0;

  // Redraw canvas whenever form data or customization changes
  useEffect(() => {
    if (!canvasRef.current) return;
    renderQRCodeToCanvas({
      text: rawQRContent,
      customization,
      canvas: canvasRef.current,
      size: 600, // display size
    }).catch(console.error);

    // Reset scan test when content alters
    setScanTestResult(null);
  }, [rawQRContent, customization]);

  // Test scan verification
  const handleTestScan = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (code) {
      setScanTestResult({ success: true, data: code.data });
    } else {
      setScanTestResult({ success: false });
    }
  };

  // Download high-resolution PNG
  const handleDownloadPNG = async () => {
    const offscreen = document.createElement('canvas');
    await renderQRCodeToCanvas({
      text: rawQRContent,
      customization,
      canvas: offscreen,
      size: exportResolution,
    });

    const dataUrl = offscreen.toDataURL('image/png');
    const filename = `qr_${selectedType}_${Date.now()}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    // Auto-save record to history
    saveHistoryRecord({
      id: 'gen_' + Date.now().toString(36),
      type: selectedType,
      title: displayTitle,
      rawContent: rawQRContent,
      previewUrl: canvasRef.current?.toDataURL('image/png') || '',
      customization,
      createdAt: Date.now(),
      isFavorite: false,
      source: 'generated',
    });
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const svgString = generateQRCodeSVG({
      text: rawQRContent,
      customization,
    });
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr_${selectedType}_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    // Save record to history
    saveHistoryRecord({
      id: 'gen_' + Date.now().toString(36),
      type: selectedType,
      title: displayTitle,
      rawContent: rawQRContent,
      previewUrl: canvasRef.current?.toDataURL('image/png') || '',
      customization,
      createdAt: Date.now(),
      isFavorite: false,
      source: 'generated',
    });
  };

  // Copy QR Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const offscreen = document.createElement('canvas');
      await renderQRCodeToCanvas({
        text: rawQRContent,
        customization,
        canvas: offscreen,
        size: 1024,
      });
      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Fallback: copy raw text if clipboard image item is restricted
          navigator.clipboard.writeText(rawQRContent);
          setCopiedRaw(true);
          setTimeout(() => setCopiedRaw(false), 2000);
        }
      });
    } catch {
      navigator.clipboard.writeText(rawQRContent);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  // Upload custom center logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = evt.target?.result as string;
      if (res) {
        setCustomization((prev) => ({
          ...prev,
          logoUrl: res,
          logoPreset: undefined,
          errorCorrection: prev.errorCorrection === 'L' || prev.errorCorrection === 'M' ? 'H' : prev.errorCorrection,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Send to Poster Studio
  const handleSendToPoster = () => {
    if (!canvasRef.current) return;
    const preview = canvasRef.current.toDataURL('image/png');
    onSendToPoster(preview, displayTitle);
    setActiveTab('poster');
  };

  // Save current design as template
  const handleSaveAsTemplate = () => {
    if (!templateNameInput.trim()) return;
    saveCustomTemplate(
      templateNameInput.trim(),
      `Custom preset with ${customization.dotPattern} dots and ${customization.eyePattern} eyes`,
      customization
    );
    setTemplateNameInput('');
    setShowSaveTemplateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Code Generator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose any data standard, customize styling with real-time contrast checking, and export lossless vector assets.
          </p>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Type Selector + Form + Customizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Type Selector Horizontal Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              1. Select QR Data Standard
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {TYPE_CONFIGS.map((t) => {
                const isSelected = selectedType === t.type;
                return (
                  <button
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {t.icon}
                    </div>
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Input Form for Selected Type */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {TYPE_CONFIGS.find((t) => t.type === selectedType)?.label} Details
                </h3>
                <p className="text-xs text-slate-500">
                  {TYPE_CONFIGS.find((t) => t.type === selectedType)?.hint}
                </p>
              </div>
            </div>

            {/* URL Form */}
            {selectedType === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Target URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={urlData.url}
                    onChange={(e) => setUrlData({ url: e.target.value })}
                    placeholder="https://yourwebsite.com/destination"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Plain Text Form */}
            {selectedType === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Content / Message</label>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {textData.text.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={textData.text}
                  onChange={(e) => setTextData({ text: e.target.value })}
                  placeholder="Enter any text, instructions, or serial code..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
                />
              </div>
            )}

            {/* Wi-Fi Form */}
            {selectedType === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      placeholder="MyHome_WiFi"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Network Password</label>
                    <input
                      type="text"
                      value={wifiData.password}
                      disabled={wifiData.encryption === 'nopass'}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder="Password"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Security Standard</label>
                    <select
                      value={wifiData.encryption}
                      onChange={(e) =>
                        setWifiData({
                          ...wifiData,
                          encryption: e.target.value as 'WPA' | 'WEP' | 'nopass',
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Open Network (No Password)</option>
                    </select>
                  </div>

                  <div className="pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wifiData.hidden}
                        onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs font-medium text-slate-700">Hidden Network</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* vCard Form */}
            {selectedType === 'vcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">First Name</label>
                    <input
                      type="text"
                      value={vcardData.firstName}
                      onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      value={vcardData.lastName}
                      onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Company / Organization</label>
                    <input
                      type="text"
                      value={vcardData.organization}
                      onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Job Title</label>
                    <input
                      type="text"
                      value={vcardData.title}
                      onChange={(e) => setVcardData({ ...vcardData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Phone</label>
                    <input
                      type="tel"
                      value={vcardData.phone}
                      onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={vcardData.email}
                      onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Website URL</label>
                  <input
                    type="url"
                    value={vcardData.url}
                    onChange={(e) => setVcardData({ ...vcardData, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* Phone Form */}
            {selectedType === 'phone' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  value={phoneData.phone}
                  onChange={(e) => setPhoneData({ phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            )}

            {/* Email Form */}
            {selectedType === 'email' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Recipient Email</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Subject Line</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Inquiry / Feedback"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Message Body</label>
                  <textarea
                    rows={3}
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    placeholder="Write prefilled email text..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* SMS Form */}
            {selectedType === 'sms' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={smsData.phone}
                    onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Message Content</label>
                  <textarea
                    rows={3}
                    value={smsData.message}
                    onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                    placeholder="Prefilled SMS text..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* WhatsApp Form */}
            {selectedType === 'whatsapp' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">WhatsApp Number (e.g. 15551234567)</label>
                  <input
                    type="text"
                    value={whatsAppData.phone}
                    onChange={(e) => setWhatsAppData({ ...whatsAppData, phone: e.target.value })}
                    placeholder="Include country code without + or spaces"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Prefilled Message</label>
                  <textarea
                    rows={3}
                    value={whatsAppData.message}
                    onChange={(e) => setWhatsAppData({ ...whatsAppData, message: e.target.value })}
                    placeholder="Hello! I found your details via QR..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* Instagram Form */}
            {selectedType === 'instagram' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Instagram Handle or Profile URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={instagramData.usernameOrUrl}
                    onChange={(e) => setInstagramData({ usernameOrUrl: e.target.value })}
                    placeholder="@username or https://instagram.com/user"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* Facebook Form */}
            {selectedType === 'facebook' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Facebook Page or Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={facebookData.usernameOrUrl}
                    onChange={(e) => setFacebookData({ usernameOrUrl: e.target.value })}
                    placeholder="pagename or https://facebook.com/pagename"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* YouTube Form */}
            {selectedType === 'youtube' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">YouTube Channel or Video Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={youtubeData.usernameOrUrl}
                    onChange={(e) => setYoutubeData({ usernameOrUrl: e.target.value })}
                    placeholder="@channelHandle or https://youtube.com/watch?v=..."
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* Location Form */}
            {selectedType === 'location' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Latitude</label>
                    <input
                      type="text"
                      value={locationData.latitude}
                      onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                      placeholder="37.7749"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Longitude</label>
                    <input
                      type="text"
                      value={locationData.longitude}
                      onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                      placeholder="-122.4194"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Or Place / Venue Query</label>
                  <input
                    type="text"
                    value={locationData.query}
                    onChange={(e) => setLocationData({ ...locationData, query: e.target.value })}
                    placeholder="Empire State Building, New York"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* Calendar Event Form */}
            {selectedType === 'calendar' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Event Title</label>
                  <input
                    type="text"
                    value={calendarData.title}
                    onChange={(e) => setCalendarData({ ...calendarData, title: e.target.value })}
                    placeholder="Annual Tech Summit 2026"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Start Time</label>
                    <input
                      type="datetime-local"
                      value={calendarData.startDate}
                      onChange={(e) => setCalendarData({ ...calendarData, startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">End Time</label>
                    <input
                      type="datetime-local"
                      value={calendarData.endDate}
                      onChange={(e) => setCalendarData({ ...calendarData, endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={calendarData.location}
                    onChange={(e) => setCalendarData({ ...calendarData, location: e.target.value })}
                    placeholder="Moscone Center, SF"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Customization Accordion Panels */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                2. Design & Brand Customization
              </span>
              <button
                onClick={() =>
                  setCustomization({
                    foregroundColor: '#0f172a',
                    backgroundColor: '#ffffff',
                    transparentBackground: false,
                    dotPattern: 'rounded',
                    eyePattern: 'rounded',
                    errorCorrection: 'M',
                    logoSize: 0.22,
                    logoPadding: 6,
                    logoShape: 'circle',
                    frameStyle: 'none',
                    frameColor: '#0f172a',
                    frameTextColor: '#ffffff',
                    title: 'SCAN ME',
                  })
                }
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Style</span>
              </button>
            </div>

            {/* Customization Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveAccordion('style')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeAccordion === 'style'
                    ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Shapes & Dots</span>
              </button>

              <button
                onClick={() => setActiveAccordion('colors')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeAccordion === 'colors'
                    ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors & Contrast</span>
              </button>

              <button
                onClick={() => setActiveAccordion('logo')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeAccordion === 'logo'
                    ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Center Logo</span>
              </button>

              <button
                onClick={() => setActiveAccordion('frame')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeAccordion === 'frame'
                    ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Frame & Title</span>
              </button>

              <button
                onClick={() => setActiveAccordion('presets')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeAccordion === 'presets'
                    ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
            </div>

            <div className="p-5">
              {/* Accordion 1: Shapes & Dots */}
              {activeAccordion === 'style' && (
                <div className="space-y-6">
                  {/* Dot Pattern */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700">Data Dot Pattern</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'square', label: 'Square' },
                        { id: 'rounded', label: 'Rounded' },
                        { id: 'dots', label: 'Circles' },
                        { id: 'classy', label: 'Classy' },
                        { id: 'diamond', label: 'Diamond' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              dotPattern: item.id as DotPattern,
                            }))
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                            customization.dotPattern === item.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Eye Pattern */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700">Corner Eye Pattern</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'square', label: 'Classic Square' },
                        { id: 'rounded', label: 'Smooth Rounded' },
                        { id: 'circle', label: 'Concentric Circle' },
                        { id: 'leaf', label: 'Modern Leaf' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              eyePattern: item.id as EyePattern,
                            }))
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                            customization.eyePattern === item.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Correction Level */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Error Correction Level
                      </label>
                      <span className="text-[11px] text-slate-400">
                        High (H) recommended when embedding logos
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'L', label: 'Low (7%)' },
                        { id: 'M', label: 'Medium (15%)' },
                        { id: 'Q', label: 'Quartile (25%)' },
                        { id: 'H', label: 'High (30%)' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              errorCorrection: lvl.id as ErrorCorrectionLevel,
                            }))
                          }
                          className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            customization.errorCorrection === lvl.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Accordion 2: Colors & Contrast */}
              {activeAccordion === 'colors' && (
                <div className="space-y-6">
                  {/* Preset Swatches */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Color Palette Swatches</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {COLOR_PALETTES.map((p) => (
                        <button
                          key={p.name}
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              foregroundColor: p.fg,
                              backgroundColor: p.bg,
                              transparentBackground: false,
                              eyeOuterColor: undefined,
                              eyeInnerColor: undefined,
                            }))
                          }
                          className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-left transition-all group"
                        >
                          <div className="w-5 h-5 rounded-md border border-slate-300 flex overflow-hidden shrink-0">
                            <span className="w-1/2 h-full" style={{ backgroundColor: p.fg }} />
                            <span className="w-1/2 h-full" style={{ backgroundColor: p.bg }} />
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Foreground */}
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700">QR Code Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.foregroundColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              foregroundColor: e.target.value,
                              eyeOuterColor: customEyeColors ? prev.eyeOuterColor : e.target.value,
                              eyeInnerColor: customEyeColors ? prev.eyeInnerColor : e.target.value,
                            }))
                          }
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          value={customization.foregroundColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              foregroundColor: e.target.value,
                            }))
                          }
                          className="w-28 px-2.5 py-1.5 text-xs font-mono uppercase bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Background */}
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700">Background Color</label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={customization.transparentBackground}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                transparentBackground: e.target.checked,
                              }))
                            }
                            className="rounded text-indigo-600"
                          />
                          <span>Transparent</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          disabled={customization.transparentBackground}
                          value={customization.backgroundColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }))
                          }
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0 disabled:opacity-40"
                        />
                        <input
                          type="text"
                          disabled={customization.transparentBackground}
                          value={customization.backgroundColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }))
                          }
                          className="w-28 px-2.5 py-1.5 text-xs font-mono uppercase bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corner Eye Custom Colors Toggle */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Custom Eye Colors</p>
                        <p className="text-[11px] text-slate-500">Colorize the outer ring and inner pupil separately</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customEyeColors}
                          onChange={(e) => {
                            setCustomEyeColors(e.target.checked);
                            if (!e.target.checked) {
                              setCustomization((prev) => ({
                                ...prev,
                                eyeOuterColor: undefined,
                                eyeInnerColor: undefined,
                              }));
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {customEyeColors && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.eyeOuterColor || customization.foregroundColor}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                eyeOuterColor: e.target.value,
                              }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                          />
                          <span className="text-xs text-slate-600">Outer Eye Ring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.eyeInnerColor || customization.foregroundColor}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                eyeInnerColor: e.target.value,
                              }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                          />
                          <span className="text-xs text-slate-600">Inner Eye Pupil</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Accordion 3: Center Logo */}
              {activeAccordion === 'logo' && (
                <div className="space-y-5">
                  {/* Upload Custom Logo */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Upload Custom Image / Logo</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Choose PNG/SVG file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {(customization.logoUrl || customization.logoPreset) && (
                        <button
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              logoUrl: undefined,
                              logoPreset: undefined,
                            }))
                          }
                          className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove Logo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Logos */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Or Select a Brand Icon</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {Object.entries(PRESET_LOGOS).map(([key, item]) => {
                        const isSelected = customization.logoPreset === key && !customization.logoUrl;
                        return (
                          <button
                            key={key}
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                logoPreset: key,
                                logoUrl: undefined,
                                errorCorrection: 'H',
                              }))
                            }
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div
                              className="w-6 h-6 mb-1"
                              dangerouslySetInnerHTML={{ __html: item.svg }}
                            />
                            <span className="text-[10px] font-medium text-slate-700 truncate w-full">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logo Options (Size & Shape) */}
                  {(customization.logoUrl || customization.logoPreset) && (
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>Logo Scale</span>
                          <span className="font-mono text-slate-500 tabular-nums">
                            {Math.round(customization.logoSize * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.16"
                          max="0.32"
                          step="0.02"
                          value={customization.logoSize}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              logoSize: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">Shield Shape</label>
                          <select
                            value={customization.logoShape}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                logoShape: e.target.value as 'circle' | 'square' | 'rounded',
                              }))
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                          >
                            <option value="circle">Circular Shield</option>
                            <option value="rounded">Rounded Square</option>
                            <option value="square">Sharp Square</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span>Padding</span>
                            <span className="font-mono text-slate-500 tabular-nums">
                              {customization.logoPadding}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="12"
                            value={customization.logoPadding}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                logoPadding: parseInt(e.target.value),
                              }))
                            }
                            className="w-full mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 4: Frame & Title */}
              {activeAccordion === 'frame' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Frame Layout</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'No Frame' },
                        { id: 'simple-bottom', label: 'Bottom Banner' },
                        { id: 'badge', label: 'Top Badge' },
                        { id: 'card', label: 'Card Header/Footer' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              frameStyle: item.id as any,
                            }))
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                            customization.frameStyle === item.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {customization.frameStyle !== 'none' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Primary Headline</label>
                        <input
                          type="text"
                          value={customization.title || ''}
                          onChange={(e) =>
                            setCustomization((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g. SCAN ME or CONNECT TO WIFI"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
                        />
                      </div>

                      {customization.frameStyle === 'card' && (
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700">Subtitle / Caption</label>
                          <input
                            type="text"
                            value={customization.subtitle || ''}
                            onChange={(e) =>
                              setCustomization((prev) => ({ ...prev, subtitle: e.target.value }))
                            }
                            placeholder="Point phone camera to open"
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.frameColor || customization.foregroundColor}
                            onChange={(e) =>
                              setCustomization((prev) => ({ ...prev, frameColor: e.target.value }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                          />
                          <span className="text-xs text-slate-600">Banner Background</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customization.frameTextColor || '#ffffff'}
                            onChange={(e) =>
                              setCustomization((prev) => ({ ...prev, frameTextColor: e.target.value }))
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                          />
                          <span className="text-xs text-slate-600">Text Color</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 5: Ready Presets */}
              {activeAccordion === 'presets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Designer Curated Templates</p>
                    <button
                      onClick={() => setShowSaveTemplateModal(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Save Current Look</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUILTIN_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() =>
                          setCustomization({
                            ...preset.customization,
                            title: customization.title || 'SCAN ME',
                          })
                        }
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-3 group"
                      >
                        <div
                          className="w-8 h-8 rounded-lg shrink-0 border border-slate-300 flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: preset.customization.backgroundColor,
                            color: preset.customization.foregroundColor,
                          }}
                        >
                          QR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {preset.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Sticky Preview & Export Station (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Header & Contrast Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Live Render & Preview
              </span>

              {/* Contrast Tag */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isContrastGood
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700 font-bold'
                }`}
                title={`Contrast ratio: ${contrastRatio.toFixed(1)}:1`}
              >
                {isContrastGood ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>
                  {contrastRatio.toFixed(1)}:1 {isContrastGood ? 'Reliable' : 'Low Contrast'}
                </span>
              </div>
            </div>

            {/* Interactive Canvas Stage */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
              <canvas
                ref={canvasRef}
                className="qr-canvas w-64 h-64 max-w-full rounded-xl shadow-sm bg-white"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* Simulated Scan Test Button */}
              <button
                onClick={handleTestScan}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Camera Scannability</span>
              </button>

              {/* Test Scan Result Banner */}
              {scanTestResult && (
                <div
                  className={`mt-2 mx-4 p-2.5 rounded-xl text-xs w-[90%] text-center transition-all ${
                    scanTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {scanTestResult.success ? (
                    <div className="space-y-0.5">
                      <p className="font-bold flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified! 100% Optical Decode</span>
                      </p>
                      <p className="font-mono text-[11px] truncate opacity-85">
                        {scanTestResult.data}
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold">
                      Failed to decode: Increase contrast or reduce logo size.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Export Resolution</span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {exportResolution} x {exportResolution} px
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { res: 512, label: '512px' },
                  { res: 1024, label: '1024px' },
                  { res: 2048, label: '2K Print' },
                  { res: 4096, label: '4K Ultra' },
                ].map((item) => (
                  <button
                    key={item.res}
                    onClick={() => setExportResolution(item.res)}
                    className={`py-1.5 text-xs rounded-lg font-medium border text-center transition-all ${
                      exportResolution === item.res
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleDownloadSVG}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyImage}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Image!</span>
                    </>
                  ) : copiedRaw ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Raw URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendToPoster}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all"
                >
                  <FileImage className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Poster Studio</span>
                </button>
              </div>
            </div>

            {/* Print contrast checklist */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Production Checklist</p>
              <p>· Minimum physical print size: 2 cm x 2 cm (0.8 in)</p>
              <p>· Dark foreground on light background guarantees highest scan rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Save Design Template</h3>
            <p className="text-xs text-slate-500">
              Save your current dot pattern, eye shapes, and color palette to reuse on any future QR code.
            </p>
            <input
              type="text"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              placeholder="e.g. Corporate Brand Theme"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
