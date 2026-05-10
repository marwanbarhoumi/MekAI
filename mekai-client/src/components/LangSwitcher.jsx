import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function LangSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-bar">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${i18n.language === l.code ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}