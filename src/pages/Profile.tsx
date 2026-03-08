import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Church, Save, User, History } from "lucide-react";
import { useChurchProfile, ChurchProfile } from "@/hooks/useChurchProfile";
import { useActivityLog } from "@/hooks/useActivityLog";
import { formatDate } from "@/lib/format";

export default function Profile() {
  const { profile: saved, setProfile: setSaved } = useChurchProfile();
  const { log, addEntry } = useActivityLog();
  const [form, setForm] = useState<ChurchProfile>(saved);
  const { toast } = useToast();

  const update = (field: keyof ChurchProfile, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    setSaved(form);
    addEntry("Updated church profile", "profile");
    toast({ title: "Profile saved" });
  };

  return (
    <div className="space-y-6 fade-up max-w-2xl">
      {/* Church Info Card */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Church className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Church Information</h3>
            <p className="text-sm text-muted-foreground">Manage your church details</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Church Name</Label>
              <Input value={form.churchName} onChange={(e) => update("churchName", e.target.value)} />
            </div>
            <div>
              <Label>Denomination</Label>
              <Input value={form.denomination} onChange={(e) => update("denomination", e.target.value)} placeholder="e.g. Methodist, Baptist" />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Church address" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+233..." />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
          </div>
          <div>
            <Label>About</Label>
            <Textarea value={form.about} onChange={(e) => update("about", e.target.value)} placeholder="Brief description of your church" rows={3} />
          </div>
        </div>
      </div>

      {/* Pastor / Admin Card */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Pastor / Admin</h3>
            <p className="text-sm text-muted-foreground">Primary contact person</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label>Pastor's Name</Label>
            <Input value={form.pastorName} onChange={(e) => update("pastorName", e.target.value)} />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full sm:w-auto">
        <Save className="w-4 h-4 mr-2" />Save Profile
      </Button>
    </div>
  );
}
