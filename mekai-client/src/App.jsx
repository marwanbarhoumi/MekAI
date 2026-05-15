import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import LangSwitcher from './components/LangSwitcher';
import DiagnosticForm from './components/DiagnosticForm';
import DiagnosticResult from './components/DiagnosticResult';
import AuthPage from './pages/AuthPage';
import './App.css';

function MainApp() {
  const { i18n } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [originalProblem, setOriginalProblem] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

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

  if (loading) return <div className="splash">🔧</div>;

  if (showAuth) return <AuthPage onSuccess={() => setShowAuth(false)} />;

  return (
    <div className="app" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">🔧</div>
          <div style={{ flex: 1 }}>
            <h1 className="brand">MekAI</h1>
            <p className="brand-sub">{isRTL ? 'تشخيص ذكي لمشاكل سيارتك' : i18n.language === 'en' ? 'Smart vehicle diagnosis' : 'Diagnostic intelligent pour votre véhicule'}</p>
          </div>
          {user ? (
            <div className="user-pill">
              <span>👤 {user.name}</span>
              <button onClick={logout} className="logout-btn">✕</button>
            </div>
          ) : (
            <button className="login-header-btn" onClick={() => setShowAuth(true)}>
              {isRTL ? 'دخول' : i18n.language === 'en' ? 'Login' : 'Connexion'}
            </button>
          )}
        </header>

        <LangSwitcher />

        {!result ? (
          <DiagnosticForm
            onResult={handleResult}
            loading={diagLoading}
            setLoading={setDiagLoading}
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}