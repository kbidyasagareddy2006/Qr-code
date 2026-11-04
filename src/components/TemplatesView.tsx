import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  ArrowRight,
  Trash2,
  Check,
  BookmarkPlus,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { DesignPreset, QRCustomization } from '../types/qr';
import {
  BUILTIN_PRESETS,
  getCustomTemplates,
  deleteCustomTemplate,
} from '../utils/storage';
import { ActiveTab } from './Header';
import { renderQRCodeToCanvas } from '../utils/qrRenderer';

interface TemplatesViewProps {
  onApplyTemplate: (customization: QRCustomization) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onApplyTemplate,
  setActiveTab,
}) => {
  const [customTemplates, setCustomTemplates] = useState<DesignPreset[]>([]);

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
  };

  const handleUsePreset = (customization: QRCustomization) => {
    onApplyTemplate(customization);
    setActiveTab('generator');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Design Templates</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore ready-to-use color schemes, corner eye styles, and custom saved design presets.
        </p>
      </div>

      {/* Built-in Presets */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Curated Design Presets</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUILTIN_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Visual Preview Swatch Block */}
                <div
                  className="w-full h-32 rounded-xl flex items-center justify-center p-4 border border-slate-200 relative overflow-hidden"
                  style={{
                    backgroundColor: preset.customization.backgroundColor,
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-lg flex flex-col items-center justify-center font-bold text-base shadow-xs"
                    style={{
                      backgroundColor: preset.customization.foregroundColor,
                      color: preset.customization.backgroundColor,
                    }}
                  >
                    <span>QR</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-100 rounded">
                    Dots: {preset.customization.dotPattern}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">
                    Eyes: {preset.customization.eyePattern}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => handleUsePreset(preset.customization)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-indigo-600 text-slate-800 hover:text-white border border-slate-200 hover:border-indigo-600 text-xs font-semibold rounded-xl shadow-xs transition-all"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Saved Custom Templates */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-indigo-600" />
            <span>My Custom Saved Templates</span>
          </h2>
          <span className="text-xs text-slate-400">
            {customTemplates.length} saved
          </span>
        </div>

        {customTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
            <p className="text-xs font-medium text-slate-600">No custom templates saved yet.</p>
            <p className="text-xs text-slate-400">
              In the Generator tab, click "Save Current Look" under the Presets tab to save your own branding presets here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                    <button
                      onClick={() => handleDeleteCustom(template.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{template.description}</p>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => handleUsePreset(template.customization)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
                  >
                    <span>Apply in Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
