import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function DiagnosticForm({ onResult, loading, setLoading }) {
  const { t, i18n } = useTranslation();
  const [problem, setProblem] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!problem.trim()) { setError(t('error_empty')); return; }
    setError('');
    setLoading(true);
    try {
      const result = await import('../services/api').then(m =>
        m.diagnose({ problem: problem.trim(), lang: i18n.language, image })
      );
      onResult(result.data, problem.trim());
    } catch {
      setError(t('error_network'));
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <p className="field-label">{t('problem_label')}</p>
      <textarea
        value={problem}
        onChange={e => setProblem(e.target.value)}
        placeholder={t('problem_placeholder')}
        rows={4}
      />

      <div className="upload-zone" onClick={() => fileRef.current.click()}>
        <span className="upload-icon">📷</span>
        <p>{image ? `✓ ${image.name}` : t('photo_label')}</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
      </div>

      {preview && <img src={preview} className="preview-img" alt="preview" />}

      {error && <p className="error-msg">{error}</p>}

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        🔧 {loading ? t('loading') : t('diagnose_btn')}
      </button>
    </div>
  );
}