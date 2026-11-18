import React, { useState } from 'react';
import { History, Download, Trash2, ArrowUpRight, Search, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { PinInquiryData } from '../types/xlbagus.ts';

interface HistorySectionProps {
  history: PinInquiryData[];
  onSelectPin: (pin: string) => void;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectPin,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = history.filter((item) => {
    if (filter !== 'all' && item.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search && !item.pinNumber.includes(search)) {
      return false;
    }
    return true;
  });

  const exportCsv = () => {
    if (history.length === 0) return;
    const headers = ['Waktu', 'Nomor PIN', 'Status', 'Nominal', 'Produk', 'ID Transaksi', 'Keterangan'];
    const rows = history.map((item) => [
      item.timestamp ? new Date(item.timestamp).toISOString() : '',
      `'${item.pinNumber}`,
      item.status,
      item.denomination || '',
      item.productName || '',
      item.transactionId || '',
      `"${item.description?.replace(/"/g, '""') || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `xlbagus-voucher-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Redeemed':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'Processing':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Expired':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <History className="w-4 h-4 text-blue-700" />
            <span>Riwayat Pengecekan PIN ({history.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Daftar voucher yang telah Anda periksa selama sesi ini berlangsung.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari digit PIN..."
            className="w-full text-xs font-mono pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'available' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tersedia
          </button>
          <button
            onClick={() => setFilter('redeemed')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'redeemed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terpakai
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'expired' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kadaluwarsa
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 font-display">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Nomor PIN</th>
              <th className="p-3">Status</th>
              <th className="p-3">Nominal</th>
              <th className="p-3">Produk</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '—'}
                </td>
                <td className="p-3 font-mono font-bold text-slate-800 tracking-wider tabular-nums whitespace-nowrap">
                  {item.pinNumber}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-3 font-mono font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                  {item.denomination ? `Rp ${item.denomination}` : '—'}
                </td>
                <td className="p-3 text-slate-600 max-w-[200px] truncate">
                  {item.productName || item.description}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => onSelectPin(item.pinNumber)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 ml-auto"
                  >
                    <span>Periksa</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
