"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";

interface MonthlyDataPoint {
  month: string;
  visitors: number;
  leads: number;
}

const MONTHLY_DATA: MonthlyDataPoint[] = [
  { month: "Jan", visitors: 1200, leads: 40 },
  { month: "Feb", visitors: 1900, leads: 55 },
  { month: "Mar", visitors: 1600, leads: 48 },
  { month: "Apr", visitors: 2400, leads: 70 },
  { month: "May", visitors: 2100, leads: 62 },
  { month: "Jun", visitors: 2800, leads: 85 },
  { month: "Jul", visitors: 3200, leads: 95 },
  { month: "Aug", visitors: 2950, leads: 88 },
  { month: "Sep", visitors: 3400, leads: 102 },
  { month: "Oct", visitors: 3100, leads: 96 },
  { month: "Nov", visitors: 3700, leads: 110 },
  { month: "Dec", visitors: 4200, leads: 128 },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#2B323D] bg-[#0F1115] px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-[#B7BDC7]">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-sm font-semibold text-white">
          {item.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function DashboardCharts() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card
        header="Website Visitors"
        description="Monthly visitor traffic overview"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid stroke="#2B323D" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#B7BDC7"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#2B323D" }}
              />
              <YAxis
                stroke="#B7BDC7"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#2B323D" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2B323D" }} />
              <Line
                type="monotone"
                dataKey="visitors"
                name="Visitors"
                stroke="#C08457"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#C08457" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        header="Leads"
        description="Monthly lead generation overview"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid stroke="#2B323D" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#B7BDC7"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#2B323D" }}
              />
              <YAxis
                stroke="#B7BDC7"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#2B323D" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2B323D" }} />
              <Line
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#B7BDC7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#B7BDC7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}