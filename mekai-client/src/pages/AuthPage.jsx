import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth();
  const { i18n } = useTranslation();
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === 'ar';

  const labels = {
    fr: { title_login: 'Connexion', title_reg: 'Créer un compte', name: 'Nom complet', email: 'Email', password: 'Mot de passe', btn_login: 'Se connecter', btn_reg: "S'inscrire", switch_to_reg: "Pas de compte ? S'inscrire", switch_to_login: 'Déjà un compte ? Se connecter' },
    ar: { title_login: 'تسجيل الدخول', title_reg: 'إنشاء حساب', name: 'الاسم الكامل', email: 'البريد الإلكتروني', password: 'كلمة المرور', btn_login: 'دخول', btn_reg: 'إنشاء حساب', switch_to_reg: 'ليس لديك حساب؟ سجل', switch_to_login: 'لديك حساب؟ سجل دخول' },
    en: { title_login: 'Login', title_reg: 'Create account', name: 'Full name', email: 'Email', password: 'Password', btn_login: 'Login', btn_reg: 'Register', switch_to_reg: "No account? Register", switch_to_login: 'Already have an account? Login' },
  };
  const L = labels[i18n.language] || labels.fr;

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">🔧</div>
        <h2 className="auth-title">{mode === 'login' ? L.title_login : L.title_reg}</h2>

        {mode === 'register' && (
          <div className="auth-field">
            <label>{L.name}</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={L.name} />
          </div>
        )}

        <div className="auth-field">
          <label>{L.email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={L.email} />
        </div>

        <div className="auth-field">
          <label>{L.password}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={L.password}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? L.btn_login : L.btn_reg}
        </button>

        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? L.switch_to_reg : L.switch_to_login}
        </button>
      </div>
    </div>
  );
}