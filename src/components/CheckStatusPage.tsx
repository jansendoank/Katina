import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, HelpCircle, Check } from 'lucide-react';
import { TutorialModal } from './TutorialModal.tsx';
import { StatusTrackingData } from '../types/xlbagus.ts';
import { TranslationBundle, LangCode } from '../i18n/translations.ts';

interface CheckStatusPageProps {
  selectedLang: LangCode;
  t: TranslationBundle;
}

export const CheckStatusPage: React.FC<CheckStatusPageProps> = ({
  selectedLang,
  t,
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusTrackingData | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    setError(null);
  }, [selectedLang]);

  const cleanDigits = (v: string) => v.replace(/\D/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim() && !pinNumber.trim()) {
      setError('Empty Serial Number / Pin Number');
      return;
    }
    if (!captchaVerified) {
      setError("You can't leave Captcha Code empty");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/xlbagus/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serialNumber.trim(),
          pinNumber: cleanDigits(pinNumber),
          lang: selectedLang,
          mode: 'auto',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data: StatusTrackingData = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSerialNumber('');
    setPinNumber('');
    setCaptchaVerified(false);
    setError(null);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        t={t}
      />

      <form id="redeem-form" onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Serial Number * */}
        <fieldset className="space-y-1">
          <label htmlFor="SerialNumber" className="block text-xs font-bold text-slate-900">
            <span>{t.serialNumber}</span>
            <span className="text-rose-600 ml-1">*</span>
          </label>
          <input
            id="SerialNumber"
            name="SerialNumber"
            type="text"
            tabIndex={1}
            value={serialNumber}
            onChange={(e) => {
              setSerialNumber(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.serialPlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* Exact "Or" / "Atau" separator */}
        <div className="py-0.5 text-xs font-bold text-slate-800">
          {t.orText}
        </div>

        {/* 2. Pin Number (?) * */}
        <fieldset className="space-y-1">
          <label htmlFor="PinNumber" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span>{t.pinNumber}</span>
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="inline-flex items-center justify-center text-blue-700 hover:text-blue-900 font-bold"
              title={t.tutorialTitle}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <span className="text-rose-600">*</span>
          </label>
          <input
            id="PinNumber"
            name="PinNumber"
            type="text"
            tabIndex={2}
            value={pinNumber}
            onChange={(e) => {
              setPinNumber(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.pinPlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* 3. Captcha */}
        <fieldset className="space-y-1">
          <label className="block text-xs font-bold text-slate-900">
            {t.captcha}
          </label>
          <div className="p-3 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCaptchaVerified(!captchaVerified);
                if (error) setError(null);
              }}
              className="flex items-center gap-3 text-left select-none"
            >
              <span
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  captchaVerified
                    ? 'bg-emerald-500 border-slate-900 text-white'
                    : 'bg-white border-slate-400'
                }`}
              >
                {captchaVerified && <Check className="w-4 h-4 stroke-[3]" />}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {t.captchaLabel}
              </span>
            </button>
            <div className="text-[10px] font-mono text-slate-400">
              reCAPTCHA
            </div>
          </div>
        </fieldset>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-700 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Check Status & Reset Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="submit"
            id="btn_Submit"
            name="Command"
            value="Submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{t.checkStatusBtn}</span>
          </button>

          <button
            type="button"
            id="btn_Reset"
            name="Command"
            value="Reset"
            onClick={handleReset}
            className="w-full py-2.5 px-4 bg-[#FAF7F0] hover:bg-amber-100/70 text-slate-900 font-bold text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
          >
            {t.reset}
          </button>
        </div>
      </form>

      {/* Output matching the exact 7 ASP.NET fields of default xlbagus.com */}
      {result && (
        <div className="mt-4 rounded-xl border-2 border-slate-900 bg-amber-50/50 overflow-hidden text-xs divide-y divide-slate-300">
          <div className="p-3 flex items-center justify-between gap-2 bg-white">
            <span className="font-bold text-slate-600">{t.country}</span>
            <span className="font-semibold text-slate-900">{result.country || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600">PinStatus</span>
            <span className="font-bold text-blue-900">{result.pinStatus || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2 bg-white">
            <span className="font-bold text-slate-600">TransactionStatus</span>
            <span className="font-semibold text-slate-900 text-right">{result.transactionStatus || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600">{t.product}</span>
            <span className="font-semibold text-slate-900 text-right">{result.product || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2 bg-white">
            <span className="font-bold text-slate-600">TransactionID</span>
            <span className="font-mono font-bold text-slate-900">{result.transactionId || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-600">TransactionDate</span>
            <span className="font-mono text-slate-800">{result.usedDate || '—'}</span>
          </div>
          <div className="p-3 flex items-center justify-between gap-2 bg-white">
            <span className="font-bold text-slate-600">TransactionBy</span>
            <span className="font-mono font-bold text-blue-800">{result.usedBy || '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
