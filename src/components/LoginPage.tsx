import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import "./LoginPage.css";

gsap.registerPlugin(Draggable);

/* ── Tiny helpers ────────────────────────────────────────────────────────── */

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function getStrength(val: string) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthCls = ["", "weak", "medium", "medium", "strong"];
const strengthColor: Record<string, string> = {
  weak: "#e74c3c",
  medium: "#f39c12",
  strong: "#2ecc71",
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const navigate = useNavigate();

  /* ── state ── */
  const [currentForm, setCurrentForm] = useState<"signin" | "signup">("signin");
  const [lampOn, setLampOn] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);

  // sign-in fields
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);

  // sign-up fields
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suShowPass, setSuShowPass] = useState(false);

  // toast
  const [toast, setToast] = useState({ msg: "", type: "success", show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ── refs ── */
  const pageRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const signinRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const lampRef = useRef<SVGSVGElement>(null);
  const hitRef = useRef<SVGCircleElement>(null);
  const dummyCordRef = useRef<SVGLineElement>(null);
  const lampOnRef = useRef(false);
  const currentFormRef = useRef<"signin" | "signup">("signin");

  /* keep refs in sync */
  useEffect(() => { lampOnRef.current = lampOn; }, [lampOn]);
  useEffect(() => { currentFormRef.current = currentForm; }, [currentForm]);

  /* ── toast helper ── */
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type, show: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  /* ── sync wrapper height ── */
  const syncHeight = useCallback((target: "signin" | "signup") => {
    const card = target === "signin" ? signinRef.current : signupRef.current;
    if (!card || !wrapperRef.current) return;
    wrapperRef.current.style.height = `${card.scrollHeight}px`;
  }, []);

  /* ── switch form ── */
  const switchForm = useCallback(
    (target: "signin" | "signup") => {
      if (target === currentFormRef.current) return;
      const outgoing = target === "signup" ? signinRef.current : signupRef.current;
      const incoming = target === "signup" ? signupRef.current : signinRef.current;
      const outDir = target === "signup" ? "slide-out-left" : "slide-out-right";

      outgoing?.classList.remove("active");
      outgoing?.classList.add(outDir);
      syncHeight(target);

      setTimeout(() => {
        outgoing?.classList.remove(outDir);
        incoming?.classList.remove("slide-out-left", "slide-out-right");
        incoming?.classList.add("active");
        setCurrentForm(target);
        syncHeight(target);
      }, 350);
    },
    [syncHeight],
  );

  /* ── toggle lamp ── */
  const toggleLamp = useCallback(() => {
    const next = !lampOnRef.current;
    setLampOn(next);

    const page = pageRef.current;
    if (!page) return;

    const hue = randomHue();
    page.style.setProperty("--on", next ? "1" : "0");
    page.style.setProperty("--shade-hue", String(hue));
    page.style.setProperty("--glow-color", `hsl(${hue}, 40%, 45%)`);
    page.style.setProperty("--glow-color-dark", `hsl(${hue}, 40%, 35%)`);

    /* eyes */
    page.querySelectorAll<SVGElement>(".lamp__eye").forEach((eye) => {
      gsap.set(eye, { rotate: next ? 0 : 180 });
    });

    if (next) {
      setHintHidden(true);
      const active = currentFormRef.current === "signin" ? signinRef.current : signupRef.current;
      active?.classList.add("active");
      syncHeight(currentFormRef.current);
    } else {
      setHintHidden(false);
      signinRef.current?.classList.remove("active");
      signupRef.current?.classList.remove("active");
      if (wrapperRef.current) wrapperRef.current.style.height = "0px";
    }
  }, [syncHeight]);

  /* ── GSAP setup (once on mount) ── */
  useEffect(() => {
    const page = pageRef.current;
    const hit = hitRef.current;
    const dummyCord = dummyCordRef.current;
    const lampSvg = lampRef.current;
    if (!page || !hit || !dummyCord || !lampSvg || !wrapperRef.current) return;

    const ENDX = Number(dummyCord.getAttribute("x2"));
    const ENDY = Number(dummyCord.getAttribute("y2"));

    gsap.set([".login-page .cords", hit], { x: -10 });
    gsap.set(".login-page .lamp__eye", { rotate: 180, transformOrigin: "50% 50%", yPercent: 50 });
    gsap.set(lampSvg, { display: "block" });
    wrapperRef.current.style.height = "0px";

    const proxy = document.createElement("div");
    gsap.set(proxy, { x: ENDX, y: ENDY });

    let startX = 0;
    let startY = 0;

    const toggleRef = { toggle: () => { } };
    toggleRef.toggle = () => {
      /* cord bounce animation */
      const tl = gsap.timeline();
      tl.to(dummyCord, { attr: { y2: ENDY + 30 }, duration: 0.08, ease: "power1.out" })
        .to(dummyCord, { attr: { y2: ENDY - 15 }, duration: 0.06, ease: "power1.inOut" })
        .to(dummyCord, { attr: { y2: ENDY + 8 }, duration: 0.05, ease: "power1.inOut" })
        .to(dummyCord, { attr: { y2: ENDY }, duration: 0.06, ease: "power1.in" });
    };

    Draggable.create(proxy, {
      trigger: hit,
      type: "x,y",
      onPress: (e: PointerEvent) => {
        startX = e.x;
        startY = e.y;
      },
      onDrag() {
        gsap.set(dummyCord, { attr: { x2: this.x, y2: Math.max(400, this.y) } });
      },
      onRelease(e: PointerEvent) {
        const dx = Math.abs(e.x - startX);
        const dy = Math.abs(e.y - startY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        gsap.to(dummyCord, {
          attr: { x2: ENDX, y2: ENDY },
          duration: 0.1,
          onComplete: () => {
            gsap.set(proxy, { x: ENDX, y: ENDY });
            if (dist > 50) {
              toggleRef.toggle();
              // Call toggle asynchronously to avoid stale closure
              (window as unknown as Record<string, () => void>).__lampToggle?.();
            }
          },
        });
      },
    });

    /* expose toggle for the Draggable callback */
    (window as unknown as Record<string, () => void>).__lampToggle = () => { };

    // Cleanup
    return () => {
      delete (window as unknown as Record<string, (() => void) | undefined>).__lampToggle;
    };
  }, []);

  /* keep the global toggle callback current */
  useEffect(() => {
    (window as unknown as Record<string, () => void>).__lampToggle = toggleLamp;
  }, [toggleLamp]);

  /* ResizeObserver for wrapper */
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (lampOnRef.current) syncHeight(currentFormRef.current);
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [syncHeight]);

  /* ── form handlers ── */
  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (!siEmail.trim() || !siPass) return showToast("Please fill all fields", "error");
    localStorage.setItem("acs-authenticated", "true");
    showToast("Signed in successfully!");
    setTimeout(() => navigate("/", { replace: true }), 600);
  };

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    if (!suName.trim() || !suEmail.trim() || !suPass || !suConfirm)
      return showToast("Please fill all fields", "error");
    if (suPass.length < 8) return showToast("Password must be at least 8 characters", "error");
    if (suPass !== suConfirm) return showToast("Passwords do not match", "error");
    localStorage.setItem("acs-authenticated", "true");
    showToast("Account created successfully!");
    setTimeout(() => navigate("/", { replace: true }), 600);
  };

  const suStrength = getStrength(suPass);

  /* ── JSX ──────────────────────────────────────────────────────────────── */
  return (
    <div className="login-page" ref={pageRef}>
      {/* Toast */}
      <div className={`lamp-toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <svg viewBox="0 0 24 24">
          {toast.type === "success" ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          )}
        </svg>
        <span>{toast.msg}</span>
      </div>

      <div className="container">
        {/* ── Lamp SVG ── */}
        <svg
          ref={lampRef}
          className="lamp"
          viewBox="0 0 333 484"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="lamp__shade shade">
            <ellipse className="shade__opening" cx="165" cy="220" rx="130" ry="20" />
            <ellipse className="shade__opening-shade" cx="165" cy="220" rx="130" ry="20" fill="url(#opening-shade)" />
          </g>
          <g className="lamp__base base">
            <path className="base__side" d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" />
            <path d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" fill="url(#side-shading)" />
            <ellipse className="base__top" cx="165" cy="430" rx="80" ry="20" />
            <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
          </g>
          <g className="lamp__post post">
            <path className="post__body" d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" />
            <path d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" fill="url(#post-shading)" />
          </g>
          <g className="lamp__cords cords">
            <line
              ref={dummyCordRef}
              className="cord cord--dummy"
              x1="124"
              y2="348"
              x2="124"
              y1="190"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
          <path
            className="lamp__light"
            d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z"
            fill="url(#light)"
          />
          <g className="lamp__top top">
            <path
              className="top__body"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
            />
            <path
              className="top__shading"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z"
              fill="url(#top-shading)"
            />
          </g>
          <g className="lamp__face face">
            <g className="lamp__mouth">
              <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              <clipPath className="lamp__feature" id="mouth" x="129" y="142" width="72" height="36">
                <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
              </clipPath>
              <g clipPath="url(#mouth)">
                <circle className="lamp__tongue" cx="179.4" cy="172.6" r="18" />
              </g>
            </g>
            <g className="lamp__eyes">
              <path className="lamp__eye lamp__stroke" d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path className="lamp__eye lamp__stroke" d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          <defs>
            <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse"><stop /><stop offset="1" stopColor="var(--shade)" stopOpacity="0" /></linearGradient>
            <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse"><stop stopColor="var(--b-1)" /><stop offset="0.8" stopColor="var(--b-2)" stopOpacity="0" /></linearGradient>
            <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse"><stop stopColor="var(--b-3)" /><stop offset="1" stopColor="var(--b-4)" stopOpacity="0" /></linearGradient>
            <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse"><stop stopColor="var(--b-1)" /><stop offset="1" stopColor="var(--b-2)" stopOpacity="0" /></linearGradient>
            <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse"><stop stopColor="var(--l-1)" stopOpacity=".2" /><stop offset="1" stopColor="var(--l-2)" stopOpacity="0" /></linearGradient>
            <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="var(--t-1)" stopOpacity=".8" /><stop offset="1" stopColor="var(--t-2)" stopOpacity="0" /></linearGradient>
          </defs>
          <circle ref={hitRef} className="lamp__hit" cx="124" cy="347" r="66" fill="#C4C4C4" fillOpacity=".1" />
        </svg>

        {/* ── Form cards ── */}
        <div className="form-wrapper" ref={wrapperRef}>
          {/* Sign In */}
          <div className="form-card" ref={signinRef} id="signin-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue your journey</p>
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                  />
                  <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3" /><polyline points="2 4 12 13 22 4" /></svg>
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type={siShowPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={siPass}
                    onChange={(e) => setSiPass(e.target.value)}
                  />
                  <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  <button type="button" className="password-toggle" onClick={() => setSiShowPass((p) => !p)} aria-label="Toggle password visibility">
                    <svg viewBox="0 0 24 24">
                      {siShowPass ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <span className="forgot-link">Forgot Password?</span>
              </div>
              <button type="submit" className="submit-btn">Sign In</button>
              <div className="divider"><span>or</span></div>
              <div className="social-btns">
                <button type="button" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7C6.73 19.91 6.14 18 6.14 18a2.69 2.69 0 00-1.13-1.49c-.92-.63.07-.62.07-.62a2.13 2.13 0 011.56 1.05 2.16 2.16 0 002.95.84 2.17 2.17 0 01.64-1.36c-2.22-.25-4.55-1.11-4.55-4.94a3.87 3.87 0 011.03-2.68 3.6 3.6 0 01.1-2.65s.84-.27 2.75 1.02a9.47 9.47 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02a3.6 3.6 0 01.1 2.65 3.87 3.87 0 011.03 2.68c0 3.84-2.34 4.69-4.57 4.94a2.42 2.42 0 01.69 1.88v2.78c0 .27.18.58.69.48A10 10 0 0012 2z" /></svg>
                  GitHub
                </button>
                <button type="button" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12l4-4 4 4" /></svg>
                  Google
                </button>
              </div>
              <div className="form-footer">
                <span>Don&apos;t have an account? </span>
                <button type="button" className="switch-link" onClick={() => switchForm("signup")}>
                  Sign Up
                </button>
              </div>
            </form>
          </div>

          {/* Sign Up */}
          <div className="form-card" ref={signupRef} id="signup-card">
            <h2>Create Account</h2>
            <p className="subtitle">Start your journey with us today</p>
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <input type="text" placeholder="John Doe" required autoComplete="name" value={suName} onChange={(e) => setSuName(e.target.value)} />
                  <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <input type="email" placeholder="you@example.com" required autoComplete="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
                  <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3" /><polyline points="2 4 12 13 22 4" /></svg>
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type={suShowPass ? "text" : "password"}
                    placeholder="Min 8 characters"
                    required
                    autoComplete="new-password"
                    value={suPass}
                    onChange={(e) => setSuPass(e.target.value)}
                  />
                  <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  <button type="button" className="password-toggle" onClick={() => setSuShowPass((p) => !p)} aria-label="Toggle password visibility">
                    <svg viewBox="0 0 24 24">
                      {suShowPass ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <div className="password-strength">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`strength-bar${i < suStrength ? ` ${strengthCls[suStrength]}` : ""}`} />
                  ))}
                </div>
                {suPass && (
                  <div className="strength-text" style={{ color: strengthColor[strengthCls[suStrength]] ?? "#4a5060" }}>
                    {strengthLabel[suStrength]}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <input type="password" placeholder="Repeat password" required autoComplete="new-password" value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)} />
                  <svg className="icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                </div>
              </div>
              <button type="submit" className="submit-btn">Create Account</button>
              <div className="divider"><span>or</span></div>
              <div className="social-btns">
                <button type="button" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7C6.73 19.91 6.14 18 6.14 18a2.69 2.69 0 00-1.13-1.49c-.92-.63.07-.62.07-.62a2.13 2.13 0 011.56 1.05 2.16 2.16 0 002.95.84 2.17 2.17 0 01.64-1.36c-2.22-.25-4.55-1.11-4.55-4.94a3.87 3.87 0 011.03-2.68 3.6 3.6 0 01.1-2.65s.84-.27 2.75 1.02a9.47 9.47 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02a3.6 3.6 0 01.1 2.65 3.87 3.87 0 011.03 2.68c0 3.84-2.34 4.69-4.57 4.94a2.42 2.42 0 01.69 1.88v2.78c0 .27.18.58.69.48A10 10 0 0012 2z" /></svg>
                  GitHub
                </button>
                <button type="button" className="social-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12l4-4 4 4" /></svg>
                  Google
                </button>
              </div>
              <div className="form-footer">
                <span>Already have an account? </span>
                <button type="button" className="switch-link" onClick={() => switchForm("signin")}>
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={`pull-hint ${hintHidden ? "hidden" : ""}`}>
        ↓ Pull the lamp cord to turn on the light ↓
      </div>
    </div>
  );
}
