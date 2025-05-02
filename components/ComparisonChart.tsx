"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingDown } from "lucide-react";

interface ChartData {
  date: string;
  btc: number | null;
  gold: number | null;
  idr: number | null;
}

interface ComparisonChartProps {
  data: ChartData[];
  isLoading: boolean;
}

export const ComparisonChart = ({ data, isLoading }: ComparisonChartProps) => {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="space-y-4 w-full max-w-3xl">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-[400px] w-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center border border-dashed rounded-lg bg-muted/30">
        <TrendingDown className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">Tidak ada data tersedia</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Tidak dapat menampilkan data perbandingan. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  // Format dates for better display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="w-full h-[500px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickMargin={10}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          />
          <YAxis
            domain={[0, (dataMax: number) => Math.max(dataMax, 150)]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
            labelFormatter={(label) => `Tanggal: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="top"
            height={40}
            wrapperStyle={{
              paddingBottom: "10px",
            }}
          />
          <Line
            type="monotone"
            dataKey="btc"
            name="Bitcoin"
            stroke="#F7931A"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 1 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="gold"
            name="Emas"
            stroke="#FFD700"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 1 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="idr"
            name="IDR/USD"
            stroke="#CC0000"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 1 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
