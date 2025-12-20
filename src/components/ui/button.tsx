import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-primary)] text-white shadow hover:bg-[var(--color-primary)]/90 mint-glow",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-[var(--color-border)] bg-transparent shadow-sm hover:bg-[var(--color-surface)] hover:text-white",
                secondary:
                    "bg-[var(--color-secondary)] text-white shadow-sm hover:bg-[var(--color-secondary)]/80",
                ghost: "hover:bg-[var(--color-surface)] hover:text-white",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
                mint: "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all duration-300",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-8 rounded-[var(--radius-md)] px-3 text-xs",
                lg: "h-12 rounded-[var(--radius-md)] px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
