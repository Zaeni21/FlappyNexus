export const contractAddress = "0xFeAEe9a44e45F4a8275BffCCC5E03b712aA407D0";
export const adminAddress = "0x58c5796edc7001b949693cc2655D190db54c271F";
export const flappyNftAddress = "0xAA66da7322Aa663EFC4594C4825eB82E8D400021";

export const abi = [
  { inputs: [], name: "distributeRewards", outputs: [], stateMutability: "payable", type: "function" },
  {
    inputs: [],
    name: "getTopPlayers",
    outputs: [{
      components: [
        { internalType: "address", name: "addr", type: "address" },
        { internalType: "uint256", name: "score", type: "uint256" }
      ],
      internalType: "struct FlappyScore.Player[]",
      name: "",
      type: "tuple[]"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "score", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" }
    ],
    name: "submitScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const translations = {
  en: {
    wallet_connect: "Connect Privy", tagline: "WEB3 ARCADE EXPERIENCE", subtitle: "Build the highest score, then submit to onchain leaderboard.",
    play_offchain: "Play Offchain", play_onchain: "Play Onchain", leaderboard: "Leaderboard", mint: "Mint NFT Skin",
    tip: 'Tip: press <span class="font-semibold text-gray-200">Space</span> / tap screen to fly.'
  },
  id: {
    wallet_connect: "Connect Privy", tagline: "WEB3 ARCADE EXPERIENCE", subtitle: "Build score setinggi mungkin, lalu submit ke onchain leaderboard.",
    play_offchain: "Main Offchain", play_onchain: "Main Onchain", leaderboard: "Papan Skor", mint: "Mint NFT Skin",
    tip: 'Tips: tekan <span class="font-semibold text-gray-200">Space</span> / tap layar untuk terbang.'
  }
};
