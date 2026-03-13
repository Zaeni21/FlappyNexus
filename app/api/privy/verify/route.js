import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { NextResponse } from "next/server";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=");
    if (!key || process.env[key] !== undefined) return;
    process.env[key] = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  });
}

loadDotEnv();

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";
const PRIVY_VERIFY_URL = process.env.PRIVY_VERIFY_URL || "https://auth.privy.io/api/v1/sessions/verify";

function getPrivyBasicAuthHeader() {
  const creds = `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

async function verifyWithPrivy(identityToken) {
  const url = new URL(PRIVY_VERIFY_URL);
  const client = url.protocol === "https:" ? https : http;
  const body = JSON.stringify({ identity_token: identityToken });

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: getPrivyBasicAuthHeader(),
        },
        timeout: 12000,
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
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
            data: parsed,
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

export async function POST(request) {
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured: PRIVY_APP_ID / PRIVY_APP_SECRET is required." },
      { status: 500 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const identityToken = body?.identityToken;
  if (!identityToken || typeof identityToken !== "string") {
    return NextResponse.json({ ok: false, error: "identityToken (string) is required in request body." }, { status: 400 });
  }

  try {
    const result = await verifyWithPrivy(identityToken);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "Privy verification failed.", details: result.data },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({ ok: true, user: result.data.user || null, claims: result.data.claims || null, raw: result.data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to reach Privy verify endpoint.", message: error.message },
      { status: 502 }
    );
  }
}
