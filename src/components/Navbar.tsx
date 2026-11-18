import React from 'react';
import { Globe, Sparkles, ChevronDown } from 'lucide-react';

interface NavbarProps {
  activeTab: 'redeem' | 'checkStatus' | 'help' | 'products' | 'codes' | 'system';
  setActiveTab: (tab: 'redeem' | 'checkStatus' | 'help' | 'products' | 'codes' | 'system') => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  onOpenQuickTest: () => void;
  onOpenTimeframe: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLang,
  setSelectedLang,
  onOpenQuickTest,
  onOpenTimeframe,
}) => {
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);

  const LANGUAGES = [
    { code: 'EN', label: 'English' },
    { code: 'ID', label: 'Bahasa Indonesia' },
    { code: 'HI', label: 'हिंदी' },
    { code: 'AR', label: 'العربية' },
    { code: 'NE', label: 'नेपाली' },
    { code: 'BN', label: 'বাঙালি' },
  ];

  const currentLangLabel = LANGUAGES.find((l) => l.code === selectedLang)?.label || 'Bahasa Indonesia';

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark as on xlbagus.com ("BAGUS Indokat") */}
        <button
          onClick={() => setActiveTab('redeem')}
          className="text-xl font-extrabold tracking-tight text-blue-950 font-display whitespace-nowrap shrink-0 hover:text-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-xs shadow-xs rotate-[-2deg]">
            XL
          </span>
          <span className="font-bold">Jansen Redem</span>
        </button>

        {/* Zone 2: Exact nav links of default xlbagus: Redeem, Check Status, Help, Time Frame */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'redeem'
                ? 'text-blue-700 font-bold border-b-2 border-blue-700'
                : 'hover:text-slate-900'
            }`}
          >
            Redeem
          </button>
          <button
            onClick={() => setActiveTab('checkStatus')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'checkStatus'
                ? 'text-blue-700 font-bold border-b-2 border-blue-700'
                : 'hover:text-slate-900'
            }`}
          >
            Check Status
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
              activeTab === 'help'
                ? 'text-blue-700 font-bold border-b-2 border-blue-700'
                : 'hover:text-slate-900'
            }`}
          >
            Help
          </button>
          <button
            onClick={onOpenTimeframe}
            className="hover:text-blue-700 text-slate-500 whitespace-nowrap shrink-0 transition-colors"
          >
            Product Time Frame
          </button>
        </nav>

        {/* Zone 3: Language Selector & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language dropdown as on xlbagus */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-amber-900/15 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 transition-colors ${
                      selectedLang === l.code ? 'font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenQuickTest}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:scale-95 transition-all shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Uji Preset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
