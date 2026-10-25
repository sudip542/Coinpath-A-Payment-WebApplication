import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

interface ChartDataPoint {
  date: string;
  income: number;
  expenses: number;
}

interface TransactionChartProps {
  data?: ChartDataPoint[];
  currency?: string;
  className?: string;
}

const defaultChartData: ChartDataPoint[] = [
  { date: "Oct 18", income: 5000, expenses: 1200 },
  { date: "Oct 19", income: 0, expenses: 890 },
  { date: "Oct 20", income: 1250, expenses: 2400 },
  { date: "Oct 21", income: 8000, expenses: 3100 },
  { date: "Oct 22", income: 2500, expenses: 5000 },
  { date: "Oct 23", income: 0, expenses: 3200 },
  { date: "Oct 24", income: 15000, expenses: 1800 },
];

export const TransactionChart: React.FC<TransactionChartProps> = ({
  data = defaultChartData,
  currency = "INR",
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Income vs. Expenses
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cash inflow & expenditure trends over past 7 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc = payload[0]?.value as number;
                    const exp = payload[1]?.value as number;
                    return (
                      <div className="rounded-lg border border-border bg-card p-2.5 shadow-lg text-xs space-y-1">
                        <p className="font-bold text-foreground">{label}</p>
                        <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Income:</span>
                          <span className="font-mono font-semibold">{formatCurrency(inc, { currency })}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-indigo-600 dark:text-indigo-400">
                          <span>Expenses:</span>
                          <span className="font-mono font-semibold">{formatCurrency(exp, { currency })}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
