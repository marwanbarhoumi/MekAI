import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import LangSwitcher from './components/LangSwitcher';
import DiagnosticForm from './components/DiagnosticForm';
import DiagnosticResult from './components/DiagnosticResult';
import './App.css';

export default function App() {
  const { i18n } = useTranslation();
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [originalProblem, setOriginalProblem] = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === 'ar';

  const handleResult = (data, problem) => {
    setResult(data);
    setDiagnosticId(data.id);
    setOriginalProblem(problem);
  };

  const handleReset = () => {
    setResult(null);
    setDiagnosticId(null);
    setOriginalProblem('');
  };

  return (
    <div className="app" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">🔧</div>
          <div>
            <h1 className="brand">MekAI</h1>
            <p className="brand-sub">{i18n.language === 'ar' ? 'تشخيص ذكي لمشاكل سيارتك' : i18n.language === 'en' ? 'Smart vehicle diagnosis' : 'Diagnostic intelligent pour votre véhicule'}</p>
          </div>
        </header>

        <LangSwitcher />

        {!result ? (
          <DiagnosticForm
            onResult={handleResult}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <DiagnosticResult
            result={result}
            diagnosticId={diagnosticId}
            originalProblem={originalProblem}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}