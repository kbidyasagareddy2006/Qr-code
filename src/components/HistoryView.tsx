import React, { useState } from 'react';
import {
  Search,
  Star,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  X,
  QrCode,
  ScanLine,
  Filter,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { HistoryRecord, QRType } from '../types/qr';
import {
  deleteHistoryRecord,
  updateHistoryRecord,
  clearHistory,
} from '../utils/storage';
import { ActiveTab } from './Header';
import { renderQRCodeToCanvas, generateQRCodeSVG } from '../utils/qrRenderer';

interface HistoryViewProps {
  history: HistoryRecord[];
  onRefreshHistory: () => void;
  onSelectRecord: (record: HistoryRecord) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onCopyText: (text: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onRefreshHistory,
  onSelectRecord,
  setActiveTab,
  onCopyText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'generated' | 'scanned' | 'favorites'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [previewRecord, setPreviewRecord] = useState<HistoryRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter history
  const filteredHistory = history.filter((item) => {
    // Tab filter
    if (filterTab === 'generated' && item.source !== 'generated') return false;
    if (filterTab === 'scanned' && item.source !== 'scanned') return false;
    if (filterTab === 'favorites' && !item.isFavorite) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.rawContent.toLowerCase().includes(q);
      const matchType = item.type.toLowerCase().includes(q);
      return matchTitle || matchContent || matchType;
    }
    return true;
  });

  const handleToggleFavorite = (record: HistoryRecord) => {
    updateHistoryRecord(record.id, { isFavorite: !record.isFavorite });
    onRefreshHistory();
  };

  const handleDelete = (id: string) => {
    deleteHistoryRecord(id);
    onRefreshHistory();
    if (previewRecord?.id === id) setPreviewRecord(null);
  };

  const handleClearAll = () => {
    clearHistory();
    onRefreshHistory();
    setShowClearConfirm(false);
  };

  const handleStartRename = (record: HistoryRecord) => {
    setEditingId(record.id);
    setEditTitle(record.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      updateHistoryRecord(id, { title: editTitle.trim() });
      onRefreshHistory();
    }
    setEditingId(null);
  };

  const handleDownloadRecordPNG = async (record: HistoryRecord) => {
    const canvas = document.createElement('canvas');
    if (record.customization) {
      await renderQRCodeToCanvas({
        text: record.rawContent,
        customization: record.customization,
        canvas,
        size: 1024,
      });
    } else {
      // standard fallback
      await renderQRCodeToCanvas({
        text: record.rawContent,
        customization: {
          foregroundColor: '#0f172a',
          backgroundColor: '#ffffff',
          transparentBackground: false,
          dotPattern: 'square',
          eyePattern: 'square',
          errorCorrection: 'M',
          logoSize: 0.22,
          logoPadding: 6,
          logoShape: 'circle',
          frameStyle: 'none',
        },
        canvas,
        size: 1024,
      });
    }

    const link = document.createElement('a');
    link.download = `qr_${record.type}_${record.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR History & Saved</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all generated and scanned QR codes stored securely in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, type, or content..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
          {[
            { id: 'all', label: `All (${history.length})` },
            { id: 'generated', label: 'Generated' },
            { id: 'scanned', label: 'Scanned' },
            { id: 'favorites', label: 'Favorites' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <QrCode className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No QR codes matching "${searchQuery}". Try a different keyword.`
              : 'You have no recorded QR codes in this category.'}
          </p>
          <button
            onClick={() => setActiveTab('generator')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            <span>Create a QR Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredHistory.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    onClick={() => setPreviewRecord(item)}
                    className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden"
                  >
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="QR Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <QrCode className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-2 py-1 text-xs border border-indigo-500 rounded-lg outline-none font-semibold text-slate-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => setPreviewRecord(item)}
                          className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                        >
                          {item.title}
                        </h4>
                        <button
                          onClick={() => handleStartRename(item)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Rename label"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 font-mono truncate max-w-lg">
                      {item.rawContent}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                        {item.type}
                      </span>
                      <span>·</span>
                      <span>{item.source === 'generated' ? 'Generated' : 'Scanned'}</span>
                      <span>·</span>
                      <span className="tabular-nums">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleFavorite(item)}
                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-100 rounded-lg transition-colors"
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
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy Content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadRecordPNG(item)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectRecord(item);
                      setActiveTab('generator');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    Edit / Export
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 truncate">{previewRecord.title}</h3>
              <button
                onClick={() => setPreviewRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center p-4 bg-slate-50 rounded-xl">
              <img
                src={previewRecord.previewUrl}
                alt="QR Preview"
                className="w-56 h-56 rounded-lg shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-400">Content</p>
              <p className="text-xs font-mono text-slate-700 break-all bg-slate-50 p-2.5 rounded-lg">
                {previewRecord.rawContent}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleDownloadRecordPNG(previewRecord)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => {
                  onSelectRecord(previewRecord);
                  setPreviewRecord(null);
                  setActiveTab('generator');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Open in Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear All Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Clear All History?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete all stored generated and scanned QR codes from your local browser storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
