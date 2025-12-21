import { EventTicketType } from "@/types";


interface TicketSalesPreviewProps {
    ticketTypes: EventTicketType[];
}

export function TicketSalesPreview({ ticketTypes }: TicketSalesPreviewProps) {
    if (ticketTypes.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-slate-500">No ticket types created yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {ticketTypes.map((ticket) => {
                const sold = ticket.soldCount || 0;
                const total = ticket.totalQuantity;
                const percentSold = total > 0 ? Math.round((sold / total) * 100) : 0;
                const remaining = total - sold;

                return (
                    <div key={ticket.id} className="space-y-2">
                        {/* Top Line: Name and Price */}
                        <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-white text-sm line-clamp-1 mr-2">
                                {ticket.name}
                            </h4>
                            <span className="font-bold text-emerald-400 text-sm whitespace-nowrap">
                                ${ticket.price.toFixed(2)}
                            </span>
                        </div>

                        {/* Middle: Slim Progress Bar */}
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percentSold}%` }}
                            />
                        </div>

                        {/* Bottom Line: Caption */}
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>{percentSold}% sold</span>
                            <span>{remaining} remaining</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
