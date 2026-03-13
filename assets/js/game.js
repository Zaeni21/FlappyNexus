import { bgMusicEl, gameCanvas, gameCtx, hudEl, modeSelectionEl, socialFooterEl, starBgEl, starfieldEl } from "./dom.js";
import { bird, birdImage, gameState, pipeGap, pipeImage, pipeWidth } from "./state.js";
import { showToast, updateScore } from "./ui.js";
import { submitScoreOnchain } from "./web3.js";

export function resizeCanvases() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
  if (!gameState.gameStarted) {
    bird.y = gameCanvas.height / 2;
  }
}

function drawBird() {
  if (birdImage.complete) {
    gameCtx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
  }
}

function drawPipes() {
  gameState.pipes.forEach(pipe => {
    if (pipeImage.complete) {
      gameCtx.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.top);
      gameCtx.drawImage(pipeImage, pipe.x, gameCanvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    }
  });
}

function spawnPipe() {
  const top = Math.random() * (gameCanvas.height - pipeGap - 200) + 60;
  const bottom = gameCanvas.height - top - pipeGap;
  gameState.pipes.push({ x: gameCanvas.width, top, bottom, padding: 10 });
}

function hasCollision(pipe) {
  const collidesHorizontally = bird.x < pipe.x + pipeWidth - pipe.padding && bird.x + bird.width > pipe.x + pipe.padding;
  const collidesVertically = bird.y < pipe.top || bird.y + bird.height > gameCanvas.height - pipe.bottom;
  return collidesHorizontally && collidesVertically;
}

function updateGame() {
  if (gameState.gameOver || !gameState.gameStarted) return;

  gameState.frame += 1;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (gameState.frame % 145 === 0) spawnPipe();

  for (let i = gameState.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = gameState.pipes[i];
    pipe.x -= 1.32;

    if (pipe.x + pipeWidth < 0) {
      gameState.pipes.splice(i, 1);
      gameState.score += 1;
      updateScore();
      continue;
    }

    if (hasCollision(pipe)) {
      showGameOver();
      return;
    }
  }

  if (bird.y + bird.height > gameCanvas.height || bird.y < 0) {
    showGameOver();
    return;
  }

  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawBird();
  drawPipes();
  requestAnimationFrame(updateGame);
}

function showGameOver() {
  if (gameState.gameOver) return;
  gameState.gameOver = true;
  bgMusicEl.pause();

  const overlay = document.createElement("div");
  overlay.id = "gameOverOverlay";
  overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-6";

  const submitButton = gameState.onchain
    ? '<button id="submitBtn" class="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-bold">Submit Score</button>'
    : "";

  overlay.innerHTML = `
    <div class="glass-panel rounded-2xl px-8 py-7 text-center max-w-sm w-full">
      <h2 class="text-3xl font-extrabold mb-2">Game Over</h2>
      <p class="text-gray-200 mb-6">Final Score: <span class="font-bold">${gameState.score}</span></p>
      <div class="flex justify-center gap-3">
        <button id="restartBtn" class="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-bold">Play Again</button>
        ${submitButton}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById("restartBtn").addEventListener("click", restartGame);

  if (gameState.onchain) {
    const submitBtn = document.getElementById("submitBtn");
    let submitted = false;
    submitBtn?.addEventListener("click", async () => {
      if (submitted) return;
      submitted = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        await submitScoreOnchain(gameState.score);
        submitBtn.textContent = "Submitted";
        submitBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        submitBtn.classList.add("bg-green-700");
      } catch (error) {
        submitBtn.textContent = "Error";
        submitBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        submitBtn.classList.add("bg-red-600");
        submitted = false;
      }
    });
  }
}

export function restartGame() {
  const overlay = document.getElementById("gameOverOverlay");
  overlay?.remove();

  gameState.gameOver = false;
  gameState.score = 0;
  gameState.frame = 0;
  gameState.pipes = [];
  bird.y = gameCanvas.height / 2;
  bird.velocity = 0;

  updateScore();
  bgMusicEl.play().catch(() => {});
  requestAnimationFrame(updateGame);
}

export function beginGame(onchainMode) {
  gameState.onchain = onchainMode;
  gameState.gameStarted = true;
  gameState.gameOver = false;
  gameState.score = 0;
  gameState.frame = 0;
  gameState.pipes = [];
  bird.y = gameCanvas.height / 2;
  bird.velocity = 0;

  modeSelectionEl.style.display = "none";
  starBgEl.style.display = "none";
  starfieldEl.style.display = "none";
  socialFooterEl.style.display = "none";
  hudEl.classList.remove("hidden");

  updateScore();
  bgMusicEl.play().catch(() => showToast("Audio autoplay blocked by browser. Interact with the page first.", "warning"));
  requestAnimationFrame(updateGame);
}

export function flap() {
  if (!gameState.gameStarted || gameState.gameOver) return;
  bird.velocity = bird.lift;
}
