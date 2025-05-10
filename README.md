# Flappy Landak

**Flappy Landak** is a browser-based Web3 game featuring an onchain leaderboard. Players can choose to play in **offchain** or **onchain** mode, and submit their high scores directly to the blockchain!

## Features

- **Connect Wallet**: Supports EVM wallets like MetaMask and OKX Wallet.
- **Play Offchain**: Casual mode without blockchain interaction.
- **Play Onchain**: Compete for the top score onchain.
- **Submit Score**: Send your score to the smart contract.
- **Leaderboard**: Displays the top 10 highest scoring players.
- **Mint Skin**: (Optional) Allows players to mint and use NFT skins.

## How to Play

1. Open the site: [https://ikiepep.vercel.app](https://ikiepep.vercel.app)
2. Click **Connect Wallet** to start onchain mode.
3. Choose **Play Onchain** or **Play Offchain**.
4. After the game ends, click **Submit Score** to record your score.
5. Open the **Leaderboard** to see your rank!

## Smart Contract

- **Network**: Monad Testnet
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

- HTML5 Canvas Game Engine
- JavaScript + Ethers.js
- TailwindCSS for UI
- Solidity (on Monad Testnet)
- Deployed with Vercel

## Developer & Contributions

Feel free to fork, clone, or submit a PR. Built by [@JAWIRNFT](https://twitter.com/JAWIRNFT) for the Web3 gaming community.

---
