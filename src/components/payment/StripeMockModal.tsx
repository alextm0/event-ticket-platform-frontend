"use client";

import * as React from "react";
import { X, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface StripeMockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
    ticketName: string;
    price: number;
    currency?: string;
}

export function StripeMockModal({
    isOpen,
    onClose,
    onSuccess,
    ticketName,
    price,
    currency = "$",
}: StripeMockModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [cardNumber, setCardNumber] = React.useState("");
    const [expiry, setExpiry] = React.useState("");
    const [cvc, setCvc] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setLoading(false);
            setCardNumber("");
            setExpiry("");
            setCvc("");
            setName("");
            setError(null);
        }
    }, [isOpen]);

    const validatePayment = () => {
        // Validate Name
        if (!name.trim()) return "Name on card is required";

        // Validate Card Number (Simple length check for mock)
        const cleanCardNum = cardNumber.replace(/\s/g, "");
        if (cleanCardNum.length !== 16 || !/^\d+$/.test(cleanCardNum)) {
            return "Invalid card number (must be 16 digits)";
        }

        // Validate Expiry
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Invalid expiry date (MM/YY)";
        const [month, year] = expiry.split("/").map(Number);
        const now = new Date();
        const currentYear = parseInt(now.getFullYear().toString().slice(-2));
        const currentMonth = now.getMonth() + 1; // 0-indexed

        if (month < 1 || month > 12) return "Invalid month (01-12)";
        if (year < currentYear) return "Card has expired";
        if (year === currentYear && month < currentMonth) return "Card has expired";

        // Validate CVC
        if (!/^\d{3,4}$/.test(cvc)) return "Invalid CVC (3-4 digits)";

        return null;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validatePayment();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate Stripe processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            await onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Payment failed. Please try again.");
            setLoading(false);
        }
    };

    // Card formatting mock
    const formatCardNumber = (val: string) => {
        return val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    };

    const formatExpiry = (val: string) => {
        let clean = val.replace(/\D/g, "");
        if (clean.length >= 2) {
            // Ensure first digit of month is 0 or 1
            if (parseInt(clean[0]) > 1) clean = "0" + clean;
            // logic for month > 12 handled in validation, but input masking could be stricter.
            // keeping it simple for now as requested "validations at least".
        }
        return clean.replace(/(.{2})/, "$1/").slice(0, 5);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[var(--color-surface)] border-[var(--color-border)] text-white shadow-2xl p-0 overflow-hidden gap-0">
                {/* Header mimicking Stripe's clean header */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 border-b border-white/5">
                    <DialogHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-emerald-500/20 p-1.5 rounded-md text-emerald-400">
                                    <CreditCard className="w-5 h-5" />
                                </span>
                                Secure Payment
                            </DialogTitle>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total</p>
                                <p className="text-lg font-bold text-white tracking-tight">{currency}{price.toFixed(2)}</p>
                            </div>
                        </div>
                        <DialogDescription className="text-gray-400 text-sm mt-1">
                            Purchase for <span className="text-white font-medium">{ticketName}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handlePayment} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="card-name" className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Name on Card</Label>
                            <Input
                                id="card-name"
                                placeholder="J. Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50  focus:ring-1 focus:ring-emerald-500/50 h-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="card-number" className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Card Information</Label>
                            <div className="border border-white/10 rounded-md overflow-hidden bg-black/20 focus-within:ring-1 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50">
                                <div className="relative border-b border-white/10">
                                    <Input
                                        id="card-number"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        className="border-0 bg-transparent text-white placeholder:text-gray-600 focus-visible:ring-0 pl-10 h-11"
                                    />
                                    <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                                </div>
                                <div className="flex divide-x divide-white/10">
                                    <Input
                                        id="expiry"
                                        placeholder="MM / YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        className="border-0 bg-transparent text-white placeholder:text-gray-600 focus-visible:ring-0 text-center h-11 rounded-none"
                                    />
                                    <Input
                                        id="cvc"
                                        placeholder="CVC"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                        className="border-0 bg-transparent text-white placeholder:text-gray-600 focus-visible:ring-0 text-center h-11 rounded-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Processing Payment...
                                </div>
                            ) : (
                                `Pay ${currency}${price.toFixed(2)}`
                            )}
                        </Button>
                        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                            <Lock className="w-3 h-3" />
                            <span>Powered by</span>
                            <span className="font-bold text-slate-400">Stripe</span>
                            <span className="bg-slate-700/50 px-1 rounded text-[10px] ml-1">TEST</span>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
