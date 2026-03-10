import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, LogIn } from "lucide-react";
import { toast } from "sonner";

const DEMO_CREDENTIALS = { email: "admin@gracetrack.com", password: "admin123" };

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        localStorage.setItem("gracetrack_auth", JSON.stringify({ email, loggedIn: true }));
        toast.success("Welcome back, Pastor!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials. Use the demo login below.");
      }
      setLoading(false);
    }, 600);
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Church className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">GraceTrack</h1>
          <p className="text-sm text-muted-foreground">Church Management System</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@gracetrack.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : <><LogIn className="w-4 h-4 mr-2" />Sign In</>}
          </Button>
        </form>

        <button onClick={fillDemo} className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
          Demo: admin@gracetrack.com / admin123 — click to fill
        </button>
      </div>
    </div>
  );
}
