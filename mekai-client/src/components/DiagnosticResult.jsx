import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendFollowUp, rateD } from '../services/api';

const DIFF = {
  easy:   { label: { fr:'Facile', ar:'سهل', en:'Easy' }, cls: 'bg-green-900/50 text-green-400 border border-green-800' },
  medium: { label: { fr:'Moyen', ar:'متوسط', en:'Medium' }, cls: 'bg-orange-900/50 text-orange-400 border border-orange-800' },
  hard:   { label: { fr:'Mécanicien requis', ar:'ميكانيكي مطلوب', en:'Mechanic required' }, cls: 'bg-red-900/50 text-red-400 border border-red-800' },
};

const exportPDF = (result, lang) => {
  const LABELS = {
    fr: { title: 'Diagnostic MekAI', diagnosis: 'DIAGNOSTIC', steps: 'ÉTAPES', next: 'SI BLOQUÉ', diff: { easy:'Facile', medium:'Moyen', hard:'Mécanicien requis' } },
    ar: { title: 'تشخيص MekAI', diagnosis: 'التشخيص', steps: 'الخطوات', next: 'إذا توقفت', diff: { easy:'سهل', medium:'متوسط', hard:'ميكانيكي' } },
    en: { title: 'MekAI Diagnosis', diagnosis: 'DIAGNOSIS', steps: 'STEPS', next: 'IF STUCK', diff: { easy:'Easy', medium:'Medium', hard:'Mechanic required' } },
  };
  const L = LABELS[lang] || LABELS.fr;

  const content = `
${L.title}
${'='.repeat(40)}
${L.diagnosis}
${result.diagnosis}

${L.steps}
${(result.steps || []).map((s, i) => `${i+1}. ${s}`).join('\n')}

${L.next}
${result.next_step}

---
Généré par MekAI — ${new Date().toLocaleDateString()}
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mekai-diagnostic-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function DiagnosticResult({ result, diagnosticId, originalProblem, onReset }) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(result.rating || null);

  const diff = DIFF[result.difficulty] || DIFF.medium;
  const diffLabel = diff.label[i18n.language] || diff.label.fr;

  const handleFollowUp = async () => {
    if (!question.trim()) return;
    setSending(true);
    try {
      const res = await sendFollowUp({ id: diagnosticId, question: question.trim(), lang: i18n.language });
      setAnswers(prev => [...prev, { q: question.trim(), a: res.answer }]);
      setQuestion('');
    } catch {
      setAnswers(prev => [...prev, { q: question.trim(), a: t('error_network') }]);
    }
    setSending(false);
  };

  const handleRate = async (r) => {
    setRating(r);
    try { await rateD({ id: diagnosticId, rating: r }); } catch {}
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <span className="font-semibold text-white text-lg">MekAI Diagnostic</span>
        <span className={`text-xs font-semibold px-4 py-1.5 rounded-full border ${diff.cls}`}>{diffLabel}</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Images */}
        {result.imageUrls?.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {result.imageUrls.map((url, i) => (
              <img key={i} src={url} className="w-full h-32 object-cover rounded-xl opacity-90 hover:opacity-100 transition-opacity border border-white/10" alt={`photo ${i+1}`} />
            ))}
          </div>
        )}

        {/* Diagnosis */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t('diagnosis_title')}</p>
          <p className="text-gray-200 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">{result.diagnosis}</p>
        </div>

        {/* Steps */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{t('steps_title')}</p>
          <ol className="space-y-3">
            {(result.steps || []).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-200 pb-3 border-b border-white/5 last:border-0 backdrop-blur-sm bg-white/5 rounded-xl p-3">
                <span className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-lg shadow-orange-600/30">{i+1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Next step */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t('next_step_title')}</p>
          <div className="backdrop-blur-md bg-blue-950/30 border border-blue-800/30 rounded-xl p-4 text-sm text-blue-200 leading-relaxed">
            💡 {result.next_step}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 pt-2">
          <p className="text-xs text-gray-500">
            {i18n.language === 'ar' ? 'هل كان مفيداً؟' : i18n.language === 'en' ? 'Was this helpful?' : 'Utile ?'}
          </p>
          <button onClick={() => handleRate('up')}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${rating === 'up' ? 'bg-green-900/50 border-green-700 text-green-400 shadow-lg shadow-green-600/20' : 'backdrop-blur-md bg-white/5 border-white/10 text-gray-400 hover:border-green-700 hover:text-green-400'}`}>
            👍
          </button>
          <button onClick={() => handleRate('down')}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${rating === 'down' ? 'bg-red-900/50 border-red-700 text-red-400 shadow-lg shadow-red-600/20' : 'backdrop-blur-md bg-white/5 border-white/10 text-gray-400 hover:border-red-700 hover:text-red-400'}`}>
            👎
          </button>
          {/* PDF Export */}
          <button onClick={() => exportPDF(result, i18n.language)}
            className="ml-auto px-4 py-2 rounded-xl text-xs backdrop-blur-md bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all">
            ⬇️ {i18n.language === 'ar' ? 'تحميل' : i18n.language === 'en' ? 'Export' : 'Exporter'}
          </button>
        </div>

        {/* Follow-up answers */}
        {answers.map((item, i) => (
          <div key={i} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500">❓ {item.q}</p>
            <p className="text-sm text-gray-200">🔧 {item.a}</p>
          </div>
        ))}

        {/* Follow-up input */}
        <div className="flex gap-2">
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
            placeholder={t('followup_placeholder')}
            onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
            className="flex-1 backdrop-blur-md bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-sm text-gray-100 px-4 py-2.5 outline-none transition-all placeholder-gray-500" />
          <button onClick={handleFollowUp} disabled={sending}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-600/30">
            {t('send_btn')}
          </button>
        </div>

        <button onClick={onReset}
          className="w-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm py-3 rounded-xl transition-all">
          ↩ {t('new_diagnosis')}
        </button>
      </div>
    </div>
  );
}