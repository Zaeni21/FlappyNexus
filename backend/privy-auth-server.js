"use strict";

const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";
const PRIVY_VERIFY_URL = process.env.PRIVY_VERIFY_URL || "https://auth.privy.io/api/v1/sessions/verify";

if (!PRIVY_APP_ID) {
  console.warn("[privy-auth] Missing PRIVY_APP_ID environment variable.");
}
if (!PRIVY_APP_SECRET) {
  console.warn("[privy-auth] Missing PRIVY_APP_SECRET environment variable.");
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function getPrivyBasicAuthHeader() {
  const creds = `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function verifyWithPrivy(identityToken) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(PRIVY_VERIFY_URL);
    const client = targetUrl.protocol === "https:" ? https : http;
    const body = JSON.stringify({ identity_token: identityToken });

    const req = client.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: getPrivyBasicAuthHeader()
        },
        timeout: 12000
      },
      res => {
        let responseBody = "";
        res.on("data", chunk => {
          responseBody += chunk;
        });
        res.on("end", () => {
          let parsed;
          try {
            parsed = responseBody ? JSON.parse(responseBody) : {};
          } catch {
            parsed = { raw: responseBody };
          }

          resolve({
            statusCode: res.statusCode || 500,
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            data: parsed
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Privy request timed out"));
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, { ok: false, error: "Invalid request." });
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && parsedUrl.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "privy-auth",
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === "POST" && parsedUrl.pathname === "/api/privy/verify") {
    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
      return sendJson(res, 500, {
        ok: false,
        error: "Server misconfigured: PRIVY_APP_ID / PRIVY_APP_SECRET is required."
      });
    }

    try {
      const rawBody = await readRequestBody(req);
      const body = rawBody ? JSON.parse(rawBody) : {};
      const identityToken = body?.identityToken;

      if (!identityToken || typeof identityToken !== "string") {
        return sendJson(res, 400, {
          ok: false,
          error: "identityToken (string) is required in request body."
        });
      }

      const result = await verifyWithPrivy(identityToken);

      if (!result.ok) {
        return sendJson(res, result.statusCode, {
          ok: false,
          error: "Privy verification failed.",
          details: result.data
        });
      }

      return sendJson(res, 200, {
        ok: true,
        user: result.data?.user || null,
        claims: result.data?.claims || null,
        raw: result.data
      });
    } catch (error) {
      if (error.message === "Payload too large") {
        return sendJson(res, 413, { ok: false, error: "Payload too large." });
      }
      if (error instanceof SyntaxError) {
        return sendJson(res, 400, { ok: false, error: "Invalid JSON body." });
      }

      console.error("[privy-auth] verification error:", error);
      return sendJson(res, 502, {
        ok: false,
        error: "Failed to reach Privy verify endpoint.",
        message: error.message
      });
    }
  }

  return sendJson(res, 404, { ok: false, error: "Route not found." });
});

server.listen(PORT, () => {
  console.log(`[privy-auth] running on http://localhost:${PORT}`);
});
