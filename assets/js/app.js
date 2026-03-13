import { gameState } from "./state.js";
import { walletPopupEl } from "./dom.js";
import { beginGame, flap, resizeCanvases, restartGame } from "./game.js";
import { setLanguage, showToast, updateWalletStatus } from "./ui.js";
import { connectWallet, disconnectWallet, distributeRewardsFromContract, mintNFT, showLeaderboard, tryRestorePrivySession } from "./web3.js";
import { initStars } from "./stars.js";

function registerEvents() {
  document.querySelector('[data-action="start-offchain"]').addEventListener("click", () => beginGame(false));
  document.querySelector('[data-action="start-onchain"]').addEventListener("click", () => {
    if (!gameState.isConnected) {
      showToast("Connect Privy first before playing onchain.", "warning");
      return;
    }
    beginGame(true);
  });
  document.querySelector('[data-action="show-leaderboard"]').addEventListener("click", showLeaderboard);
  document.querySelector('[data-action="mint"]').addEventListener("click", mintNFT);

  document.getElementById("walletDisplay").addEventListener("click", async () => {
    if (!gameState.isConnected) {
      await connectWallet();
    } else {
      walletPopupEl.classList.toggle("hidden");
    }
  });

  document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);
  document.getElementById("closeLeaderboardBtn").addEventListener("click", () => {
    document.getElementById("leaderboard-popup").classList.add("hidden");
  });
  document.getElementById("distributeBtn").addEventListener("click", distributeRewardsFromContract);

  window.addEventListener("keydown", event => {
    if (event.code === "Space") {
      event.preventDefault();
      flap();
    }
    if (event.code === "Enter" && gameState.gameOver) {
      restartGame();
    }
  });

  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));
  document.getElementById("lang-id").addEventListener("click", () => setLanguage("id"));

  window.addEventListener("touchstart", flap, { passive: true });
  window.addEventListener("resize", resizeCanvases);
}

function initApp() {
  registerEvents();
  resizeCanvases();
  setLanguage(localStorage.getItem("flappy_lang") || "en");
  updateWalletStatus();
  tryRestorePrivySession();
  initStars();
}

initApp();
