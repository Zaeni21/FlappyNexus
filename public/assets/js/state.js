export const gameState = {
  onchain: false,
  isConnected: false,
  walletAddress: null,
  gameStarted: false,
  gameOver: false,
  score: 0,
  frame: 0,
  pipes: [],
  privyProvider: null
};

export const bird = { x: 80, y: 180, width: 52, height: 52, velocity: 0, gravity: 0.065, lift: -2.2 };
export const pipeGap = 170;
export const pipeWidth = 60;

export const birdImage = new Image();
birdImage.src = "https://ipfs.io/ipfs/bafybeielnggeoq3acfq2kpr7mm2ofkhovwppowxllfaev6ke47rwsde3k4";

export const pipeImage = new Image();
pipeImage.src = "https://gateway.pinata.cloud/ipfs/bafkreicbretqtvephhgmcr7rb57rjxxubbpkxie5bl7ycm5wciqf7bjlsi";
