import { starfieldEl } from "./dom.js";

const starCtx = starfieldEl.getContext("2d");
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  radius: Math.random() * 1.4 + 0.3,
  speed: Math.random() * 0.5 + 0.2
}));

export function initStars() {
  starfieldEl.width = window.innerWidth;
  starfieldEl.height = window.innerHeight;

  function animateStars() {
    starCtx.clearRect(0, 0, starfieldEl.width, starfieldEl.height);
    starCtx.fillStyle = "rgba(255, 255, 255, 0.9)";

    stars.forEach(star => {
      starCtx.beginPath();
      starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      starCtx.fill();

      star.y += star.speed;
      if (star.y > starfieldEl.height) {
        star.y = 0;
        star.x = Math.random() * starfieldEl.width;
      }
    });

    requestAnimationFrame(animateStars);
  }

  animateStars();
}
