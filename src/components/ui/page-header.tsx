import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
    return (
        <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg text-[var(--color-secondary)]">
                        {description}
                    </p>
                )}
            </div>
            {children && <div className="flex items-center gap-4">{children}</div>}
        </div>
    );
}
