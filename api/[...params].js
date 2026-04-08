const RAILWAY_URL = 'https://sourcebot-production.up.railway.app';

export default async function handler(req, res) {
  const params = req.query.params || [];
  const path = Array.isArray(params) ? params.join('/') : params;
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const targetUrl = `${RAILWAY_URL}/api/${path}${query}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(502).json({ error: 'Backend unavailable', details: error.message });
  }
}
