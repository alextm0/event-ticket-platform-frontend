const ROLE_PAGES: Record<string, Array<{ href: string, label: string }>> = {
    "admin":
        [
            { href: "/admin", label: "Admin Dashboard" },
        ],
    "organizer":
        [
            { href: "/organizer", label: "Organizer Dashboard" },
        ],
    "staff":
        [
            { href: "/staff", label: "Staff Dashboard" },
            { href: "/staff/scan", label: "Scan" }
        ],
    "attendee":
        [
            { href: "/attendee", label: "Attendee Dashboard" },
            { href: "/my-tickets", label: "My Tickets" }
        ]
}
export default ROLE_PAGES;