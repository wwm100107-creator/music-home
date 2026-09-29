const UPDATE_PATH = "/_link/update";
const STATE_OBJECT_NAME = "music-home-current-origin";
const QUICK_TUNNEL_HOST = /^[a-z0-9-]+\.trycloudflare\.com$/;

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getStateObject(env) {
  const id = env.LINK_STATE.idFromName(STATE_OBJECT_NAME);
  return env.LINK_STATE.get(id);
}

async function readCurrentOrigin(env) {
  const response = await getStateObject(env).fetch(
    "https://link-state.internal/origin",
  );
  if (!response.ok) throw new Error("Link state is unavailable");
  const state = await response.json();
  return typeof state.origin === "string" ? state.origin : null;
}

async function writeCurrentOrigin(env, origin) {
  const response = await getStateObject(env).fetch(
    "https://link-state.internal/origin",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin }),
    },
  );
  if (!response.ok) throw new Error("Could not update link state");
}

function validateQuickTunnelOrigin(value) {
  if (typeof value !== "string" || value.length > 256) return null;

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    !QUICK_TUNNEL_HOST.test(parsed.hostname)
  ) {
    return null;
  }

  return parsed.origin;
}

function unavailableResponse() {
  return new Response(
    "<!doctype html><html lang=\"vi\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Music Home đang khởi động</title><body style=\"font:16px system-ui,sans-serif;max-width:38rem;margin:12vh auto;padding:1.5rem;color:#173b2a;background:#f5f3e6\"><h1>Music Home đang khởi động</h1><p>Máy chủ đang kết nối lại. Vui lòng tải lại trang sau ít phút.</p></body></html>",
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "Retry-After": "10",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === UPDATE_PATH) {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      if (!env.UPDATE_SECRET) {
        return jsonResponse({ error: "Link relay is not configured" }, 503);
      }

      if (request.headers.get("Authorization") !== `Bearer ${env.UPDATE_SECRET}`) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      let payload;
      try {
        const body = await request.text();
        if (body.length > 512) return jsonResponse({ error: "Payload too large" }, 413);
        payload = JSON.parse(body);
      } catch {
        return jsonResponse({ error: "Invalid JSON" }, 400);
      }

      if (!payload || !Object.hasOwn(payload, "origin")) {
        return jsonResponse({ error: "Missing origin" }, 400);
      }

      let origin = null;
      if (payload.origin !== null) {
        origin = validateQuickTunnelOrigin(payload.origin);
        if (!origin) {
          return jsonResponse({ error: "Only a trycloudflare.com HTTPS origin is accepted" }, 400);
        }
      }

      try {
        await writeCurrentOrigin(env, origin);
        return jsonResponse({ ok: true, active: origin !== null });
      } catch {
        return jsonResponse({ error: "Could not save the active link" }, 503);
      }
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
      });
    }

    let origin;
    try {
      origin = await readCurrentOrigin(env);
    } catch {
      return unavailableResponse();
    }

    if (!origin) return unavailableResponse();

    const destination = new URL(origin);
    destination.pathname = requestUrl.pathname;
    destination.search = requestUrl.search;
    return new Response(null, {
      status: 307,
      headers: {
        Location: destination.href,
        "Cache-Control": "no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
      },
    });
  },
};

export class LinkState {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname !== "/origin") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method === "GET") {
      const origin = (await this.ctx.storage.get("origin")) ?? null;
      return jsonResponse({ origin });
    }

    if (request.method === "PUT") {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON" }, 400);
      }

      if (payload.origin === null) {
        await this.ctx.storage.delete("origin");
      } else if (typeof payload.origin === "string") {
        await this.ctx.storage.put("origin", payload.origin);
      } else {
        return jsonResponse({ error: "Invalid origin" }, 400);
      }

      return jsonResponse({ ok: true });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, PUT" },
    });
  }
};
