import React from 'react';
import { X, Clock } from 'lucide-react';
import { TranslationBundle } from '../i18n/translations.ts';

interface TimeframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules?: Array<{ duration: string; product: string }>;
  t: TranslationBundle;
}

export const TimeframeModal: React.FC<TimeframeModalProps> = ({ isOpen, onClose, rules, t }) => {
  if (!isOpen) return null;

  const defaultRules = rules && rules.length > 0 ? rules : [
    { duration: '5 minutes', product: 'Indonesia Indosat/XL/PLN' },
    { duration: '1 minute', product: 'All Telkomsel product' },
    { duration: '5 minutes', product: 'Indonesia Three' },
    { duration: '15 minutes', product: 'Indonesia SmartFren' },
    { duration: '5 minutes', product: 'Indonesia Alfamart' },
  ];

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
            <Clock className="w-4 h-4 text-blue-800" />
            <h3 className="font-bold font-display text-slate-900 text-sm">
              {t.productTimeFrame}
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
          <p className="text-xs text-slate-700 leading-relaxed">
            {t.timeFrameIntro}
          </p>

          <div className="overflow-x-auto rounded-xl border-2 border-slate-900 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50 border-b-2 border-slate-900 text-slate-900 font-bold font-display">
                <tr>
                  <th className="p-3 text-center">{t.timeFrameColHeader}</th>
                  <th className="p-3 border-l-2 border-slate-900">{t.productColHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {defaultRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-2.5 text-center font-mono font-bold text-blue-800 tabular-nums">
                      {rule.duration}
                    </td>
                    <td className="p-2.5 text-slate-800 border-l border-slate-200 font-medium">
                      {rule.product}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
