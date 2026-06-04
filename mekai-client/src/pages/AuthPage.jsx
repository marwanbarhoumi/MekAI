import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const LABELS = {
  fr: { title_login:'Connexion', title_reg:"Créer un compte", name:'Nom complet', email:'Email', password:'Mot de passe', btn_login:'Se connecter', btn_reg:"S'inscrire", switch_to_reg:"Pas de compte ? S'inscrire", switch_to_login:'Déjà un compte ? Se connecter' },
  ar: { title_login:'تسجيل الدخول', title_reg:'إنشاء حساب', name:'الاسم الكامل', email:'البريد الإلكتروني', password:'كلمة المرور', btn_login:'دخول', btn_reg:'إنشاء حساب', switch_to_reg:'ليس لديك حساب؟ سجل', switch_to_login:'لديك حساب؟ سجل دخول' },
  en: { title_login:'Login', title_reg:'Create account', name:'Full name', email:'Email', password:'Password', btn_login:'Login', btn_reg:'Register', switch_to_reg:'No account? Register', switch_to_login:'Already have an account? Login' },
};

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth();
  const { i18n } = useTranslation();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === 'ar';
  const L = LABELS[i18n.language] || LABELS.fr;

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (mode === 'register' && !name)) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      mode === 'login' ? await login(email, password) : await register(name, email, password);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-[#0f0f0f] to-gray-950 -z-10"></div>
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed bottom-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse -z-10" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md backdrop-blur-2xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-5xl text-center mb-3 animate-float">🔧</div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center mb-8">
          {mode === 'login' ? L.title_login : L.title_reg}
        </h2>

        {mode === 'register' && (
          <div className="mb-5">
            <label className="block text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">{L.name}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={L.name}
              className="w-full backdrop-blur-md bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-gray-100 text-sm px-4 py-3 outline-none transition-all placeholder-gray-500" />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">{L.email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={L.email}
            className="w-full backdrop-blur-md bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-gray-100 text-sm px-4 py-3 outline-none transition-all placeholder-gray-500" />
        </div>

        <div className="mb-5">
          <label className="block text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">{L.password}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={L.password}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full backdrop-blur-md bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-gray-100 text-sm px-4 py-3 outline-none transition-all placeholder-gray-500" />
        </div>

        {error && (
          <div className="backdrop-blur-xl bg-red-950/30 border border-red-800/30 rounded-xl p-3 text-red-300 text-sm text-center mb-5 flex items-center justify-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all mb-4 shadow-2xl shadow-orange-600/40 hover:shadow-orange-600/60 hover:scale-[1.02] active:scale-[0.98]">
          {loading ? '⏳' : mode === 'login' ? L.btn_login : L.btn_reg}
        </button>

        <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full text-orange-400 hover:text-orange-300 text-sm text-center bg-transparent border-none cursor-pointer font-medium transition-colors">
          {mode === 'login' ? L.switch_to_reg : L.switch_to_login}
        </button>
      </div>
    </div>
  );
}