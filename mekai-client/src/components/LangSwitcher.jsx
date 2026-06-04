import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function LangSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-2 justify-center">
      {LANGS.map((l) => (
        <button key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
            i18n.language === l.code
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-500 shadow-lg shadow-orange-600/30 scale-105'
              : 'backdrop-blur-md bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105'
          }`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}