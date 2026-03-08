import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { Service, SERVICE_TYPES, ServiceType } from "@/types";
import { formatDate, generateId } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import { z } from "zod";

const serviceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Service type is required"),
  title: z.string().min(1, "Title is required"),
  preacher: z.string().min(1, "Preacher is required"),
  attendance: z.number({ invalid_type_error: "Must be a number" }).min(0),
  notes: z.string(),
});

const emptyForm = { date: "", type: "" as ServiceType, title: "", preacher: "", attendance: 0, notes: "" };

export default function Services() {
  const { services, setServices, income } = useAppData();
  const { toast } = useToast();
  const { addEntry } = useActivityLog();
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailService, setDetailService] = useState<Service | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...services]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.preacher.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
  }, [services, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setPanelOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ date: s.date, type: s.type, title: s.title, preacher: s.preacher, attendance: s.attendance, notes: s.notes });
    setErrors({});
    setPanelOpen(true);
  };

  const save = () => {
    const result = serviceSchema.safeParse({ ...form, attendance: Number(form.attendance) });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    if (editing) {
      setServices((prev) => prev.map((s) => (s.id === editing.id ? { ...s, date: result.data.date, type: result.data.type as ServiceType, title: result.data.title, preacher: result.data.preacher, attendance: result.data.attendance, notes: result.data.notes } : s)));
      addEntry(`Updated service: ${result.data.title}`, "service");
      toast({ title: "Service updated" });
    } else {
      const d = result.data;
      setServices((prev) => [...prev, { id: generateId(), date: d.date, type: d.type as ServiceType, title: d.title, preacher: d.preacher, attendance: d.attendance, notes: d.notes }]);
      addEntry(`Added service: ${d.title}`, "service");
      toast({ title: "Service added" });
    }
    setPanelOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setServices((prev) => prev.filter((s) => s.id !== deleteId));
    toast({ title: "Service deleted" });
    setDeleteId(null);
  };

  const serviceIncome = detailService ? income.filter((i) => i.serviceId === detailService.id) : [];

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Service</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No services found</p>
          <Button onClick={openAdd}>Add your first service</Button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Preacher</th>
                  <th className="text-right p-3 font-medium">Attendance</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 table-row-hover cursor-pointer"
                    onClick={() => setDetailService(s)}
                  >
                    <td className="p-3">{formatDate(s.date)}</td>
                    <td className="p-3">{s.type}</td>
                    <td className="p-3 font-medium">{s.title}</td>
                    <td className="p-3">{s.preacher}</td>
                    <td className="p-3 text-right">{s.attendance}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl h-full overflow-y-auto slide-in-right p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">{editing ? "Edit Service" : "Add Service"}</h3>
              <Button size="icon" variant="ghost" onClick={() => setPanelOpen(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <Label>Service Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ServiceType })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {errors.type && <p className="text-destructive text-xs mt-1">{errors.type}</p>}
              </div>
              <div>
                <Label>Title / Theme</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label>Preacher</Label>
                <Input value={form.preacher} onChange={(e) => setForm({ ...form, preacher: e.target.value })} />
                {errors.preacher && <p className="text-destructive text-xs mt-1">{errors.preacher}</p>}
              </div>
              <div>
                <Label>Attendance</Label>
                <Input type="number" value={form.attendance} onChange={(e) => setForm({ ...form, attendance: Number(e.target.value) })} />
                {errors.attendance && <p className="text-destructive text-xs mt-1">{errors.attendance}</p>}
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

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Service?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service detail */}
      <Dialog open={!!detailService} onOpenChange={() => setDetailService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{detailService?.title}</DialogTitle></DialogHeader>
          {detailService && (
            <div className="space-y-3 text-sm">
              <p><strong>Date:</strong> {formatDate(detailService.date)}</p>
              <p><strong>Type:</strong> {detailService.type}</p>
              <p><strong>Preacher:</strong> {detailService.preacher}</p>
              <p><strong>Attendance:</strong> {detailService.attendance}</p>
              {detailService.notes && <p><strong>Notes:</strong> {detailService.notes}</p>}
              <div className="pt-3 border-t border-border">
                <h4 className="font-semibold mb-2">Income for this service</h4>
                {serviceIncome.length === 0 ? (
                  <p className="text-muted-foreground">No income linked to this service</p>
                ) : (
                  <div className="space-y-1">
                    {serviceIncome.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.type}</span>
                        <span className="font-medium">GHS {i.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
