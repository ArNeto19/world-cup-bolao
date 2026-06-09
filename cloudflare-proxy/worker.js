/**
 * Cloudflare Worker — football-data.org CORS proxy
 *
 * Deploy once (free tier: 100k req/day, no credit card needed).
 * After deploy, set WORKER_URL in your .env:
 *   VITE_FOOTBALL_DATA_PROXY=https://your-worker.your-subdomain.workers.dev
 *
 * The worker forwards GET requests to football-data.org adding the
 * API token from the worker's secret (never exposed to the browser).
 *
 * Setup steps:
 *   1. Install Wrangler: npm install -g wrangler
 *   2. Login: wrangler login
 *   3. Add secret: wrangler secret put FOOTBALL_DATA_KEY
 *      (paste your football-data.org token when prompted)
 *   4. Deploy: wrangler deploy
 *   5. Copy the deployed URL to VITE_FOOTBALL_DATA_PROXY in your .env
 */

const FOOTBALL_DATA_BASE = 'https://api.football-data.org';

// Allowed origins — add your Firebase Hosting domain here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://world-cup-bolao.web.app/'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Strip the worker path prefix and forward to football-data.org
    const url = new URL(request.url);
    const targetUrl = `${FOOTBALL_DATA_BASE}${url.pathname}${url.search}`;

    const apiResponse = await fetch(targetUrl, {
      headers: {
        'X-Auth-Token': env.FOOTBALL_DATA_KEY,
        'Content-Type': 'application/json',
      },
    });

    const body = await apiResponse.text();

    return new Response(body, {
      status: apiResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });
  },
};

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
