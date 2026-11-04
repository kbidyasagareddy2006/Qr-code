import { HistoryRecord, DesignPreset, QRCustomization } from '../types/qr';

const HISTORY_STORAGE_KEY = 'vektorqr_history_v1';
const TEMPLATES_STORAGE_KEY = 'vektorqr_templates_v1';

export const BUILTIN_PRESETS: DesignPreset[] = [
  {
    id: 'minimal-modern',
    name: 'Minimal Clean',
    description: 'Crisp dark slate with smooth rounded modules and clean corner frames',
    customization: {
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
    },
  },
  {
    id: 'indigo-gradient',
    name: 'Royal Indigo',
    description: 'Tech-forward deep indigo with circular dots and high contrast eyes',
    customization: {
      foregroundColor: '#4338ca',
      backgroundColor: '#f8fafc',
      transparentBackground: false,
      eyeOuterColor: '#312e81',
      eyeInnerColor: '#6366f1',
      dotPattern: 'dots',
      eyePattern: 'circle',
      errorCorrection: 'Q',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'circle',
      frameStyle: 'none',
    },
  },
  {
    id: 'emerald-eco',
    name: 'Emerald Forest',
    description: 'Organic leaf-style eyes with deep botanical green dots',
    customization: {
      foregroundColor: '#065f46',
      backgroundColor: '#f0fdf4',
      transparentBackground: false,
      eyeOuterColor: '#047857',
      eyeInnerColor: '#059669',
      dotPattern: 'classy',
      eyePattern: 'leaf',
      errorCorrection: 'M',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'rounded',
      frameStyle: 'none',
    },
  },
  {
    id: 'sunset-crimson',
    name: 'Sunset Rose',
    description: 'Vibrant crimson & coral theme ideal for retail, events, and restaurants',
    customization: {
      foregroundColor: '#9f1239',
      backgroundColor: '#fff1f2',
      transparentBackground: false,
      eyeOuterColor: '#be123c',
      eyeInnerColor: '#e11d48',
      dotPattern: 'rounded',
      eyePattern: 'rounded',
      errorCorrection: 'M',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'circle',
      frameStyle: 'none',
    },
  },
  {
    id: 'luxury-gold',
    name: 'Obsidian & Gold',
    description: 'High-end gold accents against deep obsidian for luxury & VIP branding',
    customization: {
      foregroundColor: '#b45309',
      backgroundColor: '#18181b',
      transparentBackground: false,
      eyeOuterColor: '#d97706',
      eyeInnerColor: '#fbbf24',
      dotPattern: 'diamond',
      eyePattern: 'leaf',
      errorCorrection: 'Q',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'rounded',
      frameStyle: 'none',
    },
  },
  {
    id: 'scan-me-bottom',
    name: 'Promotional Banner',
    description: 'Equipped with a prominent "SCAN ME" bottom banner for physical flyers',
    customization: {
      foregroundColor: '#0f172a',
      backgroundColor: '#ffffff',
      transparentBackground: false,
      eyeOuterColor: '#1e293b',
      eyeInnerColor: '#0f172a',
      dotPattern: 'square',
      eyePattern: 'square',
      errorCorrection: 'M',
      logoSize: 0.22,
      logoPadding: 6,
      logoShape: 'square',
      frameStyle: 'simple-bottom',
      frameColor: '#0f172a',
      frameTextColor: '#ffffff',
      title: 'SCAN ME',
    },
  },
];

// Seed some initial friendly sample history on first visit so the app isn't an empty void
const INITIAL_SAMPLE_HISTORY: HistoryRecord[] = [
  {
    id: 'seed-1',
    type: 'wifi',
    title: 'Guest Wi-Fi (Cafe Horizon)',
    rawContent: 'WIFI:S:Horizon_Guest;T:WPA;P:Welcome2026;H:false;;',
    createdAt: Date.now() - 3600000 * 24 * 2,
    isFavorite: true,
    source: 'generated',
    customization: BUILTIN_PRESETS[0].customization,
  },
  {
    id: 'seed-2',
    type: 'url',
    title: 'https://vektorqr.app/showcase',
    rawContent: 'https://vektorqr.app/showcase',
    createdAt: Date.now() - 3600000 * 12,
    isFavorite: false,
    source: 'generated',
    customization: BUILTIN_PRESETS[1].customization,
  },
  {
    id: 'seed-3',
    type: 'vcard',
    title: 'Elena Vance - Studio Director',
    rawContent:
      'BEGIN:VCARD\nVERSION:3.0\nN:Vance;Elena;;;\nFN:Elena Vance\nORG:Vektor Design Lab\nTITLE:Creative Director\nTEL;TYPE=CELL:+1 (555) 342-8901\nEMAIL:elena@vektordesign.com\nURL:https://vektordesign.com\nEND:VCARD',
    createdAt: Date.now() - 3600000 * 4,
    isFavorite: true,
    source: 'generated',
    customization: BUILTIN_PRESETS[2].customization,
  },
];

export function getHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_HISTORY));
      return INITIAL_SAMPLE_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_HISTORY;
  }
}

export function saveHistoryRecord(record: HistoryRecord): void {
  try {
    const list = getHistory();
    // Prepend new record, avoid duplicates of exact id
    const filtered = list.filter((item) => item.id !== record.id);
    const updated = [record, ...filtered].slice(0, 100);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history item:', err);
  }
}

export function updateHistoryRecord(id: string, updates: Partial<HistoryRecord>): void {
  try {
    const list = getHistory();
    const updated = list.map((item) => (item.id === id ? { ...item, ...updates } : item));
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update history item:', err);
  }
}

export function deleteHistoryRecord(id: string): void {
  try {
    const list = getHistory();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}

export function clearHistory(): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function getCustomTemplates(): DesignPreset[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(name: string, description: string, customization: QRCustomization): DesignPreset {
  const newPreset: DesignPreset = {
    id: 'tpl_' + Date.now().toString(36),
    name,
    description,
    customization,
  };
  try {
    const list = getCustomTemplates();
    const updated = [newPreset, ...list];
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save template:', err);
  }
  return newPreset;
}

export function deleteCustomTemplate(id: string): void {
  try {
    const list = getCustomTemplates();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete template:', err);
  }
}
