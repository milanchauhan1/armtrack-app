"use client";

// Shimmering placeholder blocks — shown while data loads.
// Uses a moving-gradient shimmer for a premium feel.

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`armtrack-shimmer rounded-xl ${className}`}
      style={{ backgroundColor: "#141414", ...style }}
    />
  );
}

/** Full dashboard loading skeleton — mirrors the real layout. */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="mx-auto max-w-lg px-5 pt-8 flex flex-col gap-6">
        {/* Greeting */}
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 140, height: 12 }} />
          <Skeleton style={{ width: 200, height: 26 }} />
        </div>

        {/* Readiness ring card */}
        <Skeleton style={{ height: 240, borderRadius: 24 }} />

        {/* Recommendation */}
        <Skeleton style={{ height: 88, borderRadius: 20 }} />

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          <Skeleton style={{ height: 92 }} />
          <Skeleton style={{ height: 92 }} />
          <Skeleton style={{ height: 92 }} />
        </div>

        {/* Chart */}
        <Skeleton style={{ height: 200, borderRadius: 20 }} />
      </div>
    </div>
  );
}

/** History loading skeleton. */
export function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="mx-auto max-w-[600px] px-4 pt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 110, height: 12 }} />
          <Skeleton style={{ width: 240, height: 24 }} />
        </div>
        <Skeleton style={{ height: 96, borderRadius: 20 }} />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton style={{ height: 88 }} />
          <Skeleton style={{ height: 88 }} />
          <Skeleton style={{ height: 88 }} />
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ height: 64, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Log page loading skeleton. */
export function LogSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="mx-auto max-w-lg px-5 pt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton style={{ width: 160, height: 12 }} />
          <Skeleton style={{ width: 120, height: 14 }} />
        </div>
        <Skeleton style={{ height: 280, borderRadius: 20 }} />
        <Skeleton style={{ height: 120, borderRadius: 20 }} />
        <Skeleton style={{ height: 120, borderRadius: 20 }} />
      </div>
    </div>
  );
}
