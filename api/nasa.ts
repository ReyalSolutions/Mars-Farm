/**
 * Mars Farm - Vercel Serverless Function
 * Secure server-side proxy for NASA Open API calls.
 * Keeps NASA_API_KEY off the browser bundle entirely.
 */

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  // Which NASA endpoint to proxy — passed as ?endpoint=insight_weather | apod | mars_photos
  const endpoint = (req.query?.endpoint as string) || 'insight_weather';

  try {
    let url = '';

    if (endpoint === 'insight_weather') {
      url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
    } else if (endpoint === 'apod') {
      url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
    } else {
      return res.status(400).json({ error: 'Unknown endpoint' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    return res
      .status(upstream.status)
      .setHeader('Content-Type', contentType)
      .send(body);
  } catch (err: any) {
    return res.status(502).json({ error: err?.message || 'Upstream NASA API error' });
  }
}
