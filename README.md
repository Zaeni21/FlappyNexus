# Flappy Nexus

**Flappy Nexus** is a browser-based Web3 game featuring an onchain leaderboard. Players can choose to play in **offchain** or **onchain** mode, and submit their high scores directly to the blockchain!

## Features

- **Connect Wallet**: Supports EVM wallets like MetaMask and OKX Wallet.
- **Play Offchain**: Casual mode without blockchain interaction.
- **Play Onchain**: Compete for the top score onchain.
- **Submit Score**: Send your score to the smart contract.
- **Leaderboard**: Displays the top 10 highest scoring players.
- **Mint Skin**: (Optional) Allows players to mint and use NFT skins.

## How to Play

1. Open the site: https://flappynexus.vercel.app/
2. Click **Connect Wallet** to start onchain mode.
3. Choose **Play Onchain** or **Play Offchain**.
4. After the game ends, click **Submit Score** to record your score.
5. Open the **Leaderboard** to see your rank!

## Smart Contract

- **Network**: Testnet or Mainnet
- **Contract Address**: `0x...` *(Replace with actual address)*
- **Key Functions**:
  - `submitScore(uint256 score)`
  - `getTopPlayers()`

## Weekly Rewards

The top 10 players each week will receive token rewards:

| Rank | Reward |
|------|--------|
| 1    | 20%    |
| 2    | 15%    |
| 3    | 13%    |
| 4    | 11%    |
| 5    | 10%    |
| 6    | 9%     |
| 7    | 7%     |
| 8    | 6%     |
| 9    | 5%     |
| 10   | 4%     |

> Rewards are distributed manually or via smart contract.

## Tech Stack
- Frontend: HTML5 Canvas, JavaScript, TailwindCSS
- Web3: Ethers.js v6 (update kalau masih v5)
- Smart Contract: Solidity ^0.8.0 on Nexus Chain
- Deploy: Vercel (https://flappynexus.vercel.app/)

## Live Demo
Play now: https://flappynexus.vercel.app/

## Developer & Contributions

Feel free to fork, clone, or submit a PR. Built by [@0xzvan](https://x.com/0xzvan) for the Web3 gaming community.

---
