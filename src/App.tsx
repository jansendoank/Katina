import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { RedeemPage } from './components/RedeemPage.tsx';
import { CheckStatusPage } from './components/CheckStatusPage.tsx';
import { HelpPage } from './components/HelpPage.tsx';
import {
  LangCode,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
} from './i18n/translations.ts';

type ActivePage = 'redeem' | 'checkStatus' | 'help';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('redeem');
  const [selectedLang, setSelectedLang] = useState<LangCode>('EN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [accessNumbers, setAccessNumbers] = useState<string[]>(['mail.jansen@sang.ceo (Email)']);
  const [timeframeRules, setTimeframeRules] = useState<Array<{ duration: string; product: string }>>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.EN;

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live access numbers & timeframe rules from xlbagus.com
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/xlbagus/info?lang=${selectedLang}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (Array.isArray(data.alternativeAccessNumbers) && data.alternativeAccessNumbers.length > 0) {
          setAccessNumbers(data.alternativeAccessNumbers);
        }
        if (Array.isArray(data.rechargeIntervalRules) && data.rechargeIntervalRules.length > 0) {
          setTimeframeRules(data.rechargeIntervalRules);
        }
      })
      .catch(() => {
        // retain defaults
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLang]);

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-[#FAF7F0] text-slate-900 relative overflow-x-hidden flex flex-col items-center justify-start py-8 sm:py-12 px-4 font-sans selection:bg-amber-200 selection:text-blue-950"
    >
      {/* Illustrative Decorative Background Motifs (non-intrusive ambient SVG artwork) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <svg
          className="absolute -top-16 -left-20 w-96 h-96 text-blue-600/8"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M40 120C40 75 75 40 120 40M65 120C65 90 90 65 120 65M90 120C90 103 103 90 120 90"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="120" cy="120" r="10" fill="currentColor" />
        </svg>

        <svg
          className="absolute bottom-0 -right-16 w-[420px] h-[420px] text-amber-500/12"
          viewBox="0 0 240 240"
          fill="none"
        >
          <path
            d="M20 180 Q 80 110, 140 150 T 230 90"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="10 10"
            strokeLinecap="round"
          />
          <rect
            x="130"
            y="145"
            width="64"
            height="42"
            rx="8"
            transform="rotate(-12 130 145)"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>

        <svg
          className="absolute top-1/3 right-12 hidden lg:block w-24 h-24 text-rose-500/10"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 10 L58 38 L86 46 L58 54 L50 82 L42 54 L14 46 L42 38 Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Centered Single-Column Container matching xlbagus.com (col-md-4 centered) */}
      <main className="relative z-10 w-full max-w-[490px]">
        {/* Illustrative Paper Card */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl shadow-[6px_6px_0px_0px_#1e293b] overflow-visible">
          {/* Top Illustrative Strip + Brand Header matching xlbagus.com */}
          <div className="px-6 pt-5 pb-4 border-b-2 border-slate-900/10 bg-gradient-to-b from-amber-50/70 to-white rounded-t-3xl">
            {/* Row 1: BAGUS Indokat + Language Dropdown */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/src/assets/images/voucher_mascot_guide_1794218783507.jpg"
                  alt="Jansen Redem"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl border-2 border-slate-900 object-cover shadow-[2px_2px_0px_0px_#1e293b] shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setActivePage('redeem')}
                  className="text-left focus:outline-none group"
                >
                  <span className="font-display font-extrabold text-2xl sm:text-[26px] leading-none tracking-tight text-[#E41C26] group-hover:opacity-85 transition-opacity block">
                    Jansen Redem
                  </span>
                </button>
              </div>

              {/* Language Dropdown matching #ddl on xlbagus.com */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  id="ddl"
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>{t.langName}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {langMenuOpen && (
                  <ul className="absolute right-0 mt-1.5 w-40 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#1e293b] py-1 z-50 text-xs">
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <li key={opt.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLang(opt.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-amber-50 transition-colors ${
                            selectedLang === opt.code
                              ? 'font-bold text-blue-700 bg-blue-50/60'
                              : 'text-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Row 2: Centered Navigation Links matching Redeem | Check Status | Help */}
            <nav className="mt-4 pt-3 border-t border-dashed border-slate-300 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setActivePage('redeem')}
                className={`px-2 py-0.5 transition-colors whitespace-nowrap ${
                  activePage === 'redeem'
                    ? 'font-bold text-blue-800 underline decoration-2 underline-offset-4'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {t.navRedeem}
              </button>
              <span className="text-slate-300 select-none">|</span>
              <button
                type="button"
                onClick={() => setActivePage('checkStatus')}
                className={`px-2 py-0.5 transition-colors whitespace-nowrap ${
                  activePage === 'checkStatus'
                    ? 'font-bold text-blue-800 underline decoration-2 underline-offset-4'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {t.navCheckStatus}
              </button>
              <span className="text-slate-300 select-none">|</span>
              <button
                type="button"
                onClick={() => setActivePage('help')}
                className={`px-2 py-0.5 transition-colors whitespace-nowrap ${
                  activePage === 'help'
                    ? 'font-bold text-blue-800 underline decoration-2 underline-offset-4'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {t.navHelp}
              </button>
            </nav>
          </div>

          {/* Active Page Form Container */}
          <div className="p-6">
            {activePage === 'redeem' && (
              <RedeemPage
                selectedLang={selectedLang}
                t={t}
                accessNumbers={accessNumbers}
                timeframeRules={timeframeRules}
              />
            )}

            {activePage === 'checkStatus' && (
              <CheckStatusPage
                selectedLang={selectedLang}
                t={t}
              />
            )}

            {activePage === 'help' && (
              <HelpPage
                selectedLang={selectedLang}
                t={t}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
