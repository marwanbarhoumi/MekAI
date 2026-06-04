import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';

export default function DiagnosticForm({ onResult, loading, setLoading }) {
  const { t, i18n } = useTranslation();
  const [problem, setProblem] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!problem.trim()) { setError(t('error_empty')); return; }
    setError('');
    setLoading(true);
    try {
      const { diagnose } = await import('../services/api');
      const result = await diagnose({ problem: problem.trim(), lang: i18n.language, images });
      onResult(result.data, problem.trim());
    } catch {
      setError(t('error_network'));
    }
    setLoading(false);
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 shadow-2xl">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{t('problem_label')}</p>

      <textarea
        value={problem}
        onChange={e => setProblem(e.target.value)}
        placeholder={t('problem_placeholder')}
        rows={4}
        className="w-full backdrop-blur-md bg-white/5 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-gray-100 text-sm px-4 py-3 outline-none resize-y transition-all placeholder-gray-500"
      />

      {/* Voice input */}
      <div className="mt-3">
        <VoiceInput onResult={(text) => setProblem(prev => prev ? prev + ' ' + text : text)} />
      </div>

      {/* Upload zone */}
      <div onClick={() => fileRef.current.click()}
        className="mt-4 border-2 border-dashed border-white/10 hover:border-orange-500 hover:bg-orange-600/5 rounded-xl p-6 text-center cursor-pointer transition-all group">
        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📷</span>
        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
          {images.length > 0 ? `✓ ${images.length} photo${images.length > 1 ? 's' : ''}` : t('photo_label')}
          <span className="text-gray-600 text-xs block mt-1">max 4 photos</span>
        </p>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} hidden />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} className="w-full h-32 object-cover rounded-xl border border-white/10" alt={`preview ${i+1}`} />
              <button onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-8 h-8 backdrop-blur-md bg-black/70 hover:bg-red-600 text-white rounded-full text-sm transition-all opacity-0 group-hover:opacity-100">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3 flex items-center gap-2">⚠️ {error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full mt-5 py-3.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:scale-[1.02] active:scale-[0.98]">
        🔧 {loading ? t('loading') : t('diagnose_btn')}
      </button>
    </div>
  );
}