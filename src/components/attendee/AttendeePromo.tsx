import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AttendeePromo() {
    return (
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-8 shadow-lg backdrop-blur-md">
            <h2 className="text-xl font-bold text-white">Browse published events</h2>
            <p className="mt-2 text-[var(--color-secondary)]">
                Discover upcoming events that organizers have published and view their full details.
            </p>
            <div className="mt-6">
                <Button asChild variant="mint">
                    <Link href="/browse-events">Browse events</Link>
                </Button>
            </div>
        </section>
    );
}
