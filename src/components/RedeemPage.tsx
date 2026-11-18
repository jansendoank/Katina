import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { TimeframeModal } from './TimeframeModal.tsx';
import { TutorialModal } from './TutorialModal.tsx';
import { PinInquiryData } from '../types/xlbagus.ts';
import { TranslationBundle, LangCode } from '../i18n/translations.ts';

interface RedeemPageProps {
  selectedLang: LangCode;
  t: TranslationBundle;
  accessNumbers: string[];
  timeframeRules: Array<{ duration: string; product: string }>;
}

interface ProductOption {
  name: string;
  telcoCode: string;
}

interface CountryOption {
  value: string;
  label: string;
}

export const RedeemPage: React.FC<RedeemPageProps> = ({
  selectedLang,
  t,
  accessNumbers,
  timeframeRules,
}) => {
  const [pinNumber, setPinNumber] = useState('');
  const [country, setCountry] = useState<string>('-1');
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [countryDisabled, setCountryDisabled] = useState(true);
  const [mobilePrefix, setMobilePrefix] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [product, setProduct] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [yourMobileNumber, setYourMobileNumber] = useState('');

  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'error' | 'success' | 'warning' } | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<{
    message: string;
    transactionId?: string;
    recipientMobile: string;
    product: string;
    usedDate: string;
  } | null>(null);

  const [showTimeframe, setShowTimeframe] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastInquiredPin, setLastInquiredPin] = useState('');

  const cleanDigits = (v: string) => v.replace(/\D/g, '');

  // Reset alert when language changes
  useEffect(() => {
    setAlertMessage(null);
  }, [selectedLang]);

  const parseCountryOptions = (rawCountry: string | null, rawDenom: string | null): CountryOption[] => {
    if (!rawCountry) return [];
    const countries = rawCountry.split('|');
    const denoms = (rawDenom || '').split('|');
    const grouped = new Map<string, string[]>();

    countries.forEach((c, idx) => {
      const formatted = c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();
      if (!formatted) return;
      const d = denoms[idx] ? denoms[idx].trim() : '';
      const existing = grouped.get(formatted) || [];
      if (d && !existing.includes(d)) existing.push(d);
      grouped.set(formatted, existing);
    });

    return Array.from(grouped.entries()).map(([name, denomList]) => ({
      value: denomList.length > 0 ? `${name}|${denomList.join(' / ')}` : name,
      label: name,
    }));
  };

  const handlePinInquiry = async (forceCheck = false) => {
    const rawPin = cleanDigits(pinNumber);
    if (!rawPin || rawPin.length < 10) {
      if (forceCheck && pinNumber.trim().length > 0) {
        setAlertMessage({ text: 'Pin number must be at least 10 numeric digits.', type: 'error' });
      }
      return;
    }
    if (!forceCheck && rawPin === lastInquiredPin) return;

    setLastInquiredPin(rawPin);
    setIsCheckingPin(true);
    setAlertMessage(null);
    setRedemptionResult(null);

    try {
      const res = await fetch('/api/xlbagus/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinNumber: rawPin,
          lang: selectedLang,
          mode: 'auto',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PinInquiryData = await res.json();

      if (data.responseCode !== '200') {
        setAlertMessage({
          text: data.description || `Response Code: ${data.responseCode}`,
          type: data.responseCode === '301' || data.responseCode === '302' ? 'warning' : 'error',
        });
        setCountryOptions([]);
        setCountry('-1');
        setCountryDisabled(true);
        setMobilePrefix('');
        setProductOptions([]);
        setProduct('');
      } else {
        const opts = parseCountryOptions(data.country || 'INDONESIA', data.denomination);
        setCountryOptions(opts);
        setCountryDisabled(false);
        if (opts.length === 1) {
          setCountry(opts[0].value);
          fetchPrefix(opts[0].label);
        } else {
          setCountry('-1');
        }
      }
    } catch (err) {
      setAlertMessage({
        text: (err as Error).message || 'An error occurred.',
        type: 'error',
      });
    } finally {
      setIsCheckingPin(false);
    }
  };

  const fetchPrefix = async (cName: string) => {
    try {
      const res = await fetch('/api/xlbagus/prefix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: cName, lang: selectedLang }),
      });
      const data = await res.json();
      const prefix = data.prefix || '62';
      setMobilePrefix(prefix);
      if (mobileNumber.trim()) {
        fetchProducts(prefix, mobileNumber, cName);
      }
    } catch {
      setMobilePrefix('62');
    }
  };

  const fetchProducts = async (prefixVal: string, mobileVal: string, countryName: string) => {
    const rawPin = cleanDigits(pinNumber);
    const cleanMobile = cleanDigits(mobileVal);
    if (!rawPin || rawPin.length < 10 || !cleanMobile || !prefixVal) return;

    setIsFetchingProducts(true);
    try {
      const res = await fetch('/api/xlbagus/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinNumber: rawPin,
          mobileNumber: cleanMobile,
          country: countryName || 'INDONESIA',
          lang: selectedLang,
          mode: 'auto',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProductOptions(data.products || []);
      }
    } catch {
      // ignore
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setProductOptions([]);
    setProduct('');
    if (val === '-1') {
      setMobilePrefix('');
      return;
    }
    const cName = val.split('|')[0].trim();
    fetchPrefix(cName);
  };

  const handleMobileNumberBlur = () => {
    if (country === '-1' || !mobileNumber.trim()) return;
    const cName = country.split('|')[0].trim();
    fetchProducts(mobilePrefix || '62', mobileNumber, cName);
  };

  const handleBeforeConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPin = cleanDigits(pinNumber);
    const cleanMobile = cleanDigits(mobileNumber);

    if (!rawPin) {
      setAlertMessage({ text: 'Empty Pin Number', type: 'error' });
      return;
    }
    if (country === '-1') {
      setAlertMessage({ text: 'Please select Country', type: 'error' });
      return;
    }
    if (!cleanMobile) {
      setAlertMessage({ text: 'Empty Mobile Number', type: 'error' });
      return;
    }
    if (!product || product === '-1') {
      setAlertMessage({ text: 'Empty Product', type: 'error' });
      return;
    }

    setAlertMessage(null);
    setShowConfirmModal(true);
  };

  const executeRedeemSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setAlertMessage(null);

    const rawPin = cleanDigits(pinNumber);
    const cleanMobile = cleanDigits(mobileNumber);
    const selectedProductObj = productOptions.find((p) => (p.telcoCode || p.name) === product);

    try {
      const res = await fetch('/api/xlbagus/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinNumber: rawPin,
          country: country.split('|')[0].trim(),
          mobilePrefix: mobilePrefix || '62',
          mobileNumber: cleanMobile,
          product: selectedProductObj ? selectedProductObj.name : product,
          yourMobileNumber: cleanDigits(yourMobileNumber),
          lang: selectedLang,
          mode: 'auto',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redemption failed');

      setRedemptionResult(data);
      setAlertMessage({
        text: data.message,
        type: data.success ? 'success' : 'error',
      });
    } catch (err) {
      setAlertMessage({
        text: (err as Error).message || 'An error occurred.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPinNumber('');
    setLastInquiredPin('');
    setCountry('-1');
    setCountryOptions([]);
    setCountryDisabled(true);
    setMobilePrefix('');
    setMobileNumber('');
    setProduct('');
    setProductOptions([]);
    setYourMobileNumber('');
    setAlertMessage(null);
    setRedemptionResult(null);
  };

  return (
    <div className="space-y-4">
      <TimeframeModal
        isOpen={showTimeframe}
        onClose={() => setShowTimeframe(false)}
        rules={timeframeRules}
        t={t}
      />
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        t={t}
      />

      {/* Confirmation Modal (replaces browser confirm('Are you sure?')) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_#1e293b] max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold font-display text-slate-900 text-base">
              {t.areYouSure}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.confirmDesc}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t.confirmCancel}
              </button>
              <button
                type="button"
                onClick={executeRedeemSubmit}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
              >
                {t.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* #msg: Exact alternative access numbers notice from default xlbagus.com */}
      <div
        id="msg"
        className="p-3.5 rounded-xl bg-amber-50/90 border-2 border-slate-900/80 text-xs text-slate-900 space-y-1.5"
      >
        <p className="leading-relaxed font-medium">{t.redeemNotice}</p>
        <ol className="list-decimal list-inside font-mono font-bold text-blue-900 space-y-0.5">
          {accessNumbers.map((num, idx) => (
            <li key={idx}>{num}</li>
          ))}
        </ol>
      </div>

      {/* #redeem-form: Exact input sequence of default xlbagus.com */}
      <form id="redeem-form" onSubmit={handleBeforeConfirm} className="space-y-4">
        {/* 1. Pin Number */}
        <fieldset className="space-y-1">
          <div className="flex items-center justify-between">
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
            </label>
            {isCheckingPin && (
              <span className="text-[11px] text-blue-700 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
              </span>
            )}
          </div>
          <input
            id="PinNumber"
            name="PinNumber"
            type="text"
            maxLength={50}
            tabIndex={1}
            value={pinNumber}
            onChange={(e) => {
              setPinNumber(e.target.value);
              if (alertMessage) setAlertMessage(null);
            }}
            onBlur={() => handlePinInquiry(false)}
            placeholder={t.pinPlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* 2. Country */}
        <fieldset className="space-y-1">
          <label htmlFor="Country" className="block text-xs font-bold text-slate-900">
            {t.country}
          </label>
          <select
            id="Country"
            name="Country"
            tabIndex={2}
            disabled={countryDisabled}
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="-1">{t.selectCountry}</option>
            {countryOptions.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </fieldset>

        {/* 3. Mobile Number with Prefix Addon */}
        <fieldset className="space-y-1">
          <label htmlFor="MobileNumber" className="block text-xs font-bold text-slate-900">
            {t.mobileNumber}
          </label>
          <div className="flex rounded-xl overflow-hidden border-2 border-slate-300 focus-within:border-blue-700 bg-[#FFFDF9] focus-within:bg-white transition-colors">
            <input
              id="MobileNumberPreFix"
              name="MobileNumberPreFix"
              type="text"
              readOnly
              tabIndex={3}
              value={mobilePrefix}
              placeholder="62"
              className="w-14 text-center text-sm font-mono font-bold bg-amber-50/80 border-r-2 border-slate-300 text-slate-800 py-2.5 focus:outline-none select-none"
            />
            <input
              id="MobileNumber"
              name="MobileNumber"
              type="text"
              tabIndex={4}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              onBlur={handleMobileNumberBlur}
              placeholder={t.mobilePlaceholder}
              className="w-full text-sm font-mono px-3.5 py-2.5 bg-transparent focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </fieldset>

        {/* 4. Product + (Product Time Frame) link */}
        <fieldset className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="Product" className="text-xs font-bold text-slate-900">
              {t.product}
            </label>
            <button
              type="button"
              id="popup-link"
              onClick={() => setShowTimeframe(true)}
              className="text-xs text-blue-700 hover:text-blue-900 underline font-medium"
            >
              ({t.productTimeFrame})
            </button>
          </div>
          <div className="relative">
            <select
              id="Product"
              name="Product"
              tabIndex={5}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="">{t.selectProduct}</option>
              {productOptions.map((opt, idx) => (
                <option key={idx} value={opt.telcoCode || opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
            {isFetchingProducts && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-700 absolute right-8 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </fieldset>

        {/* 5. Your Mobile Number (To receive top up status) */}
        <fieldset className="space-y-1">
          <label htmlFor="YourMobileNumber" className="block text-xs font-bold text-slate-900">
            <span>{t.yourMobileNumber}</span>{' '}
            <small className="text-slate-500 font-normal">{t.toReceiveTopUpStatus}</small>
          </label>
          <input
            id="YourMobileNumber"
            name="YourMobileNumber"
            type="text"
            tabIndex={6}
            value={yourMobileNumber}
            onChange={(e) => setYourMobileNumber(e.target.value)}
            placeholder={t.mobilePlaceholder}
            className="w-full text-sm font-mono px-3.5 py-2.5 bg-[#FFFDF9] border-2 border-slate-300 rounded-xl focus:border-blue-700 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
          />
        </fieldset>

        {/* 6. Alert / CodeDesc feedback */}
        {alertMessage && (
          <div
            className={`p-3 rounded-xl text-xs border-2 flex items-start gap-2 ${
              alertMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-700'
                : alertMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-700'
                : 'bg-rose-50 text-rose-900 border-rose-700'
            }`}
          >
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{alertMessage.text}</span>
          </div>
        )}

        {/* 7. Submit & Reset Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="submit"
            id="btn_Submit"
            name="Command"
            value="Submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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

      {/* Output Summary on Redeem Submission */}
      {redemptionResult && (
        <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-slate-900 text-xs space-y-1.5">
          <div className="font-bold text-emerald-900">{redemptionResult.message}</div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
            <div>
              <span className="text-slate-500">TransactionID: </span>
              <span className="font-mono font-bold text-slate-900">{redemptionResult.transactionId}</span>
            </div>
            <div>
              <span className="text-slate-500">Mobile: </span>
              <span className="font-mono font-bold text-slate-900">{redemptionResult.recipientMobile}</span>
            </div>
            <div>
              <span className="text-slate-500">Product: </span>
              <span className="font-semibold text-slate-900">{redemptionResult.product}</span>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <span className="font-medium text-slate-900">{redemptionResult.usedDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
