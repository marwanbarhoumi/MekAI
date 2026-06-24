const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
].filter((m, i, arr) => arr.indexOf(m) === i);

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY manquant dans .env');
  return new GoogleGenerativeAI(apiKey);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (err) => [429, 500, 503].includes(err?.status);
const shouldTryNextModel = (err) => [400, 404].includes(err?.status);

const getRetryDelay = (err, attempt) => {
  const base = err?.status === 429 ? 2000 : BASE_DELAY_MS;
  return base * 2 ** attempt;
};

const generateWithFallback = async (content) => {
  let lastError;

  for (const modelName of MODELS) {
    const model = getGenAI().getGenerativeModel({ model: modelName });

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent(content);
        if (modelName !== MODELS[0] || attempt > 0) {
          console.log(`✅ Gemini: ${modelName}${attempt > 0 ? ` (tentative ${attempt + 1})` : ''}`);
        }
        return result;
      } catch (err) {
        lastError = err;

        if (shouldTryNextModel(err)) {
          console.warn(`⚠️ ${modelName} non supporté (${err.status}), modèle suivant...`);
          break;
        }
        if (!isRetryable(err)) throw err;

        const delay = getRetryDelay(err, attempt);
        console.warn(`⚠️ ${modelName} surchargé (${err.status}), nouvel essai dans ${delay}ms...`);
        await sleep(delay);
      }
    }

    if (shouldTryNextModel(lastError)) continue;
    console.warn(`⚠️ ${modelName} indisponible, passage au modèle suivant...`);
  }

  const err = new Error('Le service IA est surchargé. Réessayez dans quelques instants.');
  err.status = 503;
  throw err;
};

const LANG_LABEL = { fr: 'français', ar: 'arabe', en: 'anglais' };

const SYSTEM_PROMPT = (lang) => `Tu es MekAI, un mécanicien expert avec 20 ans d'expérience en automobile, moto et véhicules lourds.
Tu parles couramment arabe, français et anglais.

RÈGLES :
1. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans markdown
2. Réponds en ${LANG_LABEL[lang] || 'français'}
3. Sois concis, pratique et professionnel
4. Si une photo est fournie, analyse-la et intègre tes observations

FORMAT OBLIGATOIRE :
{"difficulty":"easy|medium|hard","diagnosis":"Explication claire","steps":["Étape 1","Étape 2"],"next_step":"Conseil si bloqué"}

difficulty: easy=réparable seul, medium=un peu d'expérience, hard=mécanicien pro requis`;

const diagnose = async ({ problem, lang = 'fr', imageBase64, mimeType }) => {
  const prompt = SYSTEM_PROMPT(lang) + '\n\nProblème: ' + problem;
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } });
  }

  const result = await generateWithFallback(parts);
  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const followUp = async ({ question, lang = 'fr', originalProblem, previousResult }) => {
  const prompt = `Tu es MekAI, mécanicien expert. Réponds en ${LANG_LABEL[lang] || 'français'}.
Problème original: "${originalProblem}"
Diagnostic: ${JSON.stringify(previousResult)}
Question: "${question}"
Réponds courts et pratique, texte simple.`;

  const result = await generateWithFallback(prompt);
  return result.response.text().trim();
};

module.exports = { diagnose, followUp };
