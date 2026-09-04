/**
 * Mars Farm - Vercel Serverless Function
 * Secure server-side proxy for OpenAI / Gemini / OpenRouter API calls.
 * Protects secret API keys from being exposed to the browser client.
 */

export default async function handler(req: any, res: any) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Read private server-side environment variables
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    '';

  // GET: Health / Status check (returns status without exposing keys)
  if (req.method === 'GET') {
    const isLive = Boolean(apiKey && apiKey.trim().length > 0);
    const provider = apiKey.startsWith('sk-or-')
      ? 'OPENROUTER'
      : apiKey.startsWith('AIza')
      ? 'GEMINI'
      : isLive
      ? 'OPENAI'
      : 'HEURISTIC';

    const label = isLive
      ? apiKey.startsWith('sk-or-')
        ? 'LIVE AI: MINIMAX M3'
        : apiKey.startsWith('AIza')
        ? 'LIVE AI: GEMINI'
        : 'LIVE AI: OPENAI'
      : 'DETERMINISTIC HEURISTIC ENGINE';

    const modelName = apiKey.startsWith('sk-or-')
      ? 'minimax/minimax-m3:free'
      : apiKey.startsWith('AIza')
      ? 'gemini-1.5-flash'
      : isLive
      ? 'gpt-4o-mini'
      : 'NASA AgriSim v2.6 Analytical Matrix';

    return res.status(200).json({
      isLive,
      provider,
      label,
      modelName,
    });
  }

  // POST: Execute AI Farmer consultation
  if (req.method === 'POST') {
    if (!apiKey || apiKey.trim().length === 0) {
      return res.status(503).json({
        error: 'API key not configured on server',
        fallback: true,
      });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { question, config, projection, suitability } = body || {};

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question parameter is required' });
      }

      // Build structured NASA agronomy system prompt
      const location = config?.selectedLocationId || 'jezero_crater';
      const systemPrompt = `You are Farmer AI, NASA's Lead Astrobiologist & Closed-Loop Agronomy Systems Architect for Mars Exploration.
Your role is to DEEPLY ANALYZE every user prompt using rigorous NASA aerospace telemetry and botany principles.

CURRENT MISSION TELEMETRY:
- Landing Site: ${location}
- Astronaut Crew: ${config?.crewSize || 4} astronauts
- Mission Target: ${config?.missionDays || 500} sols
- Farm Area: ${config?.farmAreaM2 || 120} m² (${projection?.totalAllocatedAreaM2 || 0} m² cultivated, ${projection?.remainingAreaM2 || 0} m² reserve)
- Calorie Coverage: ${projection?.projectedCaloricCoveragePercent || 0}% (${(projection?.estimatedDailyCaloriesProducedKcal || 0).toLocaleString()} produced vs ${(projection?.crewDailyCaloricRequirementKcal || 0).toLocaleString()} kcal/day demanded)
- Net Daily Water Drain: ${projection?.netDailyWaterDrainL || 0} L/day (Water Storage Reserve: ${config?.waterReserveLiters || 5000} L)
- Power Reserve: ${config?.dailyEnergyBudgetKwh || 150} kWh/day
- Suitability Score: ${suitability?.overallScore || 80}/100

INSTRUCTIONS:
1. Directly analyze the user's specific request or question.
2. If they mention numbers (e.g. crew size, farm area, duration), run explicit mathematical and nutritional calculations.
3. If they ask about specific crops (potatoes, lettuce, wheat, tomatoes, soybeans, carrots), compare their yield (kcal/m²), water footprint (L/kg), and growth days.
4. Give a clear Feasibility Verdict (e.g. ✅ FEASIBLE, ⚠️ MARGINAL / HIGH RISK, ❌ CRITICAL DEFICIT).
5. Provide 2-3 specific, actionable recommendations for their farm builder or mission strategy.
6. Keep the format concise, well-structured, professional, with bold highlights and emojis.`;

      const candidateModels = apiKey.startsWith('sk-or-')
        ? ['minimax/minimax-m3:free', 'openai/gpt-4o-mini']
        : ['gpt-4o-mini'];

      const endpoint = apiKey.startsWith('sk-or-')
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      let textResult = '';
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://marsfarm.space',
              'X-Title': 'MarsFarm NASA Space Apps',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question },
              ],
              max_tokens: 600,
              temperature: 0.65,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (apiRes.ok) {
            const data: any = await apiRes.json();
            const text = data.choices?.[0]?.message?.content;
            if (text && text.trim().length > 0) {
              textResult = text.trim();
              break;
            }
          }
        } catch (e) {
          console.warn(`[MarsFarm API] Model ${model} attempt error:`, e);
        }
      }

      if (textResult) {
        return res.status(200).json({
          answer: textResult,
          confidence: 0.98,
          source: 'LIVE_LLM',
        });
      }

      return res.status(502).json({
        error: 'Upstream AI model returned no content',
        fallback: true,
      });
    } catch (err: any) {
      console.error('[MarsFarm API] Handler error:', err);
      return res.status(500).json({
        error: err?.message || 'Internal Server Error',
        fallback: true,
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
