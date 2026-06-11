/**
 * Cloudflare Worker — football-data.org CORS proxy
 *
 * To update after editing:
 *   cd cloudflare-proxy && wrangler deploy
 */

const FOOTBALL_DATA_BASE = "https://api.football-data.org";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") ?? "*";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const targetUrl = `${FOOTBALL_DATA_BASE}${url.pathname}${url.search}`;

    let apiResponse;
    try {
      apiResponse = await fetch(targetUrl, {
        headers: {
          "X-Auth-Token": env.FOOTBALL_DATA_KEY,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Upstream fetch failed", detail: String(err) }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        },
      );
    }

    const body = await apiResponse.text();

    return new Response(body, {
      status: apiResponse.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  },
};

function corsHeaders(origin) {
  return {
    // Reflect the request origin back — allows any domain.
    // The API key is protected server-side in the Worker secret,
    // so there is no security risk in allowing all origins here.
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
