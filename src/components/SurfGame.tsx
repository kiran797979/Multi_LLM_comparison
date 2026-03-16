import { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { modalContent, modalOverlay } from "../config/animations";

type GameState = "idle" | "playing" | "over";

interface SurfGameProps {
  isOpen: boolean;
  onClose: () => void;
}

// Logical canvas size (CSS pixels). We scale for HiDPI.
const W = 720;
const H = 360;

const GROUND_H = 44;
const GROUND_Y = H - GROUND_H;

const PLAYER_X = 90;
const PLAYER_R = 14;

// Physics (units are px / sec)
const GRAVITY = 1800;
const JUMP_VEL = -640;

// Runner speed (px/sec)
const SPEED_START = 240;
const SPEED_MAX = 640;
const SPEED_ACCEL = 9;

// Spawns (seconds)
const OBSTACLE_SPAWN_MIN = 0.75;
const OBSTACLE_SPAWN_MAX = 1.35;

const POWERUP_SPAWN_MIN = 6.0;
const POWERUP_SPAWN_MAX = 10.0;

type ObstacleKind = "buoy" | "rock";

interface Obstacle {
  x: number;
  w: number;
  h: number;
  kind: ObstacleKind;
}

interface PowerUp {
  x: number;
  y: number;
  r: number;
  kind: "shield";
  t: number; // bobbing phase
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function circleRectCollision(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

function isJumpKey(key: string): boolean {
  return key === " " || key === "ArrowUp";
}

export default function SurfGame({ isOpen, onClose }: SurfGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [uiState, setUiState] = useState<GameState>("idle");

  // Cached render stuff
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef(1);

  // Avoid setState spam from the loop
  const uiStateRef = useRef<GameState>("idle");

  const game = useRef({
    state: "idle" as GameState,

    // Player
    y: GROUND_Y - PLAYER_R,
    vy: 0,
    onGround: true,

    // Feel-good input
    jumpBuffer: 0, // seconds
    coyote: 0, // seconds

    // World
    speed: SPEED_START,
    score: 0,
    groundOffset: 0,

    obstacles: [] as Obstacle[],
    obstacleTimer: 0,

    powerUps: [] as PowerUp[],
    powerTimer: rand(POWERUP_SPAWN_MIN, POWERUP_SPAWN_MAX),

    // Effects / powerups
    shieldTime: 0, // seconds
    particles: [] as Particle[],

    // Visual
    waveT: 0,
  });

  const setStateSafe = useCallback((next: GameState) => {
    if (uiStateRef.current !== next) {
      uiStateRef.current = next;
      setUiState(next);
    }
  }, []);

  const resetGame = useCallback(() => {
    const g = game.current;
    g.state = "idle";
    g.y = GROUND_Y - PLAYER_R;
    g.vy = 0;
    g.onGround = true;
    g.jumpBuffer = 0;
    g.coyote = 0;
    g.speed = SPEED_START;
    g.score = 0;
    g.groundOffset = 0;
    g.obstacles = [];
    g.obstacleTimer = rand(OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX);
    g.powerUps = [];
    g.powerTimer = rand(POWERUP_SPAWN_MIN, POWERUP_SPAWN_MAX);
    g.shieldTime = 0;
    g.particles = [];
    g.waveT = 0;

    setStateSafe("idle");
  }, [setStateSafe]);

  const startGame = useCallback(() => {
    const g = game.current;
    resetGame();
    g.state = "playing";
    setStateSafe("playing");
  }, [resetGame, setStateSafe]);

  const triggerGameOver = useCallback(() => {
    const g = game.current;
    if (g.state === "over") return;
    g.state = "over";
    setStateSafe("over");
  }, [setStateSafe]);

  const addBurst = useCallback((x: number, y: number, color: string) => {
    const g = game.current;
    for (let i = 0; i < 18; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(120, 420);
      g.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 120,
        life: 0,
        maxLife: rand(0.25, 0.5),
        color,
      });
    }
  }, []);

  const requestJump = useCallback(() => {
    const g = game.current;

    if (g.state === "idle") {
      startGame();
      return;
    }

    if (g.state === "over") {
      startGame();
      return;
    }

    // buffer jump so input feels responsive
    g.jumpBuffer = 0.12;
  }, [startGame]);

  const handleClose = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTimeRef.current = 0;
    resetGame();
    onClose();
  }, [onClose, resetGame]);

  // Resize / HiDPI scale
  const configureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    // Fit canvas in modal while preserving aspect ratio
    const parent = canvas.parentElement;
    const maxW = parent ? parent.clientWidth : W;
    const maxH = parent ? parent.clientHeight : H;

    const scale = Math.min(maxW / W, maxH / H, 1);
    const cssW = Math.floor(W * scale);
    const cssH = Math.floor(H * scale);

    const dpr = clamp(window.devicePixelRatio || 1, 1, 1.75);
    dprRef.current = dpr;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    // Normalize to CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }, []);

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const g = game.current;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background (cheap: one gradient per frame is OK at this size, but we keep it simple)
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0b1220");
    sky.addColorStop(1, "#111b33");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Parallax waves
    const waveBaseY = 110;
    g.waveT += 0.016;

    const drawWave = (y: number, amp: number, freq: number, speed: number, color: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 12) {
        const t = g.waveT * speed + x * freq;
        const yy = y + Math.sin(t) * amp;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    drawWave(waveBaseY, 10, 0.018, 1.2, "#0f2748", 0.55);
    drawWave(waveBaseY + 18, 14, 0.015, 1.6, "#0b2b5a", 0.55);
    drawWave(waveBaseY + 42, 18, 0.013, 2.0, "#06306b", 0.45);

    // Ground
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, GROUND_Y, W, GROUND_H);

    ctx.strokeStyle = "#1f2a44";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 0.5);
    ctx.lineTo(W, GROUND_Y + 0.5);
    ctx.stroke();

    // Ground dashes (scrolling)
    const dashStep = 26;
    const offset = g.groundOffset % dashStep;
    ctx.fillStyle = "rgba(148,163,184,0.20)";
    for (let x = -dashStep; x < W + dashStep; x += dashStep) {
      ctx.fillRect(x - offset, GROUND_Y + 20, 10, 2);
    }

    // Obstacles
    for (const o of g.obstacles) {
      const y = GROUND_Y - o.h;
      if (o.kind === "buoy") {
        ctx.fillStyle = "#ef4444";
      } else {
        ctx.fillStyle = "#f97316";
      }
      ctx.fillRect(o.x, y, o.w, o.h);

      // subtle top highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(o.x, y, o.w, 3);
    }

    // Powerups (shield)
    for (const p of g.powerUps) {
      const bob = Math.sin(p.t) * 4;
      const cx = p.x;
      const cy = p.y + bob;

      // ring
      ctx.beginPath();
      ctx.arc(cx, cy, p.r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59,130,246,0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // core
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, Math.max(2, p.r * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fill();
    }

    // Player
    const px = PLAYER_X;
    const py = g.y;

    // Shield
    if (g.shieldTime > 0) {
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_R + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59,130,246,0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Body
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_R, 0, Math.PI * 2);
    ctx.fillStyle = "#60a5fa";
    ctx.fill();

    // Face highlight
    ctx.beginPath();
    ctx.arc(px - 4, py - 4, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fill();

    // HUD
    ctx.fillStyle = "rgba(226,232,240,0.92)";
    ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${Math.floor(g.score)}`, 14, 22);

    if (g.shieldTime > 0) {
      ctx.fillStyle = "rgba(96,165,250,0.85)";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(`Shield: ${g.shieldTime.toFixed(1)}s`, 14, 40);
    }

    // Particles
    for (const pt of g.particles) {
      const t = pt.life / pt.maxLife;
      const a = 1 - t;
      ctx.globalAlpha = a;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
      ctx.globalAlpha = 1;
    }

    // Overlay screens
    if (g.state === "idle") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "800 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Surf Runner", W / 2, H / 2 - 26);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("Space / ↑ / Tap to start & jump", W / 2, H / 2 + 8);

      ctx.fillStyle = "rgba(148,163,184,0.7)";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("Collect shields, avoid obstacles", W / 2, H / 2 + 30);

      ctx.textAlign = "left";
    }

    if (g.state === "over") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#fca5a5";
      ctx.font = "900 30px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", W / 2, H / 2 - 34);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "700 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(`Score: ${Math.floor(g.score)}`, W / 2, H / 2 + 4);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillText("Space / ↑ / Tap to restart", W / 2, H / 2 + 34);

      ctx.textAlign = "left";
    }
  }, []);

  const step = useCallback(
    (dt: number) => {
      const g = game.current;
      if (g.state !== "playing") return;

      // dt clamp for stability (tab switching etc.)
      const d = clamp(dt, 0, 0.033);

      // Speed + score
      g.speed = Math.min(SPEED_MAX, g.speed + SPEED_ACCEL * d * 60);
      g.score += g.speed * d * 0.06;

      // Timers
      g.obstacleTimer -= d;
      g.powerTimer -= d;

      // Jump buffer + coyote
      g.jumpBuffer = Math.max(0, g.jumpBuffer - d);
      g.coyote = Math.max(0, g.coyote - d);

      // Apply buffered jump if allowed
      if (g.jumpBuffer > 0 && (g.onGround || g.coyote > 0)) {
        g.vy = JUMP_VEL;
        g.onGround = false;
        g.jumpBuffer = 0;
        addBurst(PLAYER_X, g.y + 10, "rgba(96,165,250,0.75)");
      }

      // Gravity
      g.vy += GRAVITY * d;
      g.y += g.vy * d;

      // Ground
      if (g.y >= GROUND_Y - PLAYER_R) {
        g.y = GROUND_Y - PLAYER_R;
        g.vy = 0;
        if (!g.onGround) g.coyote = 0;
        g.onGround = true;
      } else {
        // allow tiny grace time after leaving ground
        if (g.onGround) g.coyote = 0.08;
        g.onGround = false;
      }

      // Scroll ground
      g.groundOffset += g.speed * d;

      // Spawn obstacles
      if (g.obstacleTimer <= 0) {
        const kind: ObstacleKind = Math.random() < 0.55 ? "buoy" : "rock";
        const h = kind === "buoy" ? rand(28, 56) : rand(22, 44);
        const w = kind === "buoy" ? 18 : 26;

        g.obstacles.push({
          x: W + 40,
          w,
          h,
          kind,
        });

        // slightly faster spawns as speed increases
        const sFactor = 1 - (g.speed - SPEED_START) / (SPEED_MAX - SPEED_START);
        g.obstacleTimer = rand(OBSTACLE_SPAWN_MIN, OBSTACLE_SPAWN_MAX) * clamp(0.65 + sFactor * 0.55, 0.65, 1.2);
      }

      // Spawn powerup
      if (g.powerTimer <= 0) {
        g.powerUps.push({
          x: W + 60,
          y: rand(150, GROUND_Y - 80),
          r: 9,
          kind: "shield",
          t: rand(0, Math.PI * 2),
        });
        g.powerTimer = rand(POWERUP_SPAWN_MIN, POWERUP_SPAWN_MAX);
      }

      // Move obstacles
      const moveX = g.speed * d;
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const o = g.obstacles[i];
        o.x -= moveX;
        if (o.x + o.w < -40) g.obstacles.splice(i, 1);
      }

      // Move powerups
      for (let i = g.powerUps.length - 1; i >= 0; i--) {
        const p = g.powerUps[i];
        p.x -= moveX * 0.92;
        p.t += d * 6;

        // collect shield
        const bob = Math.sin(p.t) * 4;
        const cx = p.x;
        const cy = p.y + bob;
        const dx = cx - PLAYER_X;
        const dy = cy - g.y;
        const rr = (PLAYER_R + p.r) * (PLAYER_R + p.r);

        if (dx * dx + dy * dy <= rr) {
          g.shieldTime = 5.5;
          addBurst(cx, cy, "rgba(59,130,246,0.85)");
          g.powerUps.splice(i, 1);
          continue;
        }

        if (p.x + p.r < -40) g.powerUps.splice(i, 1);
      }

      // Shield time
      if (g.shieldTime > 0) g.shieldTime = Math.max(0, g.shieldTime - d);

      // Collision
      for (let i = 0; i < g.obstacles.length; i++) {
        const o = g.obstacles[i];
        const rx = o.x;
        const ry = GROUND_Y - o.h;
        const hit = circleRectCollision(PLAYER_X, g.y, PLAYER_R - 2, rx, ry, o.w, o.h);

        if (hit) {
          if (g.shieldTime > 0) {
            g.shieldTime = 0;
            addBurst(rx + o.w / 2, ry + 6, "rgba(96,165,250,0.95)");
            g.obstacles.splice(i, 1);
          } else {
            addBurst(PLAYER_X, g.y, "rgba(248,113,113,0.95)");
            triggerGameOver();
          }
          break;
        }
      }

      // Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.life += d;
        p.x += p.vx * d;
        p.y += p.vy * d;
        p.vy += 900 * d;
        if (p.life >= p.maxLife) g.particles.splice(i, 1);
      }
    },
    [addBurst, triggerGameOver],
  );

  // Main loop
  useEffect(() => {
    if (!isOpen) return;

    configureCanvas();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional init on open
    resetGame();

    const tick = (t: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      step(dt);
      draw();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const handleResize = () => configureCanvas();
    window.addEventListener("resize", handleResize);

    const handleVisibility = () => {
      // Pause timing so we don't jump on resume
      lastTimeRef.current = 0;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = 0;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOpen, configureCanvas, resetGame, step, draw]);

  // Inputs
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (isJumpKey(e.key)) {
        e.preventDefault();
        requestJump();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, isOpen, requestJump]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            className="relative w-full max-w-[860px] overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl"
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Surf Runner</p>
                <p className="text-[11px] text-zinc-500">
                  Space / ↑ / Tap to jump{uiState === "over" ? " · Tap to restart" : ""}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="rounded-lg bg-zinc-800/80 p-1.5 text-zinc-300 transition-colors hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none"
                aria-label="Close game"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3">
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                className="block w-full select-none touch-none rounded-xl border border-zinc-700 bg-black/20 shadow-inner"
                onPointerDown={(e) => {
                  e.preventDefault();
                  requestJump();
                }}
              />
            </div>

            {uiState === "over" && (
              <div className="px-4 pb-4">
                <button
                  onClick={startGame}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
                  type="button"
                >
                  Play again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}