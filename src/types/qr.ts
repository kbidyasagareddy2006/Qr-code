export type QRType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'vcard'
  | 'phone'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'location'
  | 'calendar';

export type DotPattern = 'square' | 'rounded' | 'dots' | 'classy' | 'diamond';
export type EyePattern = 'square' | 'rounded' | 'circle' | 'leaf';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCustomization {
  // Colors
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  eyeOuterColor?: string;
  eyeInnerColor?: string;

  // Patterns
  dotPattern: DotPattern;
  eyePattern: EyePattern;
  errorCorrection: ErrorCorrectionLevel;

  // Center Logo
  logoUrl?: string;
  logoPreset?: string;
  logoSize: number; // 0.15 - 0.35
  logoPadding: number; // 2 - 12
  logoShape: 'circle' | 'square' | 'rounded';

  // Frame / Labels
  title?: string;
  subtitle?: string;
  frameStyle: 'none' | 'simple-bottom' | 'card' | 'badge' | 'balloon';
  frameColor?: string;
  frameTextColor?: string;
}

export interface QRDataURL {
  url: string;
}

export interface QRDataText {
  text: string;
}

export interface QRDataWiFi {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface QRDataVCard {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  cell?: string;
  email?: string;
  url?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  note?: string;
}

export interface QRDataPhone {
  phone: string;
}

export interface QRDataEmail {
  email: string;
  subject?: string;
  body?: string;
}

export interface QRDataSMS {
  phone: string;
  message?: string;
}

export interface QRDataWhatsApp {
  phone: string;
  message?: string;
}

export interface QRDataSocial {
  usernameOrUrl: string;
}

export interface QRDataLocation {
  latitude?: number | string;
  longitude?: number | string;
  query?: string;
}

export interface QRDataCalendar {
  title: string;
  location?: string;
  description?: string;
  startDate: string; // YYYY-MM-DDTHH:mm
  endDate: string; // YYYY-MM-DDTHH:mm
  allDay: boolean;
}

export type QRFormData =
  | { type: 'url'; data: QRDataURL }
  | { type: 'text'; data: QRDataText }
  | { type: 'wifi'; data: QRDataWiFi }
  | { type: 'vcard'; data: QRDataVCard }
  | { type: 'phone'; data: QRDataPhone }
  | { type: 'email'; data: QRDataEmail }
  | { type: 'sms'; data: QRDataSMS }
  | { type: 'whatsapp'; data: QRDataWhatsApp }
  | { type: 'instagram'; data: QRDataSocial }
  | { type: 'facebook'; data: QRDataSocial }
  | { type: 'youtube'; data: QRDataSocial }
  | { type: 'location'; data: QRDataLocation }
  | { type: 'calendar'; data: QRDataCalendar };

export interface HistoryRecord {
  id: string;
  type: QRType;
  title: string;
  rawContent: string;
  previewUrl?: string; // thumbnail data URL
  customization?: QRCustomization;
  createdAt: number;
  isFavorite: boolean;
  source: 'generated' | 'scanned';
  metadata?: Record<string, string>;
}

export interface DesignPreset {
  id: string;
  name: string;
  description: string;
  customization: QRCustomization;
}

export interface PosterConfig {
  template: 'table_tent' | 'window_sign' | 'event_flyer' | 'social_card' | 'restaurant_menu';
  title: string;
  subtitle: string;
  ctaText: string;
  footerText: string;
  backgroundColor: string;
  backgroundGradient?: string;
  textColor: string;
  accentColor: string;
  qrScale: number; // 0.4 to 0.85
  showBorder: boolean;
  logoUrl?: string;
}
