export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
  const particleCount = 70;
  const particles: {
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    angle: number;
    vAngle: number;
    color: string;
    opacity: number;
  }[] = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 60,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 14 - 4,
      angle: Math.random() * 360,
      vAngle: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    });
  }

  let animationFrame: number;
  const startTime = performance.now();

  function render(now: number) {
    if (!ctx) return;
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let aliveCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.angle += p.vAngle;
      p.opacity = Math.max(0, 1 - elapsed / 2200);

      if (p.opacity > 0 && p.y < window.innerHeight + 50) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (aliveCount > 0 && elapsed < 2500) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  animationFrame = requestAnimationFrame(render);
}
