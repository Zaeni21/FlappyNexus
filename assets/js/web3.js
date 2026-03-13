import { abi, adminAddress, contractAddress, flappyNftAddress } from "./constants.js";
import { gameState } from "./state.js";
import { walletPopupEl } from "./dom.js";
import { setLanguage, showToast, updateWalletStatus } from "./ui.js";

const { ethers } = window;
const PRIVY_APP_ID = window.PRIVY_APP_ID || "cmmnuhuc601up0dlbr16yfolt";
const PRIVY_CLIENT_ID = window.PRIVY_CLIENT_ID || "";
const PRIVY_BACKEND_VERIFY_ENDPOINT = "/api/privy/verify";

let privyClient = null;

async function waitForPrivySdk(maxWaitMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    if (window.Privy && typeof window.Privy.create === "function") return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Privy SDK failed to load.");
}

async function initPrivy() {
  if (privyClient) return privyClient;
  if (!PRIVY_APP_ID) throw new Error("Privy APP ID is not configured.");
  await waitForPrivySdk();
  privyClient = window.Privy.create({ appId: PRIVY_APP_ID, clientId: PRIVY_CLIENT_ID || undefined });
  return privyClient;
}

const privyReadyPromise = initPrivy().catch(error => {
  console.error("Privy init error:", error?.message || error);
  throw error;
});

function getPrivyIdentityToken(loginResult, privy) {
  return (
    loginResult?.identityToken ||
    loginResult?.identity_token ||
    loginResult?.idToken ||
    loginResult?.token ||
    privy?.user?.idToken ||
    privy?.session?.identityToken ||
    ""
  );
}

async function verifyPrivySessionOnBackend(identityToken) {
  if (!identityToken) throw new Error("Privy identity token not found.");

  const response = await fetch(PRIVY_BACKEND_VERIFY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identityToken })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Verifikasi session Privy ke backend gagal.");
  }

  return payload;
}

export function getEthersProvider() {
  const providerSource = gameState.privyProvider;
  if (!providerSource) throw new Error("Privy wallet provider is not active. Please connect Privy first.");
  return new ethers.providers.Web3Provider(providerSource);
}

async function applyPrivySession(privy, loginResult = null) {
  const identityToken = getPrivyIdentityToken(loginResult, privy);
  if (identityToken) {
    await verifyPrivySessionOnBackend(identityToken);
  }

  const providerFromPrivy = await (privy?.wallets?.ethereum?.getProvider?.() || null);
  if (!providerFromPrivy) throw new Error("Privy wallet provider is unavailable.");

  const provider = new ethers.providers.Web3Provider(providerFromPrivy);
  const connectedAddress = loginResult?.wallet?.address || privy?.user?.wallet?.address;
  const signerAddress = connectedAddress || await provider.getSigner().getAddress();

  gameState.privyProvider = provider.provider;
  gameState.walletAddress = signerAddress;
  gameState.isConnected = true;
  setLanguage(localStorage.getItem("flappy_lang") || "en");
  updateWalletStatus();
  walletPopupEl.classList.remove("hidden");
}

export async function tryRestorePrivySession() {
  try {
    const privy = await privyReadyPromise;
    const providerFromPrivy = await (privy?.wallets?.ethereum?.getProvider?.() || null);
    const existingAddress = privy?.user?.wallet?.address;
    if (!providerFromPrivy || !existingAddress) return;

    await applyPrivySession(privy, { wallet: { address: existingAddress } });
    showToast("Privy session restored.", "success");
  } catch (error) {
    console.warn("Privy restore skipped:", error?.message || error);
  }
}

export async function connectWallet() {
  try {
    const privy = await privyReadyPromise;
    const loginResult = await privy.login();
    await applyPrivySession(privy, loginResult);
    showToast("Privy connected. Ready for onchain play!", "success");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Failed to connect Privy.", "error");
  }
}

export async function disconnectWallet() {
  try {
    const privy = await privyReadyPromise;
    await privy?.logout?.();
  } catch (error) {
    console.warn("Privy logout warning:", error?.message || error);
  }

  gameState.isConnected = false;
  gameState.walletAddress = null;
  gameState.privyProvider = null;
  walletPopupEl.classList.add("hidden");
  setLanguage(localStorage.getItem("flappy_lang") || "en");
  updateWalletStatus();
  showToast("Wallet disconnected.");
}

export async function submitScoreOnchain(score) {
  const provider = getEthersProvider();
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const hash = ethers.utils.solidityKeccak256(["address", "uint256"], [address, score]);
  const signature = await signer.signMessage(ethers.utils.arrayify(hash));
  const { v, r, s } = ethers.utils.splitSignature(signature);

  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.submitScore(score, v, r, s);
  await tx.wait();
  showToast("Score submitted to blockchain successfully.", "success");
}

export async function showLeaderboard() {
  try {
    const provider = getEthersProvider();
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const players = await contract.getTopPlayers();

    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";

    let userAddress = "";
    try {
      userAddress = await provider.getSigner().getAddress();
    } catch (_) {
      userAddress = "";
    }

    players.forEach((player, index) => {
      const item = document.createElement("li");
      const shortAddr = `${player.addr.slice(0, 6)}...${player.addr.slice(-4)}`;
      item.textContent = `${index + 1}. ${shortAddr} - ${player.score}`;

      if (userAddress && player.addr.toLowerCase() === userAddress.toLowerCase()) {
        item.classList.add("text-cyan-300", "font-bold");
      }

      leaderboardList.appendChild(item);
    });

    document.getElementById("leaderboard-popup").classList.remove("hidden");
    const adminSection = document.getElementById("admin-distribute");
    adminSection.classList.toggle("hidden", userAddress.toLowerCase() !== adminAddress.toLowerCase());
  } catch (error) {
    console.error("Leaderboard error:", error);
    showToast("Failed to load leaderboard.", "error");
  }
}

export async function distributeRewardsFromContract() {
  try {
    const provider = getEthersProvider();
    const signer = provider.getSigner();
    const wallet = await signer.getAddress();

    if (wallet.toLowerCase() !== adminAddress.toLowerCase()) {
      showToast("Only admin can distribute rewards.", "error");
      return;
    }

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.distributeRewards({ value: ethers.utils.parseEther("5") });
    await tx.wait();
    showToast("Rewards distributed successfully.", "success");
  } catch (error) {
    console.error(error);
    showToast(`Distribution failed: ${error.message}`, "error");
  }
}

export async function mintNFT() {
  if (!gameState.isConnected) {
    showToast("Connect Privy first to mint NFT.", "warning");
    return;
  }

  try {
    const provider = getEthersProvider();
    const signer = provider.getSigner();

    const contract = new ethers.Contract(flappyNftAddress, ["function mint() public"], signer);
    const tx = await contract.mint();
    await tx.wait();
    showToast("NFT minted successfully!", "success");
  } catch (error) {
    console.error(error);
    showToast(`Minting failed: ${error.message}`, "error");
  }
}
