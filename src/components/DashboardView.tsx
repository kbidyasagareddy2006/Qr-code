import React from 'react';
import {
  QrCode,
  ScanLine,
  Wifi,
  Contact,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Star,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { HistoryRecord, QRType } from '../types/qr';
import { ActiveTab } from './Header';

interface DashboardViewProps {
  history: HistoryRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectType: (type: QRType) => void;
  onSelectHistoryItem: (item: HistoryRecord) => void;
  onToggleFavorite: (id: string) => void;
  onCopyText: (text: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  setActiveTab,
  onSelectType,
  onSelectHistoryItem,
  onToggleFavorite,
  onCopyText,
}) => {
  const generatedCount = history.filter((h) => h.source === 'generated').length;
  const scannedCount = history.filter((h) => h.source === 'scanned').length;
  const favoritesCount = history.filter((h) => h.isFavorite).length;

  const quickTypes: {
    type: QRType;
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'url',
      label: 'Website Link',
      desc: 'Connect visitors to any page or web app',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      type: 'wifi',
      label: 'Wi-Fi Network',
      desc: 'One-tap guest connection without typing pass',
      icon: <Wifi className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      type: 'vcard',
      label: 'Digital vCard',
      desc: 'Complete digital business card & phone contacts',
      icon: <Contact className="w-5 h-5" />,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp Chat',
      desc: 'Start instant direct messaging with custom text',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      type: 'email',
      label: 'Email Dispatch',
      desc: 'Prefill recipient, subject, and message body',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      type: 'location',
      label: 'Google Maps',
      desc: 'Direct GPS coordinates or venue place search',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      type: 'phone',
      label: 'Phone Call',
      desc: 'Instant dialer prompt on iOS and Android',
      icon: <Phone className="w-5 h-5" />,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    },
    {
      type: 'calendar',
      label: 'Calendar Event',
      desc: 'Save meetings, launches, and celebrations',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Create, Customise & Scan High-Reliability QR Codes
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time vector QR generation with custom dot shapes, corner eye styles, brand
              logos, and camera scanning with zero login requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onSelectType('url');
                setActiveTab('generator');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 font-semibold rounded-xl text-sm shadow-sm hover:bg-slate-100 transition-all"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Generate Code</span>
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white font-medium rounded-xl text-sm border border-slate-700 transition-all"
            >
              <ScanLine className="w-4 h-4 text-indigo-400" />
              <span>Open Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Generated
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {generatedCount}
            </span>
            <span className="text-xs text-slate-400">stored locally</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Codes Scanned
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {scannedCount}
            </span>
            <span className="text-xs text-slate-400">decoded</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Saved Favorites
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
              {favoritesCount}
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Contrast Reliability
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              100%
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Quick Launch Types Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quick Create</h2>
            <p className="text-xs text-slate-500">
              Select any data standard to generate validated QR codes instantly
            </p>
          </div>
          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View all 13 types</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTypes.map((item) => (
            <div
              key={item.type}
              onClick={() => {
                onSelectType(item.type);
                setActiveTab('generator');
              }}
              className="bg-white hover:bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border ${item.color}`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-600">
                <span>Configure & Generate</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent QR Activity</h2>
            <p className="text-xs text-slate-500">
              Your recent codes saved locally in your browser storage
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Full History ({history.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <QrCode className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm">No QR codes created yet.</p>
            <button
              onClick={() => setActiveTab('generator')}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
            >
              Generate your first QR
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div
                  onClick={() => onSelectHistoryItem(item)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                      {item.rawContent}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                    title={item.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => onCopyText(item.rawContent)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Copy Content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectHistoryItem(item)}
                    className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Inspect & Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Spotlights / Quick Tools Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">QR Poster & Flyer Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place your generated QR code into ready-to-print window signs, table tents, or event
              posters with customizable typography, logos, and high-resolution PNG export.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('poster')}
            className="self-start flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <span>Launch Poster Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Real-Time Camera & File Scanner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan QR codes instantly through your device camera or upload image files. Decodes
              Wi-Fi passwords, contact cards, web links, and coordinates with 1-click actions.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scanner')}
            className="self-start flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <span>Open Camera Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
