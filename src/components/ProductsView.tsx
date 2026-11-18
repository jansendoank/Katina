import React, { useState } from 'react';
import { Search, Loader2, Phone, Tag, Check, Copy, Sparkles, AlertCircle, Smartphone } from 'lucide-react';
import { TelcoProductItem } from '../types/xlbagus.ts';

interface ProductsViewProps {
  initialPin?: string;
  selectedLang: string;
  activeMode: 'auto' | 'live' | 'mock';
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  initialPin = '1234567890123456',
  selectedLang,
  activeMode,
}) => {
  const [mobileNumber, setMobileNumber] = useState('081806005689');
  const [pinInput, setPinInput] = useState(initialPin);
  const [country, setCountry] = useState('INDONESIA');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<TelcoProductItem[] | null>(null);
  const [source, setSource] = useState<'live' | 'sandbox'>('sandbox');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'combo' | 'akrab' | 'pulsa'>('all');

  const executeQuery = async () => {
    if (!mobileNumber.trim()) {
      setError('Masukkan nomor ponsel penerima (contoh: 081806005689).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/xlbagus/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinNumber: pinInput.trim() || '1234567890123456',
          mobileNumber: mobileNumber.trim(),
          country,
          lang: selectedLang,
          mode: activeMode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setProducts(data.products || []);
      setSource(data.source || 'sandbox');
    } catch (err) {
      setError((err as Error).message || 'Gagal mengambil katalog paket nomor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredProducts = products?.filter((p) => {
    if (filterType === 'combo') return p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('flex');
    if (filterType === 'akrab') return p.name.toLowerCase().includes('akrab');
    if (filterType === 'pulsa') return p.name.toLowerCase().includes('pulsa') || p.name.toLowerCase().includes('denom');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar & Inputs */}
      <div className="bg-white border border-amber-900/15 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Enumerasi Produk & Paket Kuota untuk Nomor Penerima
            </h2>
            <p className="text-xs text-slate-500">
              Cek daftar paket data resmi yang berhak diaktifkan untuk nomor HP target dengan PIN voucher ini.
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-900/10 shadow-xs shrink-0 hidden sm:block">
            <img
              src="/src/assets/images/voucher_mascot_guide_1794218783507.jpg"
              alt="Mascot XL"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Ponsel Penerima
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setError(null);
                }}
                placeholder="0818xxxxxxx"
                className="w-full text-base font-mono px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor PIN Voucher
            </label>
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234567890123456"
              className="w-full text-base font-mono px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Negara / Prefix
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-sm font-semibold px-4 py-2.5 bg-amber-50/40 border border-amber-900/20 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            >
              <option value="INDONESIA">Indonesia (+62)</option>
              <option value="MALAYSIA">Malaysia (+60)</option>
              <option value="SINGAPORE">Singapura (+65)</option>
            </select>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Format nomor otomatis dinormalisasi tanpa awalan 0 atau dengan kode prefix.</span>
          </div>

          <button
            onClick={executeQuery}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-98 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengecek Produk...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Cari Paket Berhak</span>
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

      {/* Results List */}
      {products && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Paket Tersedia ({products.length})
              </h3>
              <div className="text-xs text-slate-500 mt-0.5">
                Nomor: <span className="font-mono font-bold text-slate-700">{mobileNumber}</span> · Sumber: <span className="font-mono">{source}</span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-1 p-1 bg-white border border-amber-900/15 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('combo')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'combo' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xtra Combo
              </button>
              <button
                onClick={() => setFilterType('akrab')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'akrab' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paket Akrab
              </button>
              <button
                onClick={() => setFilterType('pulsa')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'pulsa' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pulsa Reguler
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-amber-900/15 rounded-xl hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-display">
                          {p.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Kode Telco: <span className="text-slate-700">{p.telcoCode || 'XL_DEFAULT'}</span>
                        </div>
                      </div>
                    </div>

                    {p.denomination && (
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                        Rp {p.denomination}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Siap diredeem via XL Bagus</span>
                    <button
                      onClick={() => handleCopy(p.telcoCode || p.name)}
                      className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedCode === (p.telcoCode || p.name) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Kode Telco</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center bg-white border border-amber-900/10 rounded-xl text-slate-500 text-xs">
                Tidak ada paket yang cocok dengan filter yang dipilih.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
