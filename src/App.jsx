import { useState, useEffect, useRef, useCallback } from "react";

// ─── Web Audio Sound Engine (no external files needed) ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTap() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.12);
}

function playShake() {
  const ctx = getAudioCtx();
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  src.connect(bp).connect(gain).connect(ctx.destination);
  src.start();
}

function playPeelOpen() {
  const ctx = getAudioCtx();
  // paper tear / peel sound
  const bufLen = ctx.sampleRate * 0.4;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    const env = Math.exp(-i / (ctx.sampleRate * 0.15));
    d[i] = (Math.random() * 2 - 1) * env * 0.3;
  }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 2000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  src.connect(hp).connect(gain).connect(ctx.destination);
  src.start();
  // rising shimmer
  const osc = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.5);
  g2.gain.setValueAtTime(0.08, ctx.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(g2).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
}

function playCoinReveal(tier) {
  const ctx = getAudioCtx();
  const isHigh = ["incredible", "legendary", "mythical", "divine"].includes(tier);
  const notes = isHigh
    ? [523, 659, 784, 1047, 1319]  // C5 E5 G5 C6 E6 — triumphant arpeggio
    : [523, 659, 784];              // C5 E5 G5 — pleasant chime
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * (isHigh ? 0.1 : 0.12);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(isHigh ? 0.25 : 0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isHigh ? 0.6 : 0.4));
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + (isHigh ? 0.6 : 0.4));
  });
}

function playFirework() {
  const ctx = getAudioCtx();
  // whoosh up
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
  g.gain.setValueAtTime(0.06, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(g).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.25);
  // crackle burst
  setTimeout(() => {
    const bufLen = ctx.sampleRate * 0.3;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08)) * 0.2;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 4000; bp.Q.value = 0.5;
    src.connect(bp).connect(ctx.destination);
    src.start();
  }, 200);
}

function playJackpot() {
  const ctx = getAudioCtx();
  // rapid coin cascade
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.06;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.3);
  });
}

function playGong() {
  const ctx = getAudioCtx();
  // low gong hit
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(90, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 1.5);
  g.gain.setValueAtTime(0.35, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
  osc.connect(g).connect(ctx.destination);
  // harmonics
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(180, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 1.2);
  g2.gain.setValueAtTime(0.15, ctx.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc2.connect(g2).connect(ctx.destination);
  // shimmer
  const osc3 = ctx.createOscillator();
  const g3 = ctx.createGain();
  osc3.type = "triangle";
  osc3.frequency.setValueAtTime(520, ctx.currentTime);
  osc3.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.8);
  g3.gain.setValueAtTime(0.06, ctx.currentTime);
  g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc3.connect(g3).connect(ctx.destination);
  [osc, osc2, osc3].forEach((o, i) => { o.start(); o.stop(ctx.currentTime + [1.8, 1.2, 0.8][i]); });
}

const BLESSINGS = [
  "馬到成功 — Success arrives like a galloping horse!",
  "龍馬精神 — Spirit of the dragon-horse!",
  "一馬當先 — Lead the charge like a champion horse!",
  "萬馬奔騰 — Ten thousand horses galloping forward!",
  "馬年大吉 — Great luck in the Year of the Horse!",
  "快馬加鞭 — Full speed ahead to prosperity!",
  "天馬行空 — Soar like a heavenly horse!",
  "金馬報喜 — The golden horse brings good news!",
  "寶馬迎春 — A precious horse welcomes spring!",
  "駿馬奔騰 — A fine steed charges into fortune!",
];

const LUCKY_MESSAGES = [
  "Wah, huat ah! 🔥",
  "Gong Xi Fa Cai! 🎊",
  "Big boss energy! 💪",
  "Ong ah! Ong ah! 🍊",
  "Sure kena jackpot! 🎰",
  "Steady la! 🐴",
  "Power la this year! ⚡",
  "Chun galore! 🌟",
];

const AMOUNTS = [
  { value: 8, weight: 20, tier: "lucky" },
  { value: 18, weight: 18, tier: "lucky" },
  { value: 28, weight: 15, tier: "nice" },
  { value: 38, weight: 12, tier: "nice" },
  { value: 50, weight: 10, tier: "great" },
  { value: 68, weight: 8, tier: "great" },
  { value: 88, weight: 7, tier: "amazing" },
  { value: 128, weight: 5, tier: "amazing" },
  { value: 168, weight: 3, tier: "incredible" },
  { value: 288, weight: 1.5, tier: "legendary" },
  { value: 888, weight: 0.4, tier: "mythical" },
  { value: 8888, weight: 0.1, tier: "divine" },
];

const TIER_COLORS = {
  lucky: "#FFD700",
  nice: "#FF8C00",
  great: "#FF4500",
  amazing: "#FF1493",
  incredible: "#9400D3",
  legendary: "#FFD700",
  mythical: "#FFD700",
  divine: "#FFD700",
};

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[0];
}

function Particle({ x, y, color, delay }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        animation: `particleBurst 1s ${delay}s ease-out forwards`,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function Firework({ x, y }) {
  const colors = ["#FF0000", "#FFD700", "#FF4500", "#FF1493", "#FFA500", "#FFFF00"];
  const particles = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    particles.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.2,
    });
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </div>
  );
}

function FloatingHorse({ delay, left }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        bottom: -60,
        fontSize: 40,
        animation: `floatUp ${6 + Math.random() * 4}s ${delay}s linear infinite`,
        opacity: 0.15,
        pointerEvents: "none",
        filter: "blur(1px)",
      }}
    >
      🐴
    </div>
  );
}

function GoldCoin({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        fontSize: 20,
        animation: "coinFall 3s linear infinite",
        pointerEvents: "none",
        ...style,
      }}
    >
      🪙
    </div>
  );
}

export default function CNY2026() {
  const [phase, setPhase] = useState("intro"); // intro, shake, opening, revealed
  const [angpow, setAngpow] = useState(null);
  const [blessing, setBlessing] = useState("");
  const [luckyMsg, setLuckyMsg] = useState("");
  const [fireworks, setFireworks] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [angpowCount, setAngpowCount] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [showCoins, setShowCoins] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasMotion, setHasMotion] = useState(false);
  const [motionPermission, setMotionPermission] = useState("unknown"); // unknown, granted, denied
  const containerRef = useRef(null);
  const phaseRef = useRef(phase);
  const shakeCountRef = useRef(shakeCount);
  const lastShakeTime = useRef(0);
  const handleShakeRef = useRef(null);

  // Keep refs in sync for DeviceMotion callback
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { shakeCountRef.current = shakeCount; }, [shakeCount]);

  // Haptic feedback helper
  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const spawnFireworks = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (i < 3) playFirework(); // sound for first 3 fireworks
        setFireworks((prev) => [
          ...prev,
          {
            id: Date.now() + i,
            x: Math.random() * 300 - 150,
            y: Math.random() * 200 - 250,
          },
        ]);
      }, i * 300);
    }
  }, []);

  const handleOpen = () => {
    if (phase === "intro") {
      playTap();
      vibrate(30);
      setPhase("shake");
      setShakeCount(0);
      // Request motion permission on iOS 13+ (must be from user gesture)
      requestMotionPermission();
    }
  };

  const requestMotionPermission = () => {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      // iOS 13+
      DeviceMotionEvent.requestPermission()
        .then((state) => {
          setMotionPermission(state);
          if (state === "granted") {
            setHasMotion(true);
            startMotionListener();
          }
        })
        .catch(() => setMotionPermission("denied"));
    } else if (typeof DeviceMotionEvent !== "undefined") {
      // Android & other — just works
      setHasMotion(true);
      setMotionPermission("granted");
      startMotionListener();
    }
  };

  const startMotionListener = () => {
    // Already handled by the useEffect below via hasMotion state
  };

  const handleShake = useCallback(() => {
    if (phaseRef.current !== "shake") return;
    playShake();
    vibrate(50);
    setShakeCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        vibrate([50, 30, 50, 30, 100]); // celebration pattern
        setTimeout(() => {
          playPeelOpen();
          setPhase("opening");
          setTimeout(() => revealAngpow(), 800);
        }, 200);
      }
      return next;
    });
  }, []);

  // Store handleShake in ref so DeviceMotion listener can access it
  useEffect(() => { handleShakeRef.current = handleShake; }, [handleShake]);

  // DeviceMotion shake detection
  useEffect(() => {
    if (!hasMotion) return;

    const SHAKE_THRESHOLD = 20; // m/s² — tuned for a confident shake
    const SHAKE_COOLDOWN = 400; // ms between shakes

    const onMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const force = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();
      if (force > SHAKE_THRESHOLD && now - lastShakeTime.current > SHAKE_COOLDOWN) {
        lastShakeTime.current = now;
        if (handleShakeRef.current) handleShakeRef.current();
      }
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [hasMotion]);

  const revealAngpow = () => {
    const result = weightedRandom(AMOUNTS);
    const bless = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    const lucky = LUCKY_MESSAGES[Math.floor(Math.random() * LUCKY_MESSAGES.length)];
    setAngpow(result);
    setBlessing(bless);
    setLuckyMsg(lucky);
    setPhase("revealed");
    setTotalCollected((prev) => prev + result.value);
    setAngpowCount((prev) => prev + 1);
    setHistory((prev) => [{ ...result, blessing: bless }, ...prev].slice(0, 10));

    // Sound: coin reveal chime (scales with tier)
    playCoinReveal(result.tier);
    vibrate(result.tier === "divine" ? [100, 50, 100, 50, 200] : [80, 40, 80]);

    // Sound: gong for amazing+
    if (["amazing", "incredible", "legendary", "mythical", "divine"].includes(result.tier)) {
      setTimeout(() => playGong(), 300);
    }

    spawnFireworks();

    if (result.tier === "mythical" || result.tier === "divine") {
      setShowCoins(true);
      setTimeout(() => playJackpot(), 500);
      setTimeout(() => setShowCoins(false), 3000);
    }
  };

  const reset = () => {
    playTap();
    vibrate(30);
    setPhase("intro");
    setAngpow(null);
    setBlessing("");
    setLuckyMsg("");
    setFireworks([]);
    setShakeCount(0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setFireworks((prev) => prev.filter((f) => Date.now() - f.id < 2000));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const tierLabel = angpow
    ? { lucky: "Lucky", nice: "Nice!", great: "Great!", amazing: "Amazing!", incredible: "Incredible!", legendary: "⭐ LEGENDARY ⭐", mythical: "🌟 MYTHICAL 🌟", divine: "👑 DIVINE 👑" }[angpow.tier]
    : "";

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a0000 0%, #4a0000 30%, #8B0000 60%, #CC0000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Noto Serif', 'Georgia', serif",
        color: "#FFD700",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Ma+Shan+Zheng&display=swap');

        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          50% { opacity: 0.25; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        @keyframes particleBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx, 0), var(--ty, 0)) scale(0); opacity: 0; }
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes grandReveal {
          0% { transform: scale(0.3) rotateY(180deg); opacity: 0; }
          50% { transform: scale(1.15) rotateY(0deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes coinFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2); }
        }

        @keyframes horseRun {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }

        @keyframes gentleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .angpow-envelope {
          width: 220px;
          height: 320px;
          background: linear-gradient(145deg, #FF0000, #CC0000, #AA0000);
          border-radius: 16px;
          position: relative;
          cursor: pointer;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: transform 0.3s ease;
          animation: ${phase === "shake" ? "shake 0.4s ease infinite" : phase === "intro" ? "gentleBob 2s ease-in-out infinite" : "none"};
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .angpow-envelope:hover {
          transform: ${phase === "intro" ? "scale(1.05)" : "none"};
        }

        .angpow-seal {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, #FFD700, #DAA520);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          border: 2px solid #B8860B;
        }

        .angpow-pattern {
          position: absolute;
          inset: 8px;
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          pointer-events: none;
        }

        .angpow-corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border-color: rgba(255, 215, 0, 0.5);
          border-style: solid;
        }

        .amount-display {
          font-size: ${angpow && angpow.value >= 888 ? "52px" : "48px"};
          font-weight: 900;
          background: linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700, #DAA520, #FFD700);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite, grandReveal 0.8s ease-out;
          text-shadow: none;
          font-family: 'Georgia', serif;
        }

        .btn-primary {
          background: linear-gradient(145deg, #FFD700, #DAA520);
          color: #8B0000;
          border: none;
          padding: 16px 40px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
          font-family: inherit;
          letter-spacing: 0.5px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          min-height: 52px;
          user-select: none;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .progress-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #FFD700;
          transition: all 0.3s ease;
        }

        .history-item {
          background: rgba(255, 215, 0, 0.08);
          border: 1px solid rgba(255, 215, 0, 0.15);
          border-radius: 10px;
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideUp 0.3s ease-out;
          font-size: 14px;
        }

        .running-horse {
          position: absolute;
          top: 15%;
          font-size: 40px;
          animation: horseRun 8s linear infinite;
          opacity: 0.12;
          pointer-events: none;
        }
      `}</style>

      {/* Background horses */}
      {[10, 30, 50, 70, 90].map((l, i) => (
        <FloatingHorse key={i} delay={i * 1.5} left={l} />
      ))}

      {/* Running horse across screen */}
      <div className="running-horse">🐎</div>

      {/* Coin rain for mythical+ */}
      {showCoins &&
        Array.from({ length: 20 }).map((_, i) => (
          <GoldCoin
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: -30,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24, animation: "fadeIn 1s ease-out" }}>
        <div style={{ fontSize: 14, letterSpacing: 4, opacity: 0.7, marginBottom: 4, textTransform: "uppercase" }}>
          Year of the Horse
        </div>
        <h1
          style={{
            fontSize: 42,
            fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            margin: "0 0 4px 0",
            textShadow: "0 2px 20px rgba(255, 215, 0, 0.5)",
            lineHeight: 1.2,
          }}
        >
          🐴 新年快樂 🐴
        </h1>
        <div style={{ fontSize: 16, opacity: 0.8 }}>Chinese New Year 2026</div>
      </div>

      {/* Stats bar */}
      {angpowCount > 0 && (
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 20,
            fontSize: 14,
            opacity: 0.8,
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <span>🧧 {angpowCount} opened</span>
          <span>💰 RM {totalCollected.toLocaleString()} collected</span>
        </div>
      )}

      {/* Main angpow area */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        {phase !== "revealed" ? (
          <div
            className="angpow-envelope"
            onClick={phase === "intro" ? handleOpen : handleShake}
            role="button"
            tabIndex={0}
          >
            <div className="angpow-pattern" />
            {/* Corner decorations */}
            <div className="angpow-corner" style={{ top: 14, left: 14, borderWidth: "2px 0 0 2px" }} />
            <div className="angpow-corner" style={{ top: 14, right: 14, borderWidth: "2px 2px 0 0" }} />
            <div className="angpow-corner" style={{ bottom: 14, left: 14, borderWidth: "0 0 2px 2px" }} />
            <div className="angpow-corner" style={{ bottom: 14, right: 14, borderWidth: "0 2px 2px 0" }} />

            {/* Top text */}
            <div
              style={{
                position: "absolute",
                top: 30,
                width: "100%",
                textAlign: "center",
                fontFamily: "'Ma Shan Zheng', serif",
                fontSize: 28,
                color: "#FFD700",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              恭喜發財
            </div>

            {/* Seal */}
            <div className="angpow-seal">🐴</div>

            {/* Bottom text */}
            <div
              style={{
                position: "absolute",
                bottom: 30,
                width: "100%",
                textAlign: "center",
                fontFamily: "'Ma Shan Zheng', serif",
                fontSize: 22,
                color: "#FFD700",
                opacity: 0.8,
              }}
            >
              馬年大吉
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 280,
              minHeight: 320,
              background: "linear-gradient(145deg, rgba(139,0,0,0.6), rgba(80,0,0,0.8))",
              border: "2px solid rgba(255, 215, 0, 0.4)",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px 20px",
              position: "relative",
              animation: "borderGlow 2s ease-in-out infinite",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Fireworks */}
            {fireworks.map((f) => (
              <Firework key={f.id} x={f.x} y={f.y} />
            ))}

            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4, letterSpacing: 2 }}>
              {tierLabel}
            </div>

            <div className="amount-display">RM {angpow.value.toLocaleString()}</div>

            <div
              style={{
                fontSize: 40,
                margin: "10px 0",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              🧧
            </div>

            <div
              style={{
                fontSize: 15,
                textAlign: "center",
                lineHeight: 1.6,
                fontFamily: "'Noto Serif SC', serif",
                animation: "slideUp 0.5s ease-out 0.3s both",
                maxWidth: 240,
              }}
            >
              {blessing}
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: 700,
                color: "#FFA500",
                animation: "slideUp 0.5s ease-out 0.6s both",
              }}
            >
              {luckyMsg}
            </div>
          </div>
        )}
      </div>

      {/* Action area */}
      {phase === "intro" && (
        <div style={{ textAlign: "center", animation: "slideUp 0.5s ease-out" }}>
          <button className="btn-primary" onClick={handleOpen}>
            🧧 Tap to receive Angpow!
          </button>
        </div>
      )}

      {phase === "shake" && (
        <div style={{ textAlign: "center", animation: "slideUp 0.3s ease-out" }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>
            {hasMotion ? "📱 Shake your phone!" : "Goncang the angpow! Shake it! 🤝"}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="progress-dot"
                style={{
                  backgroundColor: shakeCount > i ? "#FFD700" : "transparent",
                  transform: shakeCount > i ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <button className="btn-primary" onClick={handleShake}
            style={{ minHeight: 52, minWidth: 200, touchAction: "manipulation" }}>
            👋 {hasMotion ? "Or tap here!" : "Shake!"} ({3 - shakeCount} more)
          </button>
        </div>
      )}

      {phase === "opening" && (
        <div style={{ textAlign: "center", fontSize: 18, animation: "pulse 0.5s ease-in-out infinite" }}>
          ✨ Opening... ✨
        </div>
      )}

      {phase === "revealed" && (
        <div style={{ textAlign: "center", animation: "slideUp 0.5s ease-out 0.8s both", opacity: 0 }}>
          <button className="btn-primary" onClick={reset}>
            🧧 Open Another Angpow!
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div
          style={{
            marginTop: 32,
            width: "100%",
            maxWidth: 320,
            animation: "fadeIn 0.5s ease-out",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>
            Angpow History
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.slice(1).map((item, i) => (
              <div key={i} className="history-item">
                <span style={{ opacity: 0.7 }}>{item.blessing.split("—")[0].trim()}</span>
                <span style={{ fontWeight: 700, color: TIER_COLORS[item.tier] || "#FFD700" }}>
                  RM {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.3, textAlign: "center" }}>
        🐴 Gong Xi Fa Cai • 恭喜發財 • Happy Chinese New Year 2026 🐴
      </div>
    </div>
  );
}
