import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations.ts';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationBundle;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDF9] rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_#1e293b] max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir={t.dir}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-amber-100/80 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-800" />
            <h3 className="font-bold font-display text-slate-900 text-sm">
              {t.tutorialTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white/70 transition-colors"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Illustrative Voucher Card Graphic */}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-800 bg-gradient-to-br from-blue-50 via-white to-amber-50 space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2">
              <span className="font-extrabold font-display text-rose-600 text-sm tracking-tight">
                BAGUS Indokat
              </span>
              <span className="text-[11px] bg-amber-300 text-slate-900 font-bold px-2 py-0.5 rounded border border-slate-900">
                VOUCHER
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border-2 border-slate-900 text-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">
                {t.serialNumber}
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm tracking-widest mt-0.5 tabular-nums">
                SN 8812 9043 2110
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-100/90 border-2 border-slate-900 text-xs">
              <div className="text-[10px] font-bold text-amber-950 uppercase flex items-center justify-between">
                <span>{t.pinNumber}</span>
                <span className="text-[10px] text-slate-600">14–16 digits</span>
              </div>
              <div className="font-mono font-black text-blue-900 text-base tracking-widest mt-1 bg-white py-1.5 px-2 rounded border border-slate-800 text-center tabular-nums">
                1234 5678 9012 3456
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border-2 border-slate-900 bg-white">
            <img
              src="/src/assets/images/hero_voucher_illustration_1794218782939.jpg"
              alt="Voucher illustration"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover"
            />
          </div>
        </div>

        <div className="px-5 py-3 bg-amber-50/50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
