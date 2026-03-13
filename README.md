# Flappy Nexus

**Flappy Nexus** is a browser-based Web3 Flappy-style game with an on-chain leaderboard and optional staking flow.

## Features

- **Privy Session Login** for wallet access.
- **Offchain Mode** for casual gameplay.
- **Onchain Mode** to submit score to smart contract.
- **Leaderboard** to view top players.
- **NFT Mint** support for game skin flow.
- **Stake Page** auto-connects wallet from existing Privy session (no manual connect button).

## Play

1. Open: https://flappynexus.vercel.app/
2. Login with Privy.
3. Choose **Play Offchain** or **Play Onchain**.
4. Submit score after game over (onchain mode).
5. Open leaderboard to view ranking.

## Tech Stack

- Frontend: HTML5 Canvas + Vanilla JavaScript + TailwindCSS
- Web3: Ethers.js v5
- Auth: Privy
- Backend verifier: Native Node.js (`http` / `https`)

## Privy Backend Auth (Node.js)

Use the backend verifier to securely validate Privy identity tokens using server-side secrets.

### Frontend env for Vercel / Next.js migration

If you deploy the frontend on Vercel (especially during Next.js migration), expose these as **public** env vars:

- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_PRIVY_CLIENT_ID` (optional)
- `NEXT_PUBLIC_PRIVY_BACKEND_VERIFY_ENDPOINT` (optional, default `/api/privy/verify`)
- `NEXT_PUBLIC_PRIVY_REQUIRE_BACKEND_VERIFY` (`true`/`false`, default `false`)

Why: in browser runtime, non-public env vars are not available to client-side code.

### Setup

```bash
cd backend
cp .env.example .env
node privy-auth-server.js
```

### Environment Variables

- `PORT` (default: `8787`)
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET` (required if `PRIVY_VERIFY_MODE=privy-api`)
- `PRIVY_VERIFY_MODE` (`privy-api` | `jwt-jwks` | `jwt-key`, recommended: `jwt-jwks`)
- `PRIVY_JWKS_URL` (for `jwt-jwks`, default: `https://auth.privy.io/api/v1/apps/<PRIVY_APP_ID>/jwks.json`)
- `PRIVY_VERIFICATION_KEY` (for `jwt-key`, paste full public key from Privy dashboard)
- `PRIVY_VERIFY_URL` (optional for `privy-api`, default: `https://auth.privy.io/api/v1/sessions/verify`)

### JWKS / Public key masukin kemana?

Kalau dari dashboard Privy kamu lihat ini:

- JWKS endpoint: `https://auth.privy.io/api/v1/apps/cmmnuhuc601up0dlbr16yfolt/jwks.json`
- Public key: `-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----`

Masukinnya ke **backend env**, bukan frontend:

- **Recommended (otomatis rotate key):**
  - `PRIVY_VERIFY_MODE=jwt-jwks`
  - `PRIVY_JWKS_URL=https://auth.privy.io/api/v1/apps/cmmnuhuc601up0dlbr16yfolt/jwks.json`
- **Alternatif (manual key):**
  - `PRIVY_VERIFY_MODE=jwt-key`
  - `PRIVY_VERIFICATION_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"`

Di Vercel: **Project → Settings → Environment Variables** (scope backend/api runtime). Jangan expose key ini ke `NEXT_PUBLIC_*`.

### Endpoints

- `GET /api/health`
- `POST /api/privy/verify`

Request body:

```json
{
  "identityToken": "<privy_identity_token>"
}
```

### Security Notes

- Never put `PRIVY_APP_SECRET` in frontend code.
- Frontend should verify session through backend endpoint: `POST /api/privy/verify`.

## Developer

Built by [@0xzvan](https://x.com/0xzvan) for the Web3 gaming community.
