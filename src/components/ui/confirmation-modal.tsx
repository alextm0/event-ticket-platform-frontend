"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "mint" | "yellow";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
    icon,
}: ConfirmationModalProps) {
    const variantStyles = {
        default: "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        destructive: "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        mint: "bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        yellow: "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    };

    const iconBgStyles = {
        default: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        destructive: "bg-red-500/10 text-red-400 border-red-500/20",
        mint: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px] border-white/5 bg-[#12141a]/95 p-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden rounded-2xl">
                <div className="p-8">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-4">
                            {icon && (
                                <div className={cn(
                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
                                    iconBgStyles[variant as keyof typeof iconBgStyles]
                                )}>
                                    {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
                                </div>
                            )}
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold tracking-tight text-white/95">
                                    {title}
                                </DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-base leading-relaxed text-slate-400/90 py-1">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-10 flex gap-3 sm:justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-11 px-6 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                "h-11 min-w-[120px] px-6 text-sm font-bold transition-all duration-200 active:scale-[0.98] rounded-xl",
                                variantStyles[variant as keyof typeof variantStyles]
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
