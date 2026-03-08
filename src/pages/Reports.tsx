import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { INCOME_TYPES } from "@/types";
import { formatGHS, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Plus, FileText, Users, Church, Wallet } from "lucide-react";
import { useChurchProfile } from "@/hooks/useChurchProfile";
import { useActivityLog } from "@/hooks/useActivityLog";

type Period = "this_month" | "last_month" | "this_quarter" | "this_year" | "custom";
type ReportType = "income" | "attendance" | "members" | "contributions";

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
  const { income, services, members } = useAppData();
  const { profile } = useChurchProfile();
  const { addEntry } = useActivityLog();
  const [period, setPeriod] = useState<Period>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeTab, setActiveTab] = useState<ReportType>("income");

  const { start, end } = getPeriodRange(period, customStart, customEnd);

  const periodIncome = useMemo(
    () => income.filter((i) => i.date >= start && i.date <= end),
    [income, start, end]
  );

  const periodServices = useMemo(
    () => services.filter((s) => s.date >= start && s.date <= end),
    [services, start, end]
  );

  const periodMembers = useMemo(
    () => members.filter((m) => m.dateJoined >= start && m.dateJoined <= end),
    [members, start, end]
  );

  const grandTotal = periodIncome.reduce((s, i) => s + i.amount, 0);

  const incomeByType = INCOME_TYPES.map((type) => {
    const total = periodIncome.filter((i) => i.type === type).reduce((s, i) => s + i.amount, 0);
    return { type, total, pct: grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : "0.0" };
  });

  const totalAttendance = periodServices.reduce((s, sv) => s + sv.attendance, 0);
  const avgAttendance = periodServices.length > 0 ? Math.round(totalAttendance / periodServices.length) : 0;

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
        <Button variant="outline" onClick={() => {
          addEntry(`Printed ${activeTab} report (${period})`, "report");
          window.print();
        }}>
          <Printer className="w-4 h-4 mr-2" />Print Report
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print-only">
        <h1 className="text-2xl font-display font-bold text-center mb-1">{profile.churchName || "GraceTrack Church"} — Report</h1>
        <p className="text-center text-sm mb-1">{start} — {end}</p>
        {profile.pastorName && <p className="text-center text-xs text-muted-foreground mb-4">Prepared by: {profile.pastorName}</p>}
      </div>

      {/* Report tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportType)} className="no-print">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="income" className="gap-1.5">
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Income</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <Church className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="contributions" className="gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Contributors</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Income Summary (always visible on print, tab-controlled on screen) */}
      <div className={activeTab !== "income" ? "hidden print-only" : ""}>
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

        {/* Individual income records */}
        {periodIncome.length > 0 && (
          <div className="glass-card overflow-hidden mt-4">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold text-lg">Income Records ({periodIncome.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Recorded By</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {periodIncome.sort((a, b) => b.date.localeCompare(a.date)).map((rec) => (
                    <tr key={rec.id} className="border-b border-border/50 table-row-hover">
                      <td className="p-3">{formatDate(rec.date)}</td>
                      <td className="p-3">{rec.type}</td>
                      <td className="p-3 text-right font-medium">{formatGHS(rec.amount)}</td>
                      <td className="p-3 hidden md:table-cell">{rec.recordedBy}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{rec.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Summary */}
      <div className={activeTab !== "attendance" ? "hidden print-only" : ""}>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

        {/* Service records list */}
        {periodServices.length > 0 && (
          <div className="glass-card overflow-hidden mt-4">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold text-lg">Services ({periodServices.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Title</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Preacher</th>
                    <th className="text-right p-3 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {periodServices.sort((a, b) => b.date.localeCompare(a.date)).map((svc) => (
                    <tr key={svc.id} className="border-b border-border/50 table-row-hover">
                      <td className="p-3">{formatDate(svc.date)}</td>
                      <td className="p-3">{svc.type}</td>
                      <td className="p-3 font-medium">{svc.title}</td>
                      <td className="p-3 hidden md:table-cell">{svc.preacher}</td>
                      <td className="p-3 text-right">{svc.attendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Members Report */}
      <div className={activeTab !== "members" ? "hidden print-only" : ""}>
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Members Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-primary">{members.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-primary">{members.filter((m) => m.active).length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-primary">{periodMembers.length}</p>
              <p className="text-sm text-muted-foreground">Joined This Period</p>
            </div>
          </div>
        </div>

        {/* New members in period */}
        {periodMembers.length > 0 && (
          <div className="glass-card overflow-hidden mt-4">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold text-lg">New Members ({periodMembers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left p-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {periodMembers.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 table-row-hover">
                      <td className="p-3 font-medium">{m.fullName}</td>
                      <td className="p-3">{m.phone}</td>
                      <td className="p-3 hidden md:table-cell">{m.email}</td>
                      <td className="p-3">{formatDate(m.dateJoined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Full member roster */}
        <div className="glass-card overflow-hidden mt-4">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold text-lg">Full Roster ({members.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 table-row-hover">
                    <td className="p-3 font-medium">{m.fullName}</td>
                    <td className="p-3">{m.phone}</td>
                    <td className="p-3 hidden md:table-cell">{m.email}</td>
                    <td className="p-3">
                      <span className={m.active ? "text-primary" : "text-muted-foreground"}>{m.active ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className={activeTab !== "contributions" ? "hidden print-only" : ""}>
        {topContributors.length > 0 ? (
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
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No member contributions found for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
