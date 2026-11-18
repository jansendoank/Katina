import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Copy, Check, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { PinInquiryData } from '../types/xlbagus.ts';

interface VoucherCardProps {
  data: PinInquiryData;
  onCheckProducts?: (pin: string) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ data, onCheckProducts }) => {
  const [copied, setCopied] = useState(false);

  const copyPin = () => {
    navigator.clipboard.writeText(data.pinNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusStamp = () => {
    switch (data.status) {
      case 'Available':
        return {
          label: 'TERSEDIA (VALID)',
          classes: 'border-emerald-600 text-emerald-800 bg-emerald-50/80',
          icon: <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
        };
      case 'Redeemed':
        return {
          label: 'SUDAH DITUKAR',
          classes: 'border-blue-600 text-blue-900 bg-blue-50/80',
          icon: <CheckCircle2 className="w-4 h-4 mr-1 text-blue-600" />
        };
      case 'Processing':
        return {
          label: 'DALAM PROSES',
          classes: 'border-amber-600 text-amber-800 bg-amber-50/80',
          icon: <Clock className="w-4 h-4 mr-1 text-amber-600" />
        };
      case 'Expired':
        return {
          label: 'KADALUWARSA',
          classes: 'border-rose-600 text-rose-800 bg-rose-50/80',
          icon: <XCircle className="w-4 h-4 mr-1 text-rose-600" />
        };
      default:
        return {
          label: 'TIDAK VALID',
          classes: 'border-slate-500 text-slate-700 bg-slate-50/80',
          icon: <AlertTriangle className="w-4 h-4 mr-1 text-slate-500" />
        };
    }
  };

  const stamp = getStatusStamp();

  // Format PIN in 4-digit blocks
  const formattedPin = data.pinNumber.replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <div className="relative overflow-hidden bg-white border border-amber-900/15 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Decorative top header bar with illustrative ticket pattern */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-400 text-blue-950 font-black text-xs flex items-center justify-center font-display">
            XL
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
              Voucher Digital XL Bagus
            </div>
            <div className="text-sm font-bold text-white font-display">
              {data.productName || 'Voucher Isi Ulang Pulsa / Data'}
            </div>
          </div>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-100 bg-blue-900/60 px-2.5 py-1 rounded-md border border-blue-400/20">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
          <span>{data.source === 'live' ? 'Live xlbagus.com' : 'Sandbox Demo'}</span>
        </div>
      </div>

      {/* Main voucher body */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Nomor PIN Voucher
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-slate-900 tabular-nums">
                {formattedPin}
              </span>
              <button
                onClick={copyPin}
                title="Salin PIN"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stamp Badge */}
          <div className={`stamp-badge px-3.5 py-1.5 rounded-md text-xs font-bold font-display ${stamp.classes}`}>
            {stamp.icon}
            <span>{stamp.label}</span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-900/10 mb-6">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase">Nominal / Denom</div>
            <div className="text-base font-bold text-slate-900 font-display tabular-nums">
              {data.denomination ? `Rp ${data.denomination}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase">Respon Code</div>
            <div className="text-base font-semibold font-mono text-slate-800 tabular-nums">
              HTTP {data.responseCode}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase">Negara Asal</div>
            <div className="text-base font-semibold text-slate-800">
              {data.country || 'INDONESIA'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase">Status Transaksi</div>
            <div className="text-base font-semibold text-slate-800">
              {data.status}
            </div>
          </div>
        </div>

        {/* Transaction details if redeemed or processing */}
        {(data.transactionId || data.usedDate || data.usedBy) && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-2 text-xs">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Rincian Penggunaan Voucher</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              {data.transactionId && (
                <div>
                  <span className="text-slate-400">ID Transaksi: </span>
                  <span className="font-mono font-medium text-slate-800">{data.transactionId}</span>
                </div>
              )}
              {data.usedDate && (
                <div>
                  <span className="text-slate-400">Waktu Digunakan: </span>
                  <span className="font-medium text-slate-800">{data.usedDate}</span>
                </div>
              )}
              {data.usedBy && (
                <div>
                  <span className="text-slate-400">Nomor Penerima: </span>
                  <span className="font-mono font-medium text-slate-800">{data.usedBy}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Official description text from ASP.NET */}
        <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 mb-6 flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-800">Keterangan Resmi Sistem: </span>
            <span>{data.description}</span>
          </div>
        </div>

        {/* Barcode & Perforated Ticket Divider */}
        <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Simulated Barcode */}
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-[2px] h-9">
              {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 4, 1, 3, 2].map(
                (w, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-slate-800"
                    style={{ width: `${w * 1.5}px` }}
                  />
                )
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-widest tabular-nums">
              XL-{data.pinNumber.slice(0, 8)}-SECURE
            </span>
          </div>

          {/* Action button to test telco products */}
          {onCheckProducts && (
            <button
              onClick={() => onCheckProducts(data.pinNumber)}
              className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Cek Paket Kuota untuk PIN Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
