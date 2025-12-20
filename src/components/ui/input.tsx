import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base text-white shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-[var(--color-secondary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] focus-visible:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
