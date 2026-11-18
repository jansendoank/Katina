import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Clipboard, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { PinInquiryData } from '../types/xlbagus.ts';
import { VoucherCard } from './VoucherCard.tsx';

interface PinInquiryViewProps {
  onCheckProducts: (pin: string) => void;
  selectedLang: string;
  activeMode: 'auto' | 'live' | 'mock';
  onSaveToHistory: (item: PinInquiryData) => void;
  externalPin?: string;
}

export const PinInquiryView: React.FC<PinInquiryViewProps> = ({
  onCheckProducts,
  selectedLang,
  activeMode,
  onSaveToHistory,
  externalPin,
}) => {
  const [pinInput, setPinInput] = useState(externalPin || '1234567890123400');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PinInquiryData | null>(null);

  // Sync external PIN if triggered from presets
  React.useEffect(() => {
    if (externalPin && externalPin !== pinInput) {
      setPinInput(externalPin);
      executeInquiry(externalPin);
    }
  }, [externalPin]);

  const cleanDigits = (val: string) => val.replace(/\D/g, '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = cleanDigits(e.target.value);
    if (raw.length <= 16) {
      setPinInput(raw);
      setError(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = cleanDigits(text).slice(0, 16);
      if (digits) {
        setPinInput(digits);
        setError(null);
      }
    } catch {
      // ignore clipboard error
    }
  };

  const executeInquiry = async (pinToQuery?: string) => {
    const targetPin = cleanDigits(pinToQuery || pinInput);
    if (!targetPin || targetPin.length < 10) {
      setError('Masukkan nomor PIN numerik valid (minimal 10 digit, standar XL 14–16 digit).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/xlbagus/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinNumber: targetPin,
          lang: selectedLang,
          mode: activeMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data: PinInquiryData = await res.json();
      const withTimestamp = { ...data, timestamp: Date.now() };
      setResult(withTimestamp);
      onSaveToHistory(withTimestamp);
    } catch (err) {
      setError((err as Error).message || 'Gagal memproses verifikasi PIN.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPreview = pinInput
    ? pinInput.replace(/(\d{4})(?=\d)/g, '$1 ')
    : '____ ____ ____ ____';

  return (
    <div className="space-y-6">
      {/* Search Input Box with illustrative card style */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Inquiry & Validasi PIN Voucher XL
            </h2>
            <p className="text-xs text-slate-500">
              Periksa ketersediaan saldo, masa berlaku, dan status penukaran kuota.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Panjang PIN:</span>
            <span
              className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                pinInput.length >= 14 && pinInput.length <= 16
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pinInput.length} / 16
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={pinInput}
              onChange={handleInputChange}
              placeholder="Contoh: 1234567890123456"
              className="w-full text-xl sm:text-2xl font-mono tracking-widest px-4 py-3.5 bg-amber-50/40 border-2 border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300 tabular-nums"
              maxLength={16}
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePaste}
                title="Tempel dari Clipboard"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tempel</span>
              </button>
              {pinInput && (
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  title="Hapus"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Formatted live preview */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Format:</span>
              <span className="font-mono font-medium tracking-wider text-slate-700">
                {formattedPreview}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Mendukung PIN voucher 14 hingga 16 digit numerik
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Engine otomatis menginisialisasi sesi Anti-CSRF ke xlbagus.com.
              </span>
            </div>

            <button
              onClick={() => executeInquiry()}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 active:scale-98 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa PIN...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Validasi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-semibold">Kesalahan Verifikasi: </span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Hasil Validasi Voucher
            </h3>
            <span className="text-xs text-slate-500">
              Diperbarui: {new Date(result.timestamp || Date.now()).toLocaleTimeString()}
            </span>
          </div>

          <VoucherCard data={result} onCheckProducts={onCheckProducts} />
        </div>
      ) : (
        /* Empty State with illustrative artwork */
        <div className="bg-white border border-amber-900/10 rounded-2xl p-8 text-center flex flex-col items-center">
          <img
            src="/src/assets/images/empty_search_art_1794218782084.jpg"
            alt="Pencarian Voucher"
            referrerPolicy="no-referrer"
            className="w-48 h-auto object-contain mb-4 rounded-xl shadow-xs"
          />
          <h4 className="text-base font-bold text-slate-800 font-display">
            Belum Ada PIN yang Diperiksa
          </h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
            Ketik nomor PIN voucher di atas atau klik salah satu tombol preset simulasi untuk melihat rincian voucher dan status transaksi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setPinInput('1234567890123400');
                executeInquiry('1234567890123400');
              }}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Coba PIN Tersedia
            </button>
            <button
              onClick={() => {
                setPinInput('1234567890123401');
                executeInquiry('1234567890123401');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Coba PIN Terpakai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
