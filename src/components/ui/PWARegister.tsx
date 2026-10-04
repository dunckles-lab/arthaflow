'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const PWARegister: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('SW registered:', reg.scope))
          .catch((err) => console.log('SW registration failed:', err));
      });
    }

    // 2. Check if already installed (standalone mode)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Listen for BeforeInstallPrompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt banner if not already installed
      if (!checkStandalone) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || !showInstallBanner) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 max-w-sm z-50 bg-[#12141d]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-lg">
            A
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">Pasang Aplikasi ArthaFlow</h4>
            <p className="text-[11px] text-slate-400">Akses instan dari Home Screen tanpa browser bar</p>
          </div>
        </div>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="text-slate-500 hover:text-slate-300 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="mt-3 pt-3 border-t border-[#1e2436] text-[11px] text-slate-300 flex items-center gap-2">
          <span>Ketuk tombol Bagikan</span>
          <Share className="w-3.5 h-3.5 text-indigo-400 inline" />
          <span>lalu pilih</span>
          <span className="font-semibold text-emerald-400">"Add to Home Screen"</span>
          <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          Install Sekarang
        </button>
      )}
    </div>
  );
};
