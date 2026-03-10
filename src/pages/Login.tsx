import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, LogIn, ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const DEMO_CREDENTIALS = { email: "admin@gracetrack.com", password: "admin123" };

type View = "login" | "forgot" | "reset" | "done";

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === DEMO_CREDENTIALS.email) {
        toast.success("Reset link sent! (demo — proceeding to reset)");
        setView("reset");
      } else {
        toast.error("Email not found. Try admin@gracetrack.com");
      }
      setLoading(false);
    }, 600);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Password reset successfully! (demo only)");
      setView("done");
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

        {/* ===== LOGIN ===== */}
        {view === "login" && (
          <>
            <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@gracetrack.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => setView("forgot")} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : <><LogIn className="w-4 h-4 mr-2" />Sign In</>}
              </Button>
            </form>
            <button onClick={fillDemo} className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
              Demo: admin@gracetrack.com / admin123 — click to fill
            </button>
          </>
        )}

        {/* ===== FORGOT PASSWORD ===== */}
        {view === "forgot" && (
          <form onSubmit={handleForgot} className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <button type="button" onClick={() => setView("login")} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-display font-semibold text-lg text-foreground">Reset Password</h2>
            </div>
            <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" placeholder="admin@gracetrack.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : <><Mail className="w-4 h-4 mr-2" />Send Reset Link</>}
            </Button>
          </form>
        )}

        {/* ===== NEW PASSWORD ===== */}
        {view === "reset" && (
          <form onSubmit={handleReset} className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <button type="button" onClick={() => setView("forgot")} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-display font-semibold text-lg text-foreground">New Password</h2>
            </div>
            <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <Input id="new-pw" type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm Password</Label>
              <Input id="confirm-pw" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting…" : <><KeyRound className="w-4 h-4 mr-2" />Reset Password</>}
            </Button>
          </form>
        )}

        {/* ===== SUCCESS ===== */}
        {view === "done" && (
          <div className="glass-card p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h2 className="font-display font-semibold text-lg text-foreground">Password Reset!</h2>
            <p className="text-sm text-muted-foreground">Your password has been updated successfully. You can now sign in.</p>
            <Button className="w-full" onClick={() => { setView("login"); setPassword(""); }}>
              <LogIn className="w-4 h-4 mr-2" />Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
