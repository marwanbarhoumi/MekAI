const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = SYSTEM_PROMPT(lang) + '\n\nProblème: ' + problem;
  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } });
  }
  const result = await model.generateContent(parts);
  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const followUp = async ({ question, lang = 'fr', originalProblem, previousResult }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Tu es MekAI, mécanicien expert. Réponds en ${LANG_LABEL[lang] || 'français'}.
Problème original: "${originalProblem}"
Diagnostic: ${JSON.stringify(previousResult)}
Question: "${question}"
Réponds courts et pratique, texte simple.`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { diagnose, followUp };