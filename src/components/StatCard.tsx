import { ReactNode } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  prefix?: string;
  decimals?: number;
  accentClass?: string;
}

export function StatCard({ icon, label, value, prefix = "GHS ", decimals = 2, accentClass = "" }: StatCardProps) {
  return (
    <div className={`glass-card gold-glow p-5 fade-up ${accentClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold text-foreground">
        <AnimatedCounter value={value} prefix={prefix} decimals={decimals} />
      </div>
    </div>
  );
}
