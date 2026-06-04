import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/api';

const DIFF = {
  easy:   { label: { fr:'Facile', ar:'سهل', en:'Easy' }, cls: 'bg-green-900/50 text-green-400 border border-green-800' },
  medium: { label: { fr:'Moyen', ar:'متوسط', en:'Medium' }, cls: 'bg-orange-900/50 text-orange-400 border border-orange-800' },
  hard:   { label: { fr:'Mécanicien', ar:'ميكانيكي', en:'Mechanic' }, cls: 'bg-red-900/50 text-red-400 border border-red-800' },
};

const formatDate = (dateStr, lang) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function HistoriquePage({ onBack, onReopen }) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isRTL = i18n.language === 'ar';

  const LABELS = {
    fr: { title: 'Historique', empty: 'Aucun diagnostic pour le moment.', back: 'Retour', reopen: 'Voir', login_required: 'Connectez-vous pour voir votre historique.' },
    ar: { title: 'السجل', empty: 'لا يوجد تشخيص بعد.', back: 'رجوع', reopen: 'عرض', login_required: 'سجل دخولك لرؤية سجلك.' },
    en: { title: 'History', empty: 'No diagnostics yet.', back: 'Back', reopen: 'View', login_required: 'Login to see your history.' },
  };
  const L = LABELS[i18n.language] || LABELS.fr;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getHistory(user.id)
      .then(res => setItems(res.data || []))
      .catch(() => setError('Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}
            className="w-9 h-9 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            {isRTL ? '→' : '←'}
          </button>
          <h1 className="text-xl font-bold">📋 {L.title}</h1>
        </div>

        {/* Not logged in */}
        {!user && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center text-gray-500">
            🔒 {L.login_required}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 animate-pulse">
                <div className="h-3 bg-[#2a2a2a] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#2a2a2a] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Empty */}
        {!loading && user && items.length === 0 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center text-gray-500">
            🔧 {L.empty}
          </div>
        )}

        {/* List */}
        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => {
              const diff = DIFF[item.difficulty] || DIFF.medium;
              const diffLabel = diff.label[i18n.language] || diff.label.fr;
              return (
                <div key={item._id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-2xl p-4 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{item.problem}</p>
                      {item.diagnosis && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.diagnosis}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-2">{formatDate(item.createdAt, i18n.language)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diff.cls}`}>{diffLabel}</span>
                      {onReopen && (
                        <button onClick={() => onReopen(item)}
                          className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
                          {L.reopen} →
                        </button>
                      )}
                    </div>
                  </div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="panne" className="mt-3 w-full max-h-32 object-cover rounded-xl opacity-70" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}