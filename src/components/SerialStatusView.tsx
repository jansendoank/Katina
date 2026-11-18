import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, AlertCircle, FileText, ArrowUpRight, Hash } from 'lucide-react';
import { StatusTrackingData } from '../types/xlbagus.ts';

interface SerialStatusViewProps {
  selectedLang: string;
  activeMode: 'auto' | 'live' | 'mock';
}

export const SerialStatusView: React.FC<SerialStatusViewProps> = ({
  selectedLang,
  activeMode,
}) => {
  const [serialInput, setSerialInput] = useState('SN99882211');
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusTrackingData | null>(null);

  const executeCheck = async (sn?: string, pin?: string) => {
    const targetSn = sn !== undefined ? sn : serialInput;
    const targetPin = pin !== undefined ? pin : pinInput;

    if (!targetSn && !targetPin) {
      setError('Masukkan Nomor Seri atau Nomor PIN voucher.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/xlbagus/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: targetSn.trim(),
          pinNumber: targetPin.trim(),
          lang: selectedLang,
          mode: activeMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data: StatusTrackingData = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message || 'Gagal melacak nomor seri voucher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Pelacakan Status Transaksi & Nomor Seri (Serial Tracker)
          </h2>
          <p className="text-xs text-slate-500">
            Cek riwayat voucher fisik atau digital berdasarkan Nomor Seri (Serial Number) dan nomor PIN pendukung.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Seri (Serial Number)
            </label>
            <div className="relative">
              <input
                type="text"
                value={serialInput}
                onChange={(e) => {
                  setSerialInput(e.target.value);
                  setError(null);
                }}
                placeholder="Contoh: SN99882211"
                className="w-full text-base font-mono px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor PIN (Opsional)
            </label>
            <input
              type="text"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, '').slice(0, 16));
                setError(null);
              }}
              placeholder="Contoh: 1234567890123456"
              className="w-full text-base font-mono px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Contoh Cepat:</span>
            <button
              type="button"
              onClick={() => {
                setSerialInput('SN-XL-881293');
                setPinInput('1234567890123401');
                executeCheck('SN-XL-881293', '1234567890123401');
              }}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              SN-XL-881293
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => {
                setSerialInput('SN-XL-550192');
                setPinInput('');
                executeCheck('SN-XL-550192', '');
              }}
              className="text-xs text-blue-700 hover:underline font-medium"
            >
              SN-XL-550192
            </button>
          </div>

          <button
            onClick={() => executeCheck()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-98 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Melacak Serial...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Transaksi</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-semibold">Kesalahan: </span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Laporan Status Pelacakan
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {result.product || 'Voucher Isi Ulang XL'}
              </h3>
            </div>
            <div className="px-3 py-1 rounded-md text-xs font-bold font-display uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
              {result.pinStatus || 'Status Terlacak'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Nomor Seri</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {result.serialNumber || '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Nomor PIN</div>
              <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                {result.pinNumber || '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Negara</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {result.country || 'INDONESIA'}
              </div>
            </div>
          </div>

          {/* Timeline of transaction */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Detail Riwayat Isi Ulang</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Status Transaksi</span>
                <span className="font-semibold text-slate-900">{result.transactionStatus || 'Sukses'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">ID Transaksi Resmi</span>
                <span className="font-mono font-medium text-slate-900">{result.transactionId || 'TRX-DEFAULT'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Waktu Transaksi</span>
                <span className="font-medium text-slate-900">{result.usedDate || 'Baru saja'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5">
                <span className="text-slate-500">Nomor Penerima</span>
                <span className="font-mono font-bold text-blue-800">{result.usedBy || '081806005689'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
