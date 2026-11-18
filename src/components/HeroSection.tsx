import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onQuickInquire: (pin: string) => void;
  activeMode: 'auto' | 'live' | 'mock';
  setActiveMode: (mode: 'auto' | 'live' | 'mock') => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onQuickInquire,
  activeMode,
  setActiveMode,
  selectedLang,
  setSelectedLang,
}) => {
  const PRESET_PINS = [
    { label: 'PIN Tersedia (200)', pin: '1234567890123400', desc: 'Valid & siap pakai' },
    { label: 'PIN Terpakai (301)', pin: '1234567890123401', desc: 'Sudah ditukar' },
    { label: 'PIN Diproses (302)', pin: '1234567890123402', desc: 'Sedang transaksi' },
    { label: 'PIN Kadaluwarsa (304)', pin: '1234567890123404', desc: 'Masa berlaku habis' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-[#faf8f5] to-[#faf8f5] border-b border-amber-900/10 pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-5">
            {/* Illustrative kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Sistem Mesin Voucher ASP.NET MVC XL Bagus</span>
              <span className="text-amber-800/40">/</span>
              <span>Proteksi Anti-CSRF Token</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-slate-900 leading-[1.15] [text-wrap:balance]">
              Validasi & Lacak Status Voucher XL dengan Desain Ilustratif
            </h1>

            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Cek keaslian PIN 14–16 digit, lacak nomor seri, pantau transaksi isi ulang, serta telusuri katalog paket telco resmi XL Bagus secara real-time.
            </p>

            {/* Mode & Language bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-amber-900/15 rounded-xl shadow-xs">
                <span className="text-xs font-medium text-slate-500 pl-2 pr-1">Koneksi:</span>
                <button
                  onClick={() => setActiveMode('auto')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    activeMode === 'auto'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Otomatis
                </button>
                <button
                  onClick={() => setActiveMode('live')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    activeMode === 'live'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Server
                </button>
                <button
                  onClick={() => setActiveMode('mock')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    activeMode === 'mock'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sandbox Demo
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-amber-900/15 rounded-xl shadow-xs">
                <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" />
                <span className="text-xs font-medium text-slate-500">Bahasa:</span>
                {(['ID', 'EN', 'HI', 'AR'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      selectedLang === lang
                        ? 'bg-amber-400 text-blue-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Test Presets strip */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Coba Preset PIN Simulasi:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_PINS.map((item) => (
                  <button
                    key={item.pin}
                    onClick={() => onQuickInquire(item.pin)}
                    className="p-2.5 bg-white border border-amber-900/15 hover:border-blue-500 rounded-xl text-left transition-all hover:-translate-y-0.5 hover:shadow-sm group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 font-display">
                      {item.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                      ...{item.pin.slice(-4)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Illustrative Artwork */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-900/15 shadow-md bg-white">
              <img
                src="/src/assets/images/hero_voucher_illustration_1794218782939.jpg"
                alt="Ilustrasi Voucher Digital XL Bagus"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-[16/10] hover:scale-102 transition-transform duration-500"
              />
              <div className="p-3 bg-amber-50/90 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">Engine Scraper ASP.NET Siap</span>
                </div>
                <span className="font-mono text-slate-500">v133.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
