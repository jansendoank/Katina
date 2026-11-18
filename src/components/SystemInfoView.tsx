import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Shield, Clock, PhoneCall, Globe2, Server, CheckCircle2 } from 'lucide-react';
import { SystemInfoData } from '../types/xlbagus.ts';

interface SystemInfoViewProps {
  selectedLang: string;
}

export const SystemInfoView: React.FC<SystemInfoViewProps> = ({ selectedLang }) => {
  const [info, setInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/xlbagus/info?lang=${selectedLang}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInfo(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [selectedLang]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-700" />
              <span>Informasi Sistem & Ketentuan Interval XL Bagus</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data resmi yang diekstrak langsung dari backend ASP.NET MVC xlbagus.com.
            </p>
          </div>

          <button
            onClick={fetchInfo}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            Gagal memperbarui info: {error} (menampilkan data cached)
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
            <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-blue-700" />
              <span>Platform Engine</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-display mt-1">
              {info?.platform || 'XL Bagus'}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
              {info?.url || 'https://xlbagus.com'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
            <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Bahasa Didukung</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-display mt-1">
              {info?.supportedLanguages?.length || 6} Bahasa
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {info?.supportedLanguages?.join(' · ') || 'EN · ID · HI · AR · NE · BN'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-900/10">
            <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sumber Data</span>
            </div>
            <div className="text-base font-bold text-emerald-800 font-display mt-1 uppercase">
              {info?.source === 'live' ? 'Live Gateway' : 'Resilient Sandbox'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Proteksi Anti-CSRF Token
            </div>
          </div>
        </div>

        {/* Alternative Access Numbers */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>Nomor Akses Alternatif Resmi (Alternative Access Numbers)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(info?.alternativeAccessNumbers || [
              '0169977761 (WhatsApp Gateway)',
              '+62 817-0000-761 (Hotline XL)',
              '*123*234# (USSD Dial)',
              'support@xlbagus.com',
            ]).map((num, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-lg font-mono font-medium text-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{num}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recharge Timeframe Rules Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Aturan Interval & Masa Berlaku Isi Ulang Voucher</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-amber-900/15">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/70 border-b border-amber-900/10 font-bold text-slate-700 font-display">
                <tr>
                  <th className="p-3.5">Durasi / Masa Aktif</th>
                  <th className="p-3.5">Kategori Paket Produk</th>
                  <th className="p-3.5">Status Kebijakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(info?.rechargeIntervalRules || []).map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-blue-900 tabular-nums">
                      {rule.duration}
                    </td>
                    <td className="p-3.5 text-slate-800 font-medium">
                      {rule.product}
                    </td>
                    <td className="p-3.5 text-emerald-700">
                      Aktif & Berlaku
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Technical Architecture Explain */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Cara Kerja Scraper & Client API XL Bagus</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Situs XL Bagus dibangun menggunakan teknologi <strong>ASP.NET MVC</strong> yang memerlukan validasi token ganda untuk mencegah pemalsuan permintaan antar-situs (Cross-Site Request Forgery). Sistem ini menjalankan siklus sebagai berikut:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-900/10 space-y-1">
            <div className="font-bold text-blue-900 font-display">1. Handshake Sesi</div>
            <p className="text-slate-600 leading-normal">
              Mengirim request awal ke <code>/EN/Home/Redeem</code> untuk mendapatkan cookie sesi ASP.NET dan mengekstrak elemen input tersembunyi <code>__RequestVerificationToken</code>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-900/10 space-y-1">
            <div className="font-bold text-blue-900 font-display">2. Injeksi Kredensial</div>
            <p className="text-slate-600 leading-normal">
              Cookie <code>ASP.NET_SessionId</code> dan token CSRF dipasangkan pada header AJAX XHR <code>/Home/GetPinInquiry</code> bersama User-Agent modern.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-900/10 space-y-1">
            <div className="font-bold text-blue-900 font-display">3. Parsing & Validasi</div>
            <p className="text-slate-600 leading-normal">
              Memecah respon JSON serial ganda dari backend ASP.NET untuk menghasilkan status ketersediaan, denominasi pulsa, dan katalog produk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
