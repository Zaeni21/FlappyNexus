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

---

## Privy Backend Auth (Node.js)

Untuk verifikasi auth token Privy secara aman (pakai `PRIVY_APP_SECRET` di server), gunakan backend kecil di folder `backend/` (tanpa dependency npm tambahan).

### Setup

```bash
cd backend
cp .env.example .env
node privy-auth-server.js
```

### Environment Variables

- `PORT` (default: `8787`)
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `PRIVY_VERIFY_URL` (optional, default: `https://auth.privy.io/api/v1/sessions/verify`)

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

Body:

```json
{
  "identityToken": "<token-dari-privy-frontend>"
}
```

> Jangan pernah simpan `PRIVY_APP_SECRET` di frontend.
> Frontend FlappyNexus diarahkan memverifikasi sesi Privy ke endpoint backend `POST /api/privy/verify`.

## Developer

Built by [@0xzvan](https://x.com/0xzvan) for the Web3 gaming community.
