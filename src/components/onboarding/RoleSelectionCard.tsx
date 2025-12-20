import { AppRole } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

interface RoleSelectionCardProps {
    role: AppRole;
    title: string;
    description: string;
}

export function RoleSelectionCard({ role, title, description }: RoleSelectionCardProps) {
    return (
        <label
            className={cn(
                "group relative flex cursor-pointer flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 transition-all duration-300 hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-primary)]/5",
                "has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/10"
            )}
        >
            <input
                type="radio"
                name="role"
                value={role}
                className="peer sr-only"
                required
            />
            <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold text-white peer-checked:text-[var(--color-primary)]">
                    {title}
                </span>
                <div className="h-4 w-4 rounded-full border-2 border-[var(--color-secondary)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)]" />
            </div>

            <p className="flex-1 text-sm text-[var(--color-secondary)] group-hover:text-slate-300">
                {description}
            </p>

            <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wider text-[var(--color-secondary)] opacity-0 transition-opacity group-hover:opacity-100 peer-checked:text-[var(--color-primary)] peer-checked:opacity-100">
                Select {title}
            </span>
        </label>
    );
}
