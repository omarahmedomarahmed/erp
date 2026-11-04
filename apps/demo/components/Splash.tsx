"use client";
import { useEffect, useState } from "react";

/** Full-screen brand loader: the company logo large in the middle and a progress bar under it. */
export function LoadingScreen({ progress, fading }: { progress?: number; fading?: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-canvas transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      role="status" aria-label="loading">
      <img src="/brand/logo-navy.png" alt="" className="w-[min(420px,75vw)] animate-[tt-pop_.6s_ease-out]" />
      <div className="h-2.5 w-[min(360px,70vw)] overflow-hidden rounded-full bg-line">
        {progress === undefined
          ? <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand to-accent animate-[tt-indeterminate_1.1s_ease-in-out_infinite]" />
          : <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />}
      </div>
    </div>
  );
}

/** Shown once per browser session on first load. Skipped for automated browsers (screenshots, PDF export). */
export function Splash() {
  const [p, setP] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    if (navigator.webdriver || location.search.includes("print=1")) return;
    try { if (sessionStorage.getItem("tt_splash")) return; sessionStorage.setItem("tt_splash", "1"); } catch { /* storage blocked: still show */ }
    setP(0);
    const steps = [18, 42, 63, 81, 94, 100];
    const timers = steps.map((v, i) => setTimeout(() => setP(v), 513 * (i + 1)));
    timers.push(setTimeout(() => setFading(true), 513 * steps.length + 250));
    timers.push(setTimeout(() => setP(null), 513 * steps.length + 800));
    return () => timers.forEach(clearTimeout);
  }, []);
  if (p === null) return null;
  return <LoadingScreen progress={p} fading={fading} />;
}
