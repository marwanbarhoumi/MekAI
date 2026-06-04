import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LANG_CODE = { fr: 'fr-FR', ar: 'ar-SA', en: 'en-US' };

export default function VoiceInput({ onResult }) {
  const { i18n } = useTranslation();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef(null);

  const LABELS = {
    fr: { start: 'Parler', stop: 'Arrêter', unsupported: 'Navigateur non supporté', listening: 'En écoute...', error_permission: 'Permission microphone refusée', error_network: 'Erreur réseau - utilisez la saisie manuelle', manual_placeholder: 'Tapez votre texte ici...', manual_submit: 'Ajouter' },
    ar: { start: 'تحدث', stop: 'إيقاف', unsupported: 'المتصفح غير مدعوم', listening: 'جاري الاستماع...', error_permission: 'تم رفض إذن الميكروفون', error_network: 'خطأ في الشبكة - استخدم الإدخال اليدوي', manual_placeholder: 'اكتب النص هنا...', manual_submit: 'إضافة' },
    en: { start: 'Speak', stop: 'Stop', unsupported: 'Browser not supported', listening: 'Listening...', error_permission: 'Microphone permission denied', error_network: 'Network error - use manual input', manual_placeholder: 'Type your text here...', manual_submit: 'Add' },
  };
  const L = LABELS[i18n.language] || LABELS.fr;

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { 
      setShowFallback(true);
      setError(L.unsupported); 
      return; 
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = LANG_CODE[i18n.language] || 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => { 
        setListening(true); 
        setError('');
        setShowFallback(false);
      };
      
      recognition.onend = () => {
        setListening(false);
      };
      
      recognition.onerror = (event) => { 
        console.error('Speech recognition error:', event.error);
        setListening(false); 
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError(L.error_permission);
          setShowFallback(true);
        } else if (event.error === 'network') {
          setError(L.error_network);
          setShowFallback(true);
        } else if (event.error === 'no-speech') {
          setError(i18n.language === 'ar' ? 'لم يتم اكتشاف صوت' : 'Aucune parole détectée');
        } else {
          setError(event.error);
          setShowFallback(true);
        }
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
          setError('');
          setShowFallback(false);
        }
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError(L.unsupported);
      setListening(false);
      setShowFallback(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onResult(manualInput.trim());
      setManualInput('');
      setShowFallback(false);
      setError('');
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all shadow-lg w-full ${
          listening
            ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white animate-pulse shadow-red-600/50'
            : 'backdrop-blur-md bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-200 hover:from-purple-600 hover:to-pink-600 hover:border-purple-500 hover:text-white hover:shadow-purple-600/40'
        }`}
      >
        <span className="text-xl">{listening ? '⏹' : '🎤'}</span>
        <span>{listening ? L.stop : L.start}</span>
      </button>

      {listening && (
        <div className="backdrop-blur-xl bg-purple-950/30 border border-purple-800/30 rounded-xl p-3 text-purple-200 text-xs text-center flex items-center justify-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></span>
          {L.listening}
        </div>
      )}

      {error && (
        <div className="backdrop-blur-xl bg-yellow-950/30 border border-yellow-800/30 rounded-xl p-2 text-yellow-300 text-xs text-center">
          ℹ️ {error}
        </div>
      )}

      {showFallback && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder={L.manual_placeholder}
            className="w-full backdrop-blur-md bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg text-gray-100 text-sm px-3 py-2 outline-none transition-all placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-purple-600/30"
          >
            {L.manual_submit}
          </button>
        </div>
      )}
    </div>
  );
}