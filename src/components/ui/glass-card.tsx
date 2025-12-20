import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export function GlassCard({ children, className, gradient = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card rounded-[var(--radius-lg)] p-6 transition-all duration-300",
                gradient && "bg-gradient-to-br from-[rgba(26,29,35,0.6)] to-[rgba(16,185,129,0.05)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
