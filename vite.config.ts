import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function advisorDevPlugin() {
  return {
    name: 'advisor-dev-server',
    configureServer(server: any) {
      server.middlewares.use('/api/advisor', async (req: any, res: any) => {
        const env = loadEnv('', process.cwd(), '');
        const apiKey =
          env.OPENAI_API_KEY ||
          env.GEMINI_API_KEY ||
          env.OPENROUTER_API_KEY ||
          process.env.OPENAI_API_KEY ||
          '';

        res.setHeader('Content-Type', 'application/json');

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

          res.statusCode = 200;
          res.end(JSON.stringify({ isLive, provider, label, modelName }));
          return;
        }

        if (req.method === 'POST') {
          if (!apiKey || apiKey.trim().length === 0) {
            res.statusCode = 503;
            res.end(JSON.stringify({ error: 'API key not configured', fallback: true }));
            return;
          }

          let bodyStr = '';
          req.on('data', (chunk: any) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { question, config, projection, suitability } = body;

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
                  console.warn(`[Local Dev] Model ${model} error:`, e);
                }
              }

              if (textResult) {
                res.statusCode = 200;
                res.end(JSON.stringify({ answer: textResult, confidence: 0.98, source: 'LIVE_LLM' }));
                return;
              }

              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'LLM returned empty response', fallback: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Server error', fallback: true }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      });
    },
  };
}

function nasaDevPlugin() {
  return {
    name: 'nasa-dev-server',
    configureServer(server: any) {
      server.middlewares.use('/api/nasa', async (req: any, res: any) => {
        const env = loadEnv('', process.cwd(), '');
        const apiKey =
          env.NASA_API_KEY ||
          process.env.NASA_API_KEY ||
          'DEMO_KEY';

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const urlObj = new URL(req.url || '', 'http://localhost');
        const endpoint = urlObj.searchParams.get('endpoint') || 'insight_weather';

        let upstreamUrl = '';
        if (endpoint === 'insight_weather') {
          upstreamUrl = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
        } else if (endpoint === 'apod') {
          upstreamUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Unknown endpoint' }));
          return;
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const upstream = await fetch(upstreamUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          const body = await upstream.text();
          res.statusCode = upstream.status;
          res.end(body);
        } catch (err: any) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: err?.message || 'NASA API error' }));
        }
      });
    },
  };
}


export default defineConfig({
  plugins: [react(), advisorDevPlugin(), nasaDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
