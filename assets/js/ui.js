import { translations } from "./constants.js";
import { gameState } from "./state.js";
import { scoreEl, toastEl, walletStatusEl, walletTextEl } from "./dom.js";

export function setLanguage(lang) {
  const dictionary = translations[lang] || translations.id;
  document.documentElement.lang = lang === "en" ? "en" : "id";
  Object.entries(dictionary).forEach(([key, value]) => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(node => {
      node.innerHTML = value;
    });
  });
  localStorage.setItem("flappy_lang", lang);
}

export function showToast(message, tone = "info") {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden", "text-red-300", "text-green-300", "text-yellow-300");

  if (tone === "error") toastEl.classList.add("text-red-300");
  if (tone === "success") toastEl.classList.add("text-green-300");
  if (tone === "warning") toastEl.classList.add("text-yellow-300");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.add("hidden"), 2500);
}

export function updateScore() {
  scoreEl.textContent = `Score: ${gameState.score}`;
}

export function updateWalletStatus() {
  if (gameState.isConnected && gameState.walletAddress) {
    walletStatusEl.classList.remove("bg-gray-500");
    walletStatusEl.classList.add("bg-blue-500");
    walletTextEl.textContent = `${gameState.walletAddress.slice(0, 6)}...${gameState.walletAddress.slice(-3)}`;
    return;
  }

  walletStatusEl.classList.remove("bg-blue-500");
  walletStatusEl.classList.add("bg-gray-500");
  walletTextEl.textContent = translations[localStorage.getItem("flappy_lang") || "id"].wallet_connect;
}
