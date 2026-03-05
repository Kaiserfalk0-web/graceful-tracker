import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { INCOME_TYPES, IncomeType } from "@/types";
import { formatGHS, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";

type Period = "this_month" | "last_month" | "this_quarter" | "this_year" | "custom";

function getPeriodRange(period: Period, customStart: string, customEnd: string) {
  const now = new Date();
  let start: string, end: string;
  switch (period) {
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      break;
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1).toISOString().slice(0, 10);
      end = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().slice(0, 10);
      break;
    }
    case "this_year":
      start = `${now.getFullYear()}-01-01`;
      end = `${now.getFullYear()}-12-31`;
      break;
    case "custom":
      start = customStart;
      end = customEnd;
      break;
  }
  return { start, end };
}

export default function Reports() {
  const { income, services } = useAppData();
  const [period, setPeriod] = useState<Period>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPeriodRange(period, customStart, customEnd);

  const periodIncome = useMemo(
    () => income.filter((i) => i.date >= start && i.date <= end),
    [income, start, end]
  );

  const periodServices = useMemo(
    () => services.filter((s) => s.date >= start && s.date <= end),
    [services, start, end]
  );

  const grandTotal = periodIncome.reduce((s, i) => s + i.amount, 0);

  const incomeByType = INCOME_TYPES.map((type) => {
    const total = periodIncome.filter((i) => i.type === type).reduce((s, i) => s + i.amount, 0);
    return { type, total, pct: grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : "0.0" };
  });

  const totalAttendance = periodServices.reduce((s, sv) => s + sv.attendance, 0);
  const avgAttendance = periodServices.length > 0 ? Math.round(totalAttendance / periodServices.length) : 0;

  // Top contributors
  const topContributors = useMemo(() => {
    const map: Record<string, { name: string; total: number }> = {};
    periodIncome.forEach((rec) => {
      if (rec.type === "Offering" || !rec.memberContributions) return;
      rec.memberContributions.forEach((c) => {
        if (!map[c.memberName]) map[c.memberName] = { name: c.memberName, total: 0 };
        map[c.memberName].total += c.amount;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [periodIncome]);

  return (
    <div className="space-y-6 fade-up">
      {/* Period selector */}
      <div className="flex flex-wrap items-end gap-4 no-print">
        <div>
          <Label>Period</Label>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {period === "custom" && (
          <>
            <div>
              <Label>From</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </>
        )}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />Print Report
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print-only">
        <h1 className="text-2xl font-display font-bold text-center mb-1">GraceTrack Church Report</h1>
        <p className="text-center text-sm mb-4">{start} — {end}</p>
      </div>

      {/* Income summary */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold text-lg">Income Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Income Type</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-right p-3 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {incomeByType.map((row) => (
                <tr key={row.type} className="border-b border-border/50 table-row-hover">
                  <td className="p-3">{row.type}</td>
                  <td className="p-3 text-right">{formatGHS(row.total)}</td>
                  <td className="p-3 text-right">{row.pct}%</td>
                </tr>
              ))}
              <tr className="bg-muted/20 font-semibold">
                <td className="p-3">Grand Total</td>
                <td className="p-3 text-right">{formatGHS(grandTotal)}</td>
                <td className="p-3 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">{periodServices.length}</p>
            <p className="text-sm text-muted-foreground">Services Held</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">{totalAttendance}</p>
            <p className="text-sm text-muted-foreground">Total Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">{avgAttendance}</p>
            <p className="text-sm text-muted-foreground">Avg per Service</p>
          </div>
        </div>
      </div>

      {/* Top contributors */}
      {topContributors.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold text-lg">Top Contributing Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-right p-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.map((c, i) => (
                  <tr key={c.name} className="border-b border-border/50 table-row-hover">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-right font-medium">{formatGHS(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
