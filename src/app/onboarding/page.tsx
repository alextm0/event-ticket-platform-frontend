 import { redirect } from "next/navigation";

import { type AppRole, ensureAppProfile } from "@/lib/user-profile";
import { stackServerApp } from "@/stack/server";

const SELECTABLE_ROLES: AppRole[] = ["attendee", "organizer", "staff"];

async function selectRoleAction(formData: FormData) {
    "use server";

    const role = formData.get("role")?.toString();
    if (role !== "admin" && role !== "attendee" && role !== "organizer" && role !== "staff") {
        throw new Error("Please choose a valid role.");
    }

    const user = await stackServerApp.getUser({ or: "redirect" });
    const { profile } = await ensureAppProfile(user, { desiredRole: role });
    const destination =
        profile?.role === "admin" ? "/admin" : profile?.role === "attendee" ? "/attendee" : profile?.role === "organizer" ? "/organizer" : profile?.role === "staff" ? "/staff" : "/";
    redirect(destination);
}

export default async function OnboardingPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });

    const { needsOnboarding, profile } = await ensureAppProfile(user);

    if (!needsOnboarding && profile) {
        const destination =
            profile.role === "admin" ? "/admin" : profile.role === "attendee" ? "/attendee" : profile.role === "organizer" ? "/organizer" : profile.role === "staff" ? "/staff" : "/";
        redirect(destination);
    }

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-8 px-4 text-center text-slate-300">
            <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-slate-100">Choose your role</h1>
                <p className="text-sm text-slate-400">
                    Tell us how you want to participate so we can finish setting up your account.
                </p>
            </div>

            <div className="grid w-full gap-4 md:grid-cols-2">
                {SELECTABLE_ROLES.map((role) => (
                    <form
                        key={role}
                        action={selectRoleAction}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-left shadow-sm"
                    >
                        <input type="hidden" name="role" value={role} />
                        <h2 className="text-xl font-semibold capitalize text-slate-100">{role}</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {role === "admin"
                                ? "Manage the entire platform, including users, events, and settings."
                                : role === "attendee"
                                ? "Browse and purchase tickets for events."
                                : role === "organizer"
                                ? "Create and manage your own events."
                                : "Assist with event check-in and other on-site tasks."}
                        </p>
                        <button
                            type="submit"
                            className="mt-4 w-full rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-400"
                        >
                            Continue as {role}
                        </button>
                    </form>
                ))}
            </div>
        </div>
    );
}
