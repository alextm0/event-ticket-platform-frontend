import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PulseCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
}

export function PulseCard({ title, value, subtext, icon }: PulseCardProps) {
  return (
    <Card className="bg-[var(--color-surface)] border-white/10 shadow-lg hover:border-emerald-500/30 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
          <p className="text-xs text-slate-500">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}
