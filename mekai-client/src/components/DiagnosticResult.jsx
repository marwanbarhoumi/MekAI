import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendFollowUp } from '../services/api';

const DIFF_CLASS = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };

export default function DiagnosticResult({ result, diagnosticId,  onReset }) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [sending, setSending] = useState(false);

  const diffLabel = {
    easy: t('difficulty_easy'),
    medium: t('difficulty_medium'),
    hard: t('difficulty_hard'),
  }[result.difficulty] || result.difficulty;

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

  return (
    <div className="result-card">
      {/* Header */}
      <div className="result-header">
        <span className="result-title">MekAI</span>
        <span className={`badge ${DIFF_CLASS[result.difficulty]}`}>{diffLabel}</span>
      </div>

      <div className="result-body">
        {/* Diagnosis */}
        <p className="section-label">{t('diagnosis_title')}</p>
        <p className="diagnosis-text">{result.diagnosis}</p>

        {/* Steps */}
        <p className="section-label">{t('steps_title')}</p>
        <ol className="steps-list">
          {result.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>

        {/* Next step */}
        <p className="section-label">{t('next_step_title')}</p>
        <div className="next-step-box">
          💡 {result.next_step}
        </div>

        {/* Follow-up answers */}
        {answers.map((item, i) => (
          <div key={i} className="followup-answer">
            <p className="followup-q">❓ {item.q}</p>
            <p className="followup-a">🔧 {item.a}</p>
          </div>
        ))}

        {/* Follow-up input */}
        <div className="followup-row">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={t('followup_placeholder')}
            onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
          />
          <button onClick={handleFollowUp} disabled={sending}>
            {t('send_btn')}
          </button>
        </div>

        <button className="reset-btn" onClick={onReset}>
          ↩ {t('new_diagnosis')}
        </button>
      </div>
    </div>
  );
}