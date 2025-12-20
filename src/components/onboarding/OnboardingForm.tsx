"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ONBOARDING_ALLOWED_ROLES } from "@/constants/app-roles";
import type { AppRole } from "@/lib/user-profile";
import { completeOnboarding, type CompleteOnboardingState } from "@/app/onboarding/actions";
import { RoleSelectionCard } from "./RoleSelectionCard";
import { Button } from "@/components/ui/button";

const initialState: CompleteOnboardingState = {};

const ROLE_COPY: Record<AppRole, { title: string; description: string }> = {
    attendee: {
        title: "Attendee",
        description: "Browse upcoming events, manage tickets, and access QR codes.",
    },
    organizer: {
        title: "Organizer",
        description: "Publish events, manage inventory, and monitor attendee activity.",
    },
    staff: {
        title: "Staff",
        description: "Validate tickets on-site and monitor entry flow.",
    },
    admin: {
        title: "Admin",
        description: "Reserved for platform maintainers.",
    },
};

export function OnboardingForm() {
    const [state, formAction] = useActionState(completeOnboarding, initialState);

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-4 md:grid-cols-3">
                {ONBOARDING_ALLOWED_ROLES.map((role) => {
                    const copy = ROLE_COPY[role];
                    return (
                        <RoleSelectionCard
                            key={role}
                            role={role}
                            title={copy.title}
                            description={copy.description}
                        />
                    );
                })}
            </div>

            {state?.error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-200 backdrop-blur-sm">
                    {state.error}
                </div>
            )}

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            variant="mint"
            className="w-full md:w-auto min-w-[150px]"
        >
            {pending ? "Setting up..." : "Continue"}
        </Button>
    );
}
