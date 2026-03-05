import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { IncomeRecord, IncomeType, INCOME_TYPES, INCOME_TYPE_COLORS, INCOME_TYPE_CHART_COLORS, MemberContribution } from "@/types";
import { formatGHS, formatDate, generateId } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, X, Download, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface IncomeForm {
  date: string;
  type: IncomeType;
  amount: number;
  serviceId: string;
  recordedBy: string;
  notes: string;
  memberContributions: MemberContribution[];
}

const emptyForm: IncomeForm = { date: "", type: "Offering", amount: 0, serviceId: "", recordedBy: "", notes: "", memberContributions: [] };

export default function Finances() {
  const { income, setIncome, services, members } = useAppData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeRecord | null>(null);
  const [form, setForm] = useState<IncomeForm>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [contributionDetail, setContributionDetail] = useState<string | null>(null);

  const needsMemberTracking = form.type !== "Offering";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...income]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((i) => {
        if (typeFilter !== "all" && i.type !== typeFilter) return false;
        return (
          i.type.toLowerCase().includes(q) ||
          i.recordedBy.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q)
        );
      });
  }, [income, search, typeFilter]);

  const filteredTotal = filtered.reduce((s, i) => s + i.amount, 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setPanelOpen(true);
  };

  const openEdit = (rec: IncomeRecord) => {
    setEditing(rec);
    setForm({
      date: rec.date,
      type: rec.type,
      amount: rec.amount,
      serviceId: rec.serviceId || "",
      recordedBy: rec.recordedBy,
      notes: rec.notes,
      memberContributions: rec.memberContributions || [],
    });
    setErrors({});
    setPanelOpen(true);
  };

  const addContribution = () => {
    setForm((f) => ({
      ...f,
      memberContributions: [...f.memberContributions, { memberName: "", amount: 0 }],
    }));
  };

  const updateContribution = (idx: number, field: keyof MemberContribution, value: string | number) => {
    setForm((f) => {
      const updated = [...f.memberContributions];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "memberName") {
        const found = members.find((m) => m.fullName === value);
        updated[idx].memberId = found?.id;
      }
      return {
        ...f,
        memberContributions: updated,
        amount: needsMemberTracking ? updated.reduce((s, c) => s + Number(c.amount), 0) : f.amount,
      };
    });
  };

  const removeContribution = (idx: number) => {
    setForm((f) => {
      const updated = f.memberContributions.filter((_, i) => i !== idx);
      return { ...f, memberContributions: updated, amount: updated.reduce((s, c) => s + Number(c.amount), 0) };
    });
  };

  const save = () => {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Required";
    if (!form.type) errs.type = "Required";
    if (form.type === "Offering" && form.amount <= 0) errs.amount = "Amount must be > 0";
    if (needsMemberTracking && form.memberContributions.length === 0) errs.contributions = "Add at least one member contribution";
    if (needsMemberTracking) {
      form.memberContributions.forEach((c, i) => {
        if (!c.memberName) errs[`mc_name_${i}`] = "Name required";
        if (c.amount <= 0) errs[`mc_amount_${i}`] = "Amount required";
      });
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const amount = needsMemberTracking
      ? form.memberContributions.reduce((s, c) => s + Number(c.amount), 0)
      : Number(form.amount);

    const record: IncomeRecord = {
      id: editing?.id || generateId(),
      date: form.date,
      type: form.type,
      amount,
      serviceId: form.serviceId || undefined,
      recordedBy: form.recordedBy,
      notes: form.notes,
      memberContributions: needsMemberTracking ? form.memberContributions : undefined,
    };

    if (editing) {
      setIncome((prev) => prev.map((i) => (i.id === editing.id ? record : i)));
      toast({ title: "Income updated" });
    } else {
      setIncome((prev) => [...prev, record]);
      toast({ title: "Income added" });
    }
    setPanelOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setIncome((prev) => prev.filter((i) => i.id !== deleteId));
    toast({ title: "Income deleted" });
    setDeleteId(null);
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Type", "Amount", "Recorded By", "Notes"],
      ...filtered.map((i) => [i.date, i.type, i.amount.toFixed(2), i.recordedBy, i.notes]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gracetrack-income.csv";
    a.click();
  };

  // Member contributions aggregated
  const memberContributionsSummary = useMemo(() => {
    const map: Record<string, { name: string; Tithe: number; Fundraising: number; BENMP: number; Other: number; total: number; lastDate: string }> = {};
    income.forEach((rec) => {
      if (rec.type === "Offering" || !rec.memberContributions) return;
      rec.memberContributions.forEach((c) => {
        if (!map[c.memberName]) {
          map[c.memberName] = { name: c.memberName, Tithe: 0, Fundraising: 0, BENMP: 0, Other: 0, total: 0, lastDate: "" };
        }
        const entry = map[c.memberName];
        if (rec.type in entry) (entry as any)[rec.type] += c.amount;
        entry.total += c.amount;
        if (rec.date > entry.lastDate) entry.lastDate = rec.date;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [income]);

  const memberHistory = useMemo(() => {
    if (!contributionDetail) return [];
    return income
      .filter((r) => r.memberContributions?.some((c) => c.memberName === contributionDetail))
      .map((r) => ({
        date: r.date,
        type: r.type,
        amount: r.memberContributions!.find((c) => c.memberName === contributionDetail)!.amount,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [income, contributionDetail]);

  // BENMP monthly
  const benmpMonthly = useMemo(() => {
    const map: Record<string, number> = {};
    income.filter((i) => i.type === "BENMP").forEach((i) => {
      const key = i.date.slice(0, 7);
      map[key] = (map[key] || 0) + i.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [income]);

  const filteredMembers = members.filter((m) => m.fullName.toLowerCase().includes(memberSearch.toLowerCase()));

  return (
    <div className="space-y-6 fade-up">
      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="contributions">Member Contributions</TabsTrigger>
          <TabsTrigger value="benmp">BENMP</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {INCOME_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
              <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Income</Button>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Recorded By</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id} className="border-b border-border/50 table-row-hover">
                      <td className="p-3">{formatDate(i.date)}</td>
                      <td className="p-3"><Badge variant="outline" className={INCOME_TYPE_COLORS[i.type]}>{i.type}</Badge></td>
                      <td className="p-3 text-right font-medium">{formatGHS(i.amount)}</td>
                      <td className="p-3 hidden md:table-cell">{i.recordedBy}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20">
                    <td colSpan={2} className="p-3 font-semibold">Total</td>
                    <td className="p-3 text-right font-bold">{formatGHS(filteredTotal)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4 mt-4">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Member</th>
                    <th className="text-right p-3 font-medium">Tithe</th>
                    <th className="text-right p-3 font-medium">Fundraising</th>
                    <th className="text-right p-3 font-medium">BENMP</th>
                    <th className="text-right p-3 font-medium">Other</th>
                    <th className="text-right p-3 font-medium">Total</th>
                    <th className="text-left p-3 font-medium">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {memberContributionsSummary.map((m) => (
                    <tr key={m.name} className="border-b border-border/50 table-row-hover cursor-pointer" onClick={() => setContributionDetail(m.name)}>
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3 text-right">{formatGHS(m.Tithe)}</td>
                      <td className="p-3 text-right">{formatGHS(m.Fundraising)}</td>
                      <td className="p-3 text-right">{formatGHS(m.BENMP)}</td>
                      <td className="p-3 text-right">{formatGHS(m.Other)}</td>
                      <td className="p-3 text-right font-bold">{formatGHS(m.total)}</td>
                      <td className="p-3">{formatDate(m.lastDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="benmp" className="space-y-4 mt-4">
          {benmpMonthly.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Monthly BENMP</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={benmpMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(37 20% 85%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatGHS(v)} />
                  <Bar dataKey="amount" fill={INCOME_TYPE_CHART_COLORS.BENMP} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Members</th>
                  </tr>
                </thead>
                <tbody>
                  {income.filter((i) => i.type === "BENMP").sort((a, b) => b.date.localeCompare(a.date)).map((i) => (
                    <tr key={i.id} className="border-b border-border/50 table-row-hover">
                      <td className="p-3">{formatDate(i.date)}</td>
                      <td className="p-3 text-right font-medium">{formatGHS(i.amount)}</td>
                      <td className="p-3">
                        {i.memberContributions?.map((c) => (
                          <span key={c.memberName} className="inline-block mr-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                            {c.memberName}: {formatGHS(c.amount)}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Slide-over panel for add/edit income */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-lg bg-card shadow-2xl h-full overflow-y-auto slide-in-right p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">{editing ? "Edit Income" : "Add Income"}</h3>
              <Button size="icon" variant="ghost" onClick={() => setPanelOpen(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <Label>Income Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as IncomeType, memberContributions: v === "Offering" ? [] : form.memberContributions })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INCOME_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {!needsMemberTracking && (
                <div>
                  <Label>Amount (GHS)</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                  {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
                </div>
              )}

              {needsMemberTracking && (
                <div className="space-y-3 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Member Contributions</Label>
                    <Button size="sm" variant="outline" onClick={addContribution}><UserPlus className="w-4 h-4 mr-1" />Add</Button>
                  </div>
                  {errors.contributions && <p className="text-destructive text-xs">{errors.contributions}</p>}
                  {form.memberContributions.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Member name"
                          value={c.memberName}
                          onChange={(e) => { updateContribution(idx, "memberName", e.target.value); setMemberSearch(e.target.value); }}
                          list={`members-list-${idx}`}
                        />
                        <datalist id={`members-list-${idx}`}>
                          {members.map((m) => <option key={m.id} value={m.fullName} />)}
                        </datalist>
                        {errors[`mc_name_${idx}`] && <p className="text-destructive text-xs mt-1">{errors[`mc_name_${idx}`]}</p>}
                      </div>
                      <div className="w-28">
                        <Input type="number" placeholder="Amount" value={c.amount || ""} onChange={(e) => updateContribution(idx, "amount", Number(e.target.value))} />
                        {errors[`mc_amount_${idx}`] && <p className="text-destructive text-xs mt-1">{errors[`mc_amount_${idx}`]}</p>}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeContribution(idx)}><X className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {form.memberContributions.length > 0 && (
                    <div className="text-right text-sm font-semibold pt-2 border-t border-border">
                      Total: {formatGHS(form.memberContributions.reduce((s, c) => s + Number(c.amount), 0))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label>Linked Service</Label>
                <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {services.map((s) => <SelectItem key={s.id} value={s.id}>{formatDate(s.date)} — {s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recorded By</Label>
                <Input value={form.recordedBy} onChange={(e) => setForm({ ...form, recordedBy: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={save} className="flex-1">{editing ? "Update" : "Save"}</Button>
              <Button variant="outline" onClick={() => setPanelOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Income Record?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member contribution history */}
      <Dialog open={!!contributionDetail} onOpenChange={() => setContributionDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">{contributionDetail}'s Contributions</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {memberHistory.map((h, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{h.type}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.date)}</p>
                </div>
                <span className="font-medium">{formatGHS(h.amount)}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
