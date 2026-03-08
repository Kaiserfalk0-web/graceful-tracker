import { useState, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { Member } from "@/types";
import { formatDate, generateId } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";

const emptyForm = { fullName: "", phone: "", email: "", dateJoined: "", active: true, notes: "" };

export default function Members() {
  const { members, setMembers } = useAppData();
  const { toast } = useToast();
  const { addEntry } = useActivityLog();
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(
      (m) => m.fullName.toLowerCase().includes(q) || m.phone.includes(q)
    );
  }, [members, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, dateJoined: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setPanelOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ fullName: m.fullName, phone: m.phone, email: m.email, dateJoined: m.dateJoined, active: m.active, notes: m.notes });
    setErrors({});
    setPanelOpen(true);
  };

  const save = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (editing) {
      setMembers((prev) => prev.map((m) => (m.id === editing.id ? { ...m, ...form } : m)));
      toast({ title: "Member updated" });
    } else {
      setMembers((prev) => [...prev, { id: generateId(), ...form }]);
      toast({ title: "Member added" });
    }
    setPanelOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteId));
    toast({ title: "Member removed" });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Member</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No members found</p>
          <Button onClick={openAdd}>Add your first member</Button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 font-medium">Full Name</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 table-row-hover">
                    <td className="p-3 font-medium">{m.fullName}</td>
                    <td className="p-3">{m.phone}</td>
                    <td className="p-3 hidden md:table-cell">{m.email}</td>
                    <td className="p-3 hidden sm:table-cell">{formatDate(m.dateJoined)}</td>
                    <td className="p-3">
                      <Badge variant={m.active ? "default" : "secondary"}>
                        {m.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl h-full overflow-y-auto slide-in-right p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">{editing ? "Edit Member" : "Add Member"}</h3>
              <Button size="icon" variant="ghost" onClick={() => setPanelOpen(false)}><X className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Date Joined</Label>
                <Input type="date" value={form.dateJoined} onChange={(e) => setForm({ ...form, dateJoined: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active Member</Label>
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Member?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the member from the list.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
