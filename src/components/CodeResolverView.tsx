import React, { useState } from 'react';
import { Search, Loader2, BookOpen, CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from 'lucide-react';

interface CodeResolverViewProps {
  selectedLang: string;
}

interface CodeDetail {
  code: string;
  meaningEn: string;
  meaningId: string;
  severity: 'success' | 'warning' | 'error' | 'info';
  actionGuide: string;
}

const OFFICIAL_CODES: CodeDetail[] = [
  {
    code: '200',
    meaningEn: 'Pin is available for redemption',
    meaningId: 'PIN valid dan siap digunakan untuk pengisian kuota/pulsa',
    severity: 'success',
    actionGuide: 'Voucher dalam kondisi prima. Segera masukkan nomor ponsel penerima untuk klaim paket.',
  },
  {
    code: '300',
    meaningEn: 'Pin not found or pin is invalid',
    meaningId: 'PIN tidak ditemukan atau format PIN tidak valid',
    severity: 'error',
    actionGuide: 'Periksa kembali digit yang diketik (pastikan 14–16 digit angka tanpa huruf atau spasi).',
  },
  {
    code: '301',
    meaningEn: 'Pin has been redeemed and recharge transaction is Success',
    meaningId: 'PIN sudah ditukarkan dan transaksi isi ulang telah berhasil',
    severity: 'warning',
    actionGuide: 'Voucher telah hangus karena sudah sukses terpakai. Cek nomor penerima di riwayat transaksi.',
  },
  {
    code: '302',
    meaningEn: 'Pin has been redeemed and recharge transaction is still in process',
    meaningId: 'PIN sudah ditukarkan dan transaksi masih dalam proses antrean',
    severity: 'info',
    actionGuide: 'Tunggu 1–5 menit. Transaksi sedang diproses oleh gateway operator telco XL.',
  },
  {
    code: '303',
    meaningEn: 'Pin is suspended',
    meaningId: 'PIN ditangguhkan atau diblokir sementara oleh sistem keamanan',
    severity: 'error',
    actionGuide: 'Voucher dibekukan karena indikasi kesalahan berulang atau fraud. Hubungi CS XL Bagus.',
  },
  {
    code: '304',
    meaningEn: 'Pin is expired',
    meaningId: 'Masa berlaku PIN voucher telah habis (kadaluwarsa)',
    severity: 'error',
    actionGuide: 'Voucher telah melewati tanggal batas akhir penggunaan dan tidak dapat diaktifkan kembali.',
  },
  {
    code: '305',
    meaningEn: 'Recipient number is incorrect',
    meaningId: 'Nomor ponsel penerima salah atau tidak terdaftar di jaringan XL/Axis',
    severity: 'warning',
    actionGuide: 'Pastikan nomor tujuan aktif dan berformat Indonesia (+62/08) dari operator XL Axiata.',
  },
];

export const CodeResolverView: React.FC<CodeResolverViewProps> = ({ selectedLang }) => {
  const [customCode, setCustomCode] = useState('301');
  const [loading, setLoading] = useState(false);
  const [resolvedDesc, setResolvedDesc] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const resolveCustomCode = async (codeToQuery?: string) => {
    const code = codeToQuery || customCode;
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch('/api/xlbagus/code-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lang: selectedLang }),
      });
      const data = await res.json();
      setResolvedDesc(data.description || 'Tidak ada deskripsi');
    } catch {
      setResolvedDesc('Gagal mengambil deskripsi dari backend');
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = OFFICIAL_CODES.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Live Code Resolver Form */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Kamus & Resolver Kode Respon ASP.NET XL Bagus
          </h2>
          <p className="text-xs text-slate-500">
            Cari tahu arti kode respon HTTP internal yang dikembalikan oleh endpoint <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">/Home/GetCodeDesc</code>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan kode (misal: 200, 301, 304)..."
              className="w-full text-base font-mono px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <button
            onClick={() => resolveCustomCode()}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Query Deskripsi Server</span>
          </button>
        </div>

        {resolvedDesc && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Respon Server Resmi untuk Kode {customCode}:</span>
            </div>
            <div className="text-slate-800 font-mono text-sm">{resolvedDesc}</div>
          </div>
        )}
      </div>

      {/* Official Code Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Daftar Kode Respon Resmi Sistem
          </h3>

          <div className="flex items-center gap-1 p-1 bg-white border border-amber-900/15 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'all' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kode
            </button>
            <button
              onClick={() => setFilterSeverity('success')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'success' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sukses (200)
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'warning' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peringatan (301, 305)
            </button>
            <button
              onClick={() => setFilterSeverity('error')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === 'error' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gagal / Expired
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredCodes.map((item) => {
            let badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
            let icon = <Info className="w-4 h-4 text-slate-500" />;

            if (item.severity === 'success') {
              badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            } else if (item.severity === 'warning') {
              badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
              icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
            } else if (item.severity === 'error') {
              badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
              icon = <XCircle className="w-4 h-4 text-rose-600" />;
            }

            return (
              <div
                key={item.code}
                className="p-4 bg-white border border-amber-900/15 rounded-xl hover:border-blue-400 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                          Kode {item.code}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.meaningId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 italic mb-2">
                        "{item.meaningEn}"
                      </div>
                      <div className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-900/10">
                        <span className="font-semibold text-slate-800">Panduan Tindakan: </span>
                        <span>{item.actionGuide}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCustomCode(item.code);
                      resolveCustomCode(item.code);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap self-end sm:self-center"
                  >
                    Uji Kode Ini
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
