"use client";

import { useEffect, useRef, useState, type RefObject, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * OrbitCardStack — Scroll-Driven Orbiting Cards to Stacked Deck Reveal
 *
 * Frame 1: Cards surround the centered heading along a wide orbital arc.
 * Mid-scroll: Cards spin clockwise around the heading while spiraling closer.
 * Final frame: All cards converge and stack into a tilted deck below the text.
 * ───────────────────────────────────────────────────────────────────────────── */

export type OrbitCardItem = {
  id: string;
  /** Initial orbital angle in degrees (0° = right, 90° = bottom, 180° = left, 270° = top) */
  angle: number;
  /** Final tilt in degrees when stacked below the heading */
  stackRotate: number;
  /** Tiny x/y offset in px when stacked for an organic fanned-deck feel */
  stackOffset?: { x: number; y: number };
  /** Card content */
  content: ReactNode;
  className?: string;
};

export type OrbitCardStackProps = {
  /** Main centered heading */
  heading?: ReactNode;
  /** Cards to orbit and stack (defaults to 5 showcase cards) */
  cards?: OrbitCardItem[];
  /** Optional scroll container ref for embedded preview boxes */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Sticky viewport height (default: 100svh) */
  stageHeight?: string;
  /** Custom container class name */
  className?: string;
};

const DEFAULT_CARDS: OrbitCardItem[] = [
  {
    id: "analytics",
    angle: -122,
    stackRotate: -11,
    stackOffset: { x: -8, y: 2 },
    className: "bg-[#c2f970] p-2.5",
    content: (
      <div className="flex size-full flex-col justify-between rounded-xl bg-white p-2.5 text-neutral-900 shadow-xs">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 text-[8px] font-medium leading-tight text-neutral-600 sm:text-[9px]">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>Live Payment Transactions</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold tabular-nums tracking-tight sm:text-sm">2,847</div>
            <div className="text-[6px] font-semibold uppercase tracking-wider text-emerald-600">
              ↑ 2.5% vs last week
            </div>
          </div>
        </div>
        <svg viewBox="0 0 120 42" className="mt-1 w-full overflow-visible" fill="none">
          <defs>
            <linearGradient id="orbitChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M0 36 C18 32, 26 20, 42 22 C56 24, 62 8, 76 12 C90 16, 102 28, 120 18 L120 42 L0 42 Z"
            fill="url(#orbitChartGrad)"
          />
          <path
            d="M0 36 C18 32, 26 20, 42 22 C56 24, 62 8, 76 12 C90 16, 102 28, 120 18"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="76" cy="12" r="2.8" fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
        </svg>
      </div>
    ),
  },
  {
    id: "onboard",
    angle: 168,
    stackRotate: 9,
    stackOffset: { x: 6, y: -2 },
    content: (
      <div className="relative size-full overflow-hidden bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
          alt="Support specialist"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-2 bottom-2 rounded-lg bg-white/85 px-2 py-1.5 text-neutral-900 shadow-sm backdrop-blur-md">
          <div className="text-[7px] font-medium text-neutral-500">Welcome onboard</div>
          <div className="mt-0.5 flex items-center justify-between text-[8px] font-semibold">
            <span>Start assisted setup</span>
            <span>→</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "merchant",
    angle: -34,
    stackRotate: -6,
    stackOffset: { x: -4, y: 3 },
    content: (
      <div className="relative size-full overflow-hidden bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80"
          alt="Merchant accepting mobile payments"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-2 bottom-2 grid grid-cols-4 gap-1">
          {["UPI", "Pay", "GPay", "RuPay", "VISA", "Card", "Net", "MC"].map((label) => (
            <span
              key={label}
              className="rounded bg-white/85 py-0.5 text-center text-[6px] font-bold tracking-tight text-neutral-800 backdrop-blur-xs"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "no-hidden",
    angle: 26,
    stackRotate: 5,
    stackOffset: { x: 3, y: 1 },
    className: "bg-[#259fe0] p-2.5 text-white",
    content: (
      <div className="flex size-full flex-col items-center justify-between text-center">
        <div className="text-[11px] font-semibold leading-none tracking-tight sm:text-xs">
          No Hidden
        </div>
        <div className="relative my-1 size-[64%] overflow-hidden rounded-lg border border-white/40 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&auto=format&fit=crop&q=80"
            alt="Mobile payment"
            className="size-full object-cover"
          />
        </div>
        <div className="text-[11px] font-semibold leading-none tracking-tight sm:text-xs">
          Charges
        </div>
      </div>
    ),
  },
  {
    id: "payout",
    angle: 108,
    stackRotate: -3,
    stackOffset: { x: 0, y: 0 },
    className: "bg-[#063f22] p-3 text-white",
    content: (
      <div className="flex size-full flex-col justify-center gap-2">
        <div className="rounded-lg bg-white/10 px-2.5 py-2 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-emerald-400/25 text-[8px] font-bold text-emerald-200">
                A
              </span>
              <div>
                <div className="text-[9px] font-semibold leading-none">Abhishek</div>
                <div className="mt-0.5 text-[6px] text-white/60">372145</div>
              </div>
            </div>
            <div className="text-[10px] font-bold tabular-nums text-emerald-100">₹11,000.00</div>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-neutral-900">
          <span className="flex items-center gap-1 text-[8px] font-bold">
            <span className="size-2.5 rounded-full bg-orange-500" />
            INR
          </span>
          <span className="text-[8px] text-neutral-400">⇄</span>
          <div className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-sky-600" />
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="size-2.5 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>
    ),
  },
];

function OrbitCard({
  card,
  index,
  total,
  progress,
  stageSize,
}: {
  card: OrbitCardItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stageSize: { width: number; height: number };
}) {
  const rxWide = Math.min(stageSize.width * 0.34, 400);
  const ryWide = Math.min(stageSize.height * 0.33, 215);
  const stackCenterY = Math.min(stageSize.height * 0.21, 118);

  // Orbit angle spins clockwise around the heading as user scrolls
  const angleDeg = useTransform(
    progress,
    [0.05, 0.48, 0.84],
    [card.angle, card.angle + 155, card.angle + 225]
  );

  // Radial distance shrinks from wide ring -> tight halo around heading -> 0 (stacked)
  const radiusFactor = useTransform(progress, [0.05, 0.48, 0.84], [1, 0.64, 0]);

  // Center of the ring shifts down below the heading during final convergence
  const centerY = useTransform(progress, [0.46, 0.84], [0, stackCenterY]);

  // Stack convergence factor (0 = orbiting, 1 = stacked deck)
  const stackT = useTransform(progress, [0.55, 0.84], [0, 1]);

  const x = useTransform([angleDeg, radiusFactor, stackT], ([a, r, s]: number[]) => {
    const rad = (a * Math.PI) / 180;
    const orbitX = Math.cos(rad) * rxWide * r;
    const offX = (card.stackOffset?.x ?? 0) * s;
    return orbitX + offX;
  });

  const y = useTransform([angleDeg, radiusFactor, centerY, stackT], ([a, r, cy, s]: number[]) => {
    const rad = (a * Math.PI) / 180;
    const orbitY = Math.sin(rad) * ryWide * r;
    const offY = (card.stackOffset?.y ?? 0) * s;
    return cy + orbitY + offY;
  });

  const scale = useTransform(progress, [0.05, 0.48, 0.84], [1, 0.94, 0.62]);
  const rotate = useTransform(progress, [0.05, 0.48, 0.84], [0, (index % 2 === 0 ? -3 : 3), card.stackRotate]);

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        rotate,
        zIndex: index < total - 1 ? 10 + index : 20,
      }}
      className={cn(
        "absolute left-1/2 top-1/2 -ml-[clamp(3.25rem,6.5vw,4.75rem)] -mt-[clamp(3.25rem,6.5vw,4.75rem)] size-[clamp(6.5rem,13vw,9.5rem)] overflow-hidden rounded-2xl shadow-[0_20px_45px_-15px_rgb(0_0_0/0.16)] ring-1 ring-black/5",
        card.className
      )}
    >
      {card.content}
    </motion.div>
  );
}

export function OrbitCardStack({
  heading,
  cards = DEFAULT_CARDS,
  scrollContainer,
  stageHeight = "100svh",
  className,
}: OrbitCardStackProps) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 960, height: 544 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: root,
    container: scrollContainer,
    offset: ["start start", "end end"],
  });

  // Heading gently lifts as cards stack below it in the final frame
  const headingY = useTransform(
    scrollYProgress,
    [0.46, 0.84],
    [0, -Math.min(stageSize.height * 0.11, 56)]
  );

  // Soft frosted halo behind heading intensifies while cards orbit close to text
  const haloOpacity = useTransform(scrollYProgress, [0.15, 0.48, 0.75], [0.25, 0.92, 0.3]);

  return (
    <section
      ref={root}
      className={cn("relative w-full bg-white text-neutral-950", className)}
      style={{ height: `calc(${stageHeight} * 3.2)` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden bg-white"
        style={{ height: stageHeight }}
      >
        {/* Ambient pastel-green washes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-[28rem] rounded-full bg-emerald-200/40 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-16 size-[30rem] rounded-full bg-lime-200/40 blur-[95px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/4 size-[26rem] rounded-full bg-emerald-100/45 blur-[90px]"
        />

        {/* Large subtle curved orbital arc lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
          fill="none"
        >
          <path
            d="M-60 40 Q 600 260 1260 40"
            stroke="rgba(15, 23, 42, 0.065)"
            strokeWidth="1.25"
          />
          <path
            d="M-60 660 Q 600 440 1260 660"
            stroke="rgba(15, 23, 42, 0.065)"
            strokeWidth="1.25"
          />
        </svg>

        {/* Orbiting / Stacking Cards */}
        <div className="pointer-events-none absolute inset-0">
          {cards.map((card, i) => (
            <OrbitCard
              key={card.id}
              card={card}
              index={i}
              total={cards.length}
              progress={scrollYProgress}
              stageSize={stageSize}
            />
          ))}
        </div>

        {/* Center Heading with soft frosted readability halo */}
        <motion.div
          style={{ y: headingY }}
          className="relative z-30 flex items-center justify-center px-6 text-center"
        >
          <motion.div
            aria-hidden="true"
            style={{ opacity: haloOpacity }}
            className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-full bg-white/85 blur-2xl"
          />
          <h2 className="relative max-w-[16ch] text-[clamp(1.5rem,1rem+2.1vw,2.65rem)] font-medium leading-[1.08] tracking-[-0.035em] text-neutral-950">
            {heading ?? (
              <>
                The whole
                <br />
                payments stack,
                <br />
                on one platform.
              </>
            )}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

export default OrbitCardStack;
