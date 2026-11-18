import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { TutorialModal } from './TutorialModal.tsx';
import { TranslationBundle, LangCode } from '../i18n/translations.ts';

interface HelpPageProps {
  selectedLang: LangCode;
  t: TranslationBundle;
}

export const HelpPage: React.FC<HelpPageProps> = ({ selectedLang, t }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [yourMobileNumber, setYourMobileNumber] = useState('');
  const [yourQuestion, setYourQuestion] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; ticketId: string; submittedAt: string } | null>(null);

  useEffect(() => {
    setError(null);
  }, [selectedLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yourMobileNumber.trim() || !yourQuestion.trim()) {
      setError('Please enter Your Mobile Number and Your Question.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/xlbagus/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serialNumber.trim(),
          yourMobileNumber: yourMobileNumber.trim(),
          yourQuestion: yourQuestion.trim(),
          emailAddress: emailAddress.trim(),
          lang: selectedLang,
          mode: 'auto',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');
      setResult(data);
    } catch (err) {
      setError((err as Error).message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSerialNumber('');
    setYourMobileNumber('');
    setYourQuestion('');
    setEmailAddress('');
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
        {/* 1. Serial Number (?) */}
        <fieldset className="space-y-1">
          <label htmlFor="SerialNumber" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span>{t.serialNumber}</span>
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="inline-flex items-center justify-center text-blue-700 hover:text-blue-900 font-bold"
              title={t.tutorialTitle}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <input
            id="SerialNumber"
            name="SerialNumber"
            type="text"
            maxLength={16}
            tabIndex={1}
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder={t.serialPlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* 2. Your Mobile Number */}
        <fieldset className="space-y-1">
          <label htmlFor="YourMobileNumber" className="block text-xs font-bold text-slate-900">
            {t.yourMobileNumber}
          </label>
          <input
            id="YourMobileNumber"
            name="YourMobileNumber"
            type="text"
            tabIndex={2}
            value={yourMobileNumber}
            onChange={(e) => {
              setYourMobileNumber(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.mobilePlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* 3. Your Question */}
        <fieldset className="space-y-1">
          <label htmlFor="YourQuestion" className="block text-xs font-bold text-slate-900">
            {t.yourQuestion}
          </label>
          <textarea
            id="YourQuestion"
            name="YourQuestion"
            rows={3}
            tabIndex={3}
            value={yourQuestion}
            onChange={(e) => {
              setYourQuestion(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t.questionPlaceholder}
            className="w-full text-sm px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400 resize-none"
          />
        </fieldset>

        {/* 4. Email Address */}
        <fieldset className="space-y-1">
          <label htmlFor="EmailAddress" className="block text-xs font-bold text-slate-900">
            {t.emailAddress}
          </label>
          <input
            id="EmailAddress"
            name="EmailAddress"
            type="email"
            tabIndex={4}
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full text-sm px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-700 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Submit & Reset Buttons */}
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
            <span>{t.submit}</span>
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

      {result && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-slate-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{result.message}</span>
          </div>
          <div className="text-slate-700 font-mono">
            {result.ticketId} · {result.submittedAt}
          </div>
        </div>
      )}
    </div>
  );
};
