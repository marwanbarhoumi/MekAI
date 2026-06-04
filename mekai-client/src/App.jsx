import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import LangSwitcher from './components/LangSwitcher';
import DiagnosticForm from './components/DiagnosticForm';
import DiagnosticResult from './components/DiagnosticResult';
import AuthPage from './pages/AuthPage';
import HistoriquePage from './pages/HistoriquePage';
import GarageNearby from './pages/GarageNearby';
import './index.css';

function MainApp() {
  const { i18n } = useTranslation();
  const { user, loading, logout } = useAuth();
  const [result, setResult] = useState(null);
  const [diagnosticId, setDiagnosticId] = useState(null);
  const [originalProblem, setOriginalProblem] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [page, setPage] = useState('home');
  const isRTL = i18n.language === 'ar';

  const NAV = {
    fr: { history: 'Historique', login: 'Connexion', garages: 'Garages' },
    ar: { history: 'السجل', login: 'دخول', garages: 'ورشات' },
    en: { history: 'History', login: 'Login', garages: 'Garages' },
  };
  const N = NAV[i18n.language] || NAV.fr;

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-4xl">🔧</div>;
  if (page === 'auth') return <AuthPage onSuccess={() => setPage('home')} />;
  if (page === 'history') return <HistoriquePage onBack={() => setPage('home')} onReopen={(item) => { setResult(item); setDiagnosticId(item._id); setOriginalProblem(item.problem); setPage('home'); }} />;
  if (page === 'garages') return <GarageNearby onBack={() => setPage('home')} />;

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-[#0f0f0f] to-gray-950 -z-10"></div>
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920')] bg-cover bg-center opacity-5 -z-10"></div>
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse -z-10" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 px-4 py-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Professional Header */}
          <header className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-orange-500/50 transform hover:scale-110 transition-transform">
                  🔧
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MekAI</h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {isRTL ? 'تشخيص ذكي لمشاكل سيارتك' : i18n.language === 'en' ? 'AI-Powered Vehicle Diagnostics' : 'Diagnostic intelligent par IA'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setPage('garages')}
                  className="text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all">
                  🗺️ {N.garages}
                </button>
                {user && (
                  <button onClick={() => setPage('history')}
                    className="text-sm backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-xl transition-all">
                    📋 {N.history}
                  </button>
                )}
                {user ? (
                  <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-200">
                    <span>👤 {user.name.split(' ')[0]}</span>
                    <button onClick={logout} className="text-gray-500 hover:text-red-400 text-xs ml-2">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setPage('auth')}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all shadow-lg shadow-orange-600/30">
                    {N.login}
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="mb-6">
            <LangSwitcher />
          </div>

          {!result ? (
            <DiagnosticForm onResult={(data, problem) => { setResult(data); setDiagnosticId(data.id); setOriginalProblem(problem); }} loading={diagLoading} setLoading={setDiagLoading} />
          ) : (
            <DiagnosticResult result={result} diagnosticId={diagnosticId} originalProblem={originalProblem} onReset={() => { setResult(null); setDiagnosticId(null); setOriginalProblem(''); }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}