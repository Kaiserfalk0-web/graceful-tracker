import { useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { StatCard } from "@/components/StatCard";
import { formatGHS, formatDate, getCurrentMonthRange, getMonthLabel } from "@/lib/format";
import { IncomeType, INCOME_TYPE_CHART_COLORS, INCOME_TYPES } from "@/types";
import { Heart, TrendingUp, Users, DollarSign, PiggyBank, BarChart3 } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

export default function Dashboard() {
  const { services, income, members } = useAppData();
  const { start, end } = getCurrentMonthRange();

  const monthIncome = useMemo(
    () => income.filter((i) => i.date >= start && i.date <= end),
    [income, start, end]
  );

  const totalByType = (type: IncomeType) =>
    monthIncome.filter((i) => i.type === type).reduce((s, i) => s + i.amount, 0);

  const grandTotal = monthIncome.reduce((s, i) => s + i.amount, 0);
  const totalAttendance = useMemo(
    () => services.filter((s) => s.date >= start && s.date <= end).reduce((s, sv) => s + sv.attendance, 0),
    [services, start, end]
  );

  // Donut chart data
  const donutData = INCOME_TYPES.map((type) => ({
    name: type,
    value: totalByType(type),
  })).filter((d) => d.value > 0);

  // Line chart — last 6 months
  const lineData = useMemo(() => {
    const months: Record<string, Record<string, number>> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = { month: label as any } as any;
      INCOME_TYPES.forEach((t) => ((months[key] as any)[t] = 0));
    }
    income.forEach((rec) => {
      const key = rec.date.slice(0, 7);
      if (months[key]) (months[key] as any)[rec.type] += rec.amount;
    });
    return Object.values(months);
  }, [income]);

  const recentServices = [...services].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentIncome = [...income].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-8 fade-up">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<Heart className="w-5 h-5" />} label="Offering" value={totalByType("Offering")} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Tithes" value={totalByType("Tithe")} />
        <StatCard icon={<PiggyBank className="w-5 h-5" />} label="Fundraising" value={totalByType("Fundraising")} />
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="BENMP" value={totalByType("BENMP")} />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Grand Total" value={grandTotal} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Attendance" value={totalAttendance} prefix="" decimals={0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Income Breakdown</h3>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={INCOME_TYPE_CHART_COLORS[entry.name as IncomeType]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatGHS(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No income data this month</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Monthly Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(37 20% 85%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatGHS(v)} />
              <Legend />
              {INCOME_TYPES.map((type) => (
                <Line key={type} type="monotone" dataKey={type} stroke={INCOME_TYPE_CHART_COLORS[type]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Recent Services</h3>
          {recentServices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No services recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.date)} · {s.type}</p>
                  </div>
                  <span className="text-sm font-medium">{s.attendance} attended</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Recent Income</h3>
          {recentIncome.length === 0 ? (
            <p className="text-muted-foreground text-sm">No income recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIncome.map((i) => (
                <div key={i.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{i.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(i.date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{formatGHS(i.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
