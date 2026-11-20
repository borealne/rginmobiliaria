"use client";

import { useEffect, useRef, useState } from "react";

/** Contador: anima una sola vez al entrar en pantalla; con "reducir movimiento" aparece terminado. */
export function Counter({ value, prefix = "", label }: { value: number; prefix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="group flex flex-col items-center rounded-xl p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span
        className="font-headline-lg text-[40px] md:text-[56px] leading-tight font-bold tracking-tight text-on-primary group-hover:text-rg-red transition-colors duration-300 motion-reduce:transition-none tabular-nums"
        aria-hidden
      >
        {prefix}
        {shown}
      </span>
      <span className="sr-only">
        {prefix}
        {value} {label}
      </span>
      <span className="font-body-md text-body-md text-secondary-fixed-dim mt-2" aria-hidden>
        {label}
      </span>
    </div>
  );
}
