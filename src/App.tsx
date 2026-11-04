import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { ScannerView } from './components/ScannerView';
import { PosterDesigner } from './components/PosterDesigner';
import { HistoryView } from './components/HistoryView';
import { TemplatesView } from './components/TemplatesView';
import { QRType, QRCustomization, HistoryRecord } from './types/qr';
import { getHistory, updateHistoryRecord } from './utils/storage';
import { QrCode, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Generator prefill states
  const [generatorType, setGeneratorType] = useState<QRType>('url');
  const [generatorData, setGeneratorData] = useState<any>(null);
  const [generatorCustomization, setGeneratorCustomization] = useState<QRCustomization | undefined>(undefined);

  // Poster prefill states
  const [posterQrDataUrl, setPosterQrDataUrl] = useState<string | undefined>(undefined);
  const [posterTitle, setPosterTitle] = useState<string | undefined>(undefined);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Handlers for switching views with preloaded state
  const handleNewQR = () => {
    setGeneratorType('url');
    setGeneratorData(null);
    setGeneratorCustomization(undefined);
    setActiveTab('generator');
  };

  const handleSelectQuickType = (type: QRType) => {
    setGeneratorType(type);
    setGeneratorData(null);
    setActiveTab('generator');
  };

  const handleSelectHistoryItem = (item: HistoryRecord) => {
    setGeneratorType(item.type);
    if (item.customization) {
      setGeneratorCustomization(item.customization);
    }
    // Attempt basic prefill based on type
    if (item.type === 'url') {
      setGeneratorData({ url: item.rawContent });
    } else if (item.type === 'text') {
      setGeneratorData({ text: item.rawContent });
    } else {
      setGeneratorData(null);
    }
    setActiveTab('generator');
  };

  const handleLoadScannedIntoGenerator = (type: QRType, raw: string) => {
    setGeneratorType(type);
    if (type === 'url') {
      setGeneratorData({ url: raw });
    } else if (type === 'text') {
      setGeneratorData({ text: raw });
    } else {
      setGeneratorData(null);
    }
    setActiveTab('generator');
    showToast('Loaded scanned data into generator');
  };

  const handleSendToPoster = (dataUrl: string, title: string) => {
    setPosterQrDataUrl(dataUrl);
    setPosterTitle(title);
    setActiveTab('poster');
    showToast('Transferred QR code to Poster Studio');
  };

  const handleApplyTemplate = (customization: QRCustomization) => {
    setGeneratorCustomization(customization);
    setActiveTab('generator');
    showToast('Applied template to generator');
  };

  const handleToggleFavorite = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      updateHistoryRecord(id, { isFavorite: !item.isFavorite });
      refreshHistory();
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied content to clipboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewQR={handleNewQR}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            history={history}
            setActiveTab={setActiveTab}
            onSelectType={handleSelectQuickType}
            onSelectHistoryItem={handleSelectHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onCopyText={handleCopyText}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorView
            initialType={generatorType}
            initialData={generatorData}
            initialCustomization={generatorCustomization}
            onSendToPoster={handleSendToPoster}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerView
            onLoadScannedIntoGenerator={handleLoadScannedIntoGenerator}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'poster' && (
          <PosterDesigner
            initialQrDataUrl={posterQrDataUrl}
            initialTitle={posterTitle}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onRefreshHistory={refreshHistory}
            onSelectRecord={handleSelectHistoryItem}
            setActiveTab={setActiveTab}
            onCopyText={handleCopyText}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesView
            onApplyTemplate={handleApplyTemplate}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">VektorQR Studio</span>
            <span>—</span>
            <span>Client-side vector QR generation & camera scanning</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Offline-Ready</span>
            <span>·</span>
            <span>Zero Third-Party Tracking</span>
            <span>·</span>
            <span>Lossless Vector Export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
