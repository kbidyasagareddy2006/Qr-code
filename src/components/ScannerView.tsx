import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  Copy,
  ExternalLink,
  RotateCw,
  Check,
  AlertCircle,
  Wifi,
  Contact,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Share2,
  QrCode,
  Zap,
  ZapOff,
  VideoOff,
} from 'lucide-react';
import { parseScannedQR, ParsedQR } from '../utils/qrParser';
import { saveHistoryRecord } from '../utils/storage';
import { ActiveTab } from './Header';
import { QRType } from '../types/qr';

interface ScannerViewProps {
  onLoadScannedIntoGenerator: (type: QRType, raw: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onLoadScannedIntoGenerator,
  setActiveTab,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Scan state
  const [lastScannedRaw, setLastScannedRaw] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedQR | null>(null);
  const [copied, setCopied] = useState(false);

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Get available video inputs
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devs) => {
          const videoDevs = devs.filter((d) => d.kind === 'videoinput');
          setDevices(videoDevs);
          if (videoDevs.length > 0 && !selectedDeviceId) {
            // Prefer back/environment camera if available
            const backCam = videoDevs.find((d) =>
              /back|rear|environment/i.test(d.label)
            );
            setSelectedDeviceId(backCam ? backCam.deviceId : videoDevs[0].deviceId);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Start Camera
  const startCamera = async (deviceId?: string) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch support
        const track = stream.getVideoTracks()[0];
        if (track && 'getCapabilities' in track) {
          const capabilities = (track as any).getCapabilities?.();
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        }

        // Start scanning loop
        scanFrameLoop();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings or use image file upload.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload an image containing a QR code below.');
      } else {
        setCameraError('Camera could not be started in this environment. You can upload an image directly.');
      }
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchEnabled(false);
  };

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchEnabled;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchEnabled(nextState);
      } catch (e) {
        console.warn('Failed to toggle torch:', e);
      }
    }
  };

  // Continuous frame scanning loop
  const scanFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanFrameLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data.trim()) {
        handleCodeDetected(code.data.trim());
        return; // stop loop once code is detected
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrameLoop);
  };

  // Process detected QR code
  const handleCodeDetected = (rawText: string) => {
    setLastScannedRaw(rawText);
    const parsed = parseScannedQR(rawText);
    setParsedResult(parsed);

    // Save to local history
    saveHistoryRecord({
      id: 'scan_' + Date.now().toString(36),
      type: parsed.type,
      title: parsed.title,
      rawContent: rawText,
      createdAt: Date.now(),
      isFavorite: false,
      source: 'scanned',
    });
  };

  // Decode uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files?.[0];
    } else {
      file = e.target.files?.[0];
    }
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleCodeDetected(code.data.trim());
        } else {
          setCameraError('No QR code detected in this image. Ensure the QR code is clear, well-lit, and in focus.');
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Clean up on unmount or mode switch
  useEffect(() => {
    if (activeMode === 'camera') {
      startCamera(selectedDeviceId);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, selectedDeviceId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareResult = async () => {
    if (!lastScannedRaw) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: parsedResult?.title || 'Scanned QR Code',
          text: lastScannedRaw,
          url: parsedResult?.actionUrl || undefined,
        });
      } catch {}
    } else {
      copyToClipboard(lastScannedRaw);
    }
  };

  const getIconForType = (type: QRType) => {
    switch (type) {
      case 'url':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-emerald-600" />;
      case 'vcard':
        return <Contact className="w-5 h-5 text-violet-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-amber-600" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-cyan-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'location':
        return <MapPin className="w-5 h-5 text-rose-600" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <QrCode className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">QR Code Scanner</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scan codes in real time with your device camera or upload image files to decode instantly.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeMode === 'camera'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Device Camera</span>
        </button>
        <button
          onClick={() => setActiveMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeMode === 'upload'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Main Scanner Stage */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {activeMode === 'camera' ? (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Camera Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {devices.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium outline-none"
                  >
                    {devices.map((d, i) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      torchEnabled
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {torchEnabled ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
                    <span>Flashlight</span>
                  </button>
                )}
              </div>

              {cameraActive && (
                <button
                  onClick={() => startCamera(selectedDeviceId)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restart Camera</span>
                </button>
              )}
            </div>

            {/* Viewport Frame with Reticle */}
            <div className="relative aspect-video max-h-[440px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Guide Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-64 h-64 border-2 border-white/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    {/* Corner accent brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                    {/* Animated horizontal laser scanning line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_#6366f1] animate-bounce mt-32" />
                  </div>
                </div>
              )}

              {/* Camera Error or Inactive State */}
              {!cameraActive && (
                <div className="p-6 text-center text-slate-300 max-w-md space-y-3">
                  <VideoOff className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-sm font-semibold text-white">Camera Offline</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cameraError ||
                      'Camera permission is required to scan codes in real time, or switch to Upload Image mode.'}
                  </p>
                  <button
                    onClick={() => startCamera(selectedDeviceId)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Request Camera Access
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload Mode */
          <div className="p-6 sm:p-8">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e);
              }}
              className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50/60 hover:bg-indigo-50/20 cursor-pointer transition-all space-y-3 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Drag and drop an image containing a QR code</p>
                <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP, or SVG screenshot</p>
              </div>
              <span className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs">
                Browse Files
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {cameraError && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decoded Result Inspection Card */}
      {parsedResult && lastScannedRaw && (
        <div className="bg-white rounded-2xl border-2 border-indigo-500/20 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {getIconForType(parsedResult.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{parsedResult.title}</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    {parsedResult.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-md">
                  {parsedResult.displayValue}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(lastScannedRaw)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={shareResult}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Share Scanned Content"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onLoadScannedIntoGenerator(parsedResult.type, lastScannedRaw);
                  setActiveTab('generator');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Re-generate</span>
              </button>
            </div>
          </div>

          {/* Parsed Details Breakdown */}
          {Object.keys(parsedResult.details).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {Object.entries(parsedResult.details).map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <p className="text-[11px] font-medium text-slate-400">{key}</p>
                  <p className="text-xs font-semibold text-slate-800 break-all">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          {parsedResult.actionUrl && (
            <a
              href={parsedResult.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <span>{parsedResult.actionLabel || 'Open Link'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
