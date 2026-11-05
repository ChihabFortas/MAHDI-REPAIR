/* AI business advisor for Mahdi Repair.
   The browser sends a compact summary of the shop's numbers (no customer names/phones); this function checks that the
   caller is an active manager/admin, adds the Anthropic API key (kept as a secret, never in the web page) and returns the answer. */
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
admin.initializeApp();
const KEY = defineSecret('ANTHROPIC_API_KEY');
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const LANG = {en: 'English', fr: 'French', ar: 'Arabic'};
const SYSTEM = (lang) => `You are the business advisor of "Mahdi Repair", a small phone/tablet/laptop repair and electronics sales shop in Algeria (it also has an online shop and sells to wholesale clients).
You receive a JSON summary of the shop's current numbers (current month vs previous month, open repair tickets by stage, alerts).
Rules:
- Answer ONLY in ${LANG[lang] || 'English'}. Be practical, concrete and short (max ~250 words unless asked for more). Plain text, short paragraphs or a few bullet lines; no tables, no markdown headings.
- Base every statement on the numbers given. Never invent figures. If data is missing say so and say what to record to know it.
- Prioritise: first what is going wrong and what to do today (delays in reception, diagnosis, repair, waiting for approval or parts, uncollected devices, unpaid money), then ideas to increase sales and margin, then how to manage the team and stock.
- Give actions the owner can do this week (call customers, change an offer, reorder a part, rebalance technicians, adjust prices), with the reason.
- Currency amounts are in the shop's currency; do not convert.`;

exports.advisor = onCall({secrets: [KEY], region: 'europe-west1', timeoutSeconds: 90, memory: '256MiB', cors: true, maxInstances: 5}, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  const u = await admin.firestore().doc('users/' + req.auth.uid).get();
  const p = u.exists ? u.data() : null;
  if (!p || p.active !== true || !['manager', 'admin'].includes(p.role)) throw new HttpsError('permission-denied', 'Managers and admins only.');
  const d = req.data || {};
  const lang = LANG[d.lang] ? d.lang : 'en';
  const facts = JSON.stringify(d.facts || {});
  if (facts.length > 30000) throw new HttpsError('invalid-argument', 'Data too large.');
  const q = String(d.question || '').slice(0, 1500).trim() ||
    'Write the monthly executive summary: what is going well, what is going wrong, and the 5 most important actions for the next 7 days.';
  const hist = Array.isArray(d.history) ? d.history.slice(-6).map(m => ({role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 2000)})) : [];
  while (hist.length && hist[0].role !== 'user') hist.shift();
  const messages = [...hist, {role: 'user', content: 'SHOP DATA (JSON):\n' + facts + '\n\nQUESTION:\n' + q}];
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {'content-type': 'application/json', 'x-api-key': KEY.value(), 'anthropic-version': '2023-06-01'},
    body: JSON.stringify({model: MODEL, max_tokens: 1200, system: SYSTEM(lang), messages})
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('anthropic', r.status, JSON.stringify(j).slice(0, 400));
    throw new HttpsError('internal', 'AI service error (' + r.status + '). Check the API key and model name.');
  }
  const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return {text};
});
