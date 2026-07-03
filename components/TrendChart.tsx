"use client";

// The 14-day pain/soreness/stiffness line chart, shared by the athlete
// dashboard and the coach player view. Import via next/dynamic (ssr: false)
// so Recharts (~100KB+ of JS) stays out of the routes' initial bundles.

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface TrendPoint {
  date: string;
  Pain: number;
  Soreness: number;
  Stiffness: number;
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ backgroundColor: "#181818", border: "1px solid #2a2a2a" }}
    >
      <p className="mb-2 font-semibold text-gray-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ data, height = 220 }: { data: TrendPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#4b5563", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fill: "#4b5563", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<TrendTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: "12px" }}
        />
        <Line type="monotone" dataKey="Pain" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ef4444" }} />
        <Line type="monotone" dataKey="Soreness" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f59e0b" }} />
        <Line type="monotone" dataKey="Stiffness" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
