"use strict";

const http = require("http");
const https = require("https");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";
const PRIVY_VERIFY_URL = process.env.PRIVY_VERIFY_URL || "https://auth.privy.io/api/v1/sessions/verify";
const PRIVY_VERIFY_MODE = (process.env.PRIVY_VERIFY_MODE || "privy-api").toLowerCase();
const PRIVY_JWKS_URL = process.env.PRIVY_JWKS_URL || (PRIVY_APP_ID ? `https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json` : "");
const PRIVY_VERIFICATION_KEY = (process.env.PRIVY_VERIFICATION_KEY || "").replace(/\\n/g, "\n");

let jwksCache = { expiresAt: 0, keysByKid: new Map() };

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

function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function parseJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"));
  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  const signature = base64UrlDecode(encodedSignature);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  return { header, payload, signature, signingInput };
}

function validateTokenTimeClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now >= payload.exp) {
    throw new Error("Token has expired.");
  }
  if (typeof payload.nbf === "number" && now < payload.nbf) {
    throw new Error("Token is not valid yet.");
  }
}

function verifyJwtSignature(signingInput, signature, publicKeyPemOrObject) {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(signingInput);
  verifier.end();
  return verifier.verify(publicKeyPemOrObject, signature);
}

function fetchJson(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.protocol === "https:" ? https : http;
    const req = client.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: "GET",
        timeout: 12000
      },
      res => {
        let responseBody = "";
        res.on("data", chunk => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if ((res.statusCode || 500) < 200 || (res.statusCode || 500) >= 300) {
            return reject(new Error(`HTTP ${res.statusCode || 500} while fetching JSON.`));
          }

          try {
            resolve(responseBody ? JSON.parse(responseBody) : {});
          } catch {
            reject(new Error("Invalid JSON response."));
          }
        });
      }
    );

    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    req.end();
  });
}

async function getJwksKeysByKid() {
  const now = Date.now();
  if (jwksCache.expiresAt > now && jwksCache.keysByKid.size > 0) {
    return jwksCache.keysByKid;
  }

  if (!PRIVY_JWKS_URL) {
    throw new Error("PRIVY_JWKS_URL is not configured.");
  }

  const jwks = await fetchJson(new URL(PRIVY_JWKS_URL));
  const keys = new Map();

  for (const jwk of jwks?.keys || []) {
    if (!jwk?.kid) continue;
    keys.set(jwk.kid, crypto.createPublicKey({ key: jwk, format: "jwk" }));
  }

  if (keys.size === 0) {
    throw new Error("No usable keys found in JWKS response.");
  }

  jwksCache = {
    expiresAt: now + 10 * 60 * 1000,
    keysByKid: keys
  };

  return keys;
}

async function verifyJwtWithJwks(identityToken) {
  const parsed = parseJwt(identityToken);
  if (parsed.header?.alg !== "RS256") {
    throw new Error(`Unsupported JWT alg: ${parsed.header?.alg || "unknown"}`);
  }

  const keysByKid = await getJwksKeysByKid();
  const publicKey = keysByKid.get(parsed.header?.kid);
  if (!publicKey) {
    jwksCache.expiresAt = 0;
    const refreshedKeys = await getJwksKeysByKid();
    const refreshedKey = refreshedKeys.get(parsed.header?.kid);
    if (!refreshedKey) {
      throw new Error("No matching JWKS key for token kid.");
    }
    if (!verifyJwtSignature(parsed.signingInput, parsed.signature, refreshedKey)) {
      throw new Error("Invalid token signature.");
    }
  } else if (!verifyJwtSignature(parsed.signingInput, parsed.signature, publicKey)) {
    throw new Error("Invalid token signature.");
  }

  validateTokenTimeClaims(parsed.payload);
  return {
    ok: true,
    user: parsed.payload?.user || null,
    claims: parsed.payload,
    raw: parsed.payload,
    mode: "jwt-jwks"
  };
}

function verifyJwtWithPublicKey(identityToken) {
  if (!PRIVY_VERIFICATION_KEY) {
    throw new Error("PRIVY_VERIFICATION_KEY is not configured.");
  }

  const parsed = parseJwt(identityToken);
  if (parsed.header?.alg !== "RS256") {
    throw new Error(`Unsupported JWT alg: ${parsed.header?.alg || "unknown"}`);
  }

  if (!verifyJwtSignature(parsed.signingInput, parsed.signature, PRIVY_VERIFICATION_KEY)) {
    throw new Error("Invalid token signature.");
  }

  validateTokenTimeClaims(parsed.payload);
  return {
    ok: true,
    user: parsed.payload?.user || null,
    claims: parsed.payload,
    raw: parsed.payload,
    mode: "jwt-key"
  };
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
    const usingPrivyApi = PRIVY_VERIFY_MODE === "privy-api";
    if (usingPrivyApi && (!PRIVY_APP_ID || !PRIVY_APP_SECRET)) {
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

      if (PRIVY_VERIFY_MODE === "jwt-jwks") {
        const verified = await verifyJwtWithJwks(identityToken);
        return sendJson(res, 200, verified);
      }

      if (PRIVY_VERIFY_MODE === "jwt-key") {
        const verified = verifyJwtWithPublicKey(identityToken);
        return sendJson(res, 200, verified);
      }

      const result = await verifyWithPrivy(identityToken);
      if (!result.ok) {
        return sendJson(res, result.statusCode, {
          ok: false,
          error: "Privy verification failed.",
          details: result.data,
          mode: "privy-api"
        });
      }

      return sendJson(res, 200, {
        ok: true,
        user: result.data?.user || null,
        claims: result.data?.claims || null,
        raw: result.data,
        mode: "privy-api"
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
