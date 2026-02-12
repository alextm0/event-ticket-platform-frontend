import type { EventTicketType } from "@/types";

interface TicketRevenueRowProps {
  ticket: EventTicketType;
  totalRevenue: number;
}

export function TicketRevenueRow({ ticket, totalRevenue }: TicketRevenueRowProps) {
  const revenue = ticket.soldCount * ticket.price;
  const revenueShare = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm font-medium text-white">{ticket.name}</p>
          <p className="text-xs text-slate-400">
            {ticket.soldCount} sold / {ticket.totalQuantity} total
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">${revenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-400">{revenueShare}% of revenue</p>
        </div>
      </div>
      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${revenueShare}%` }}
        />
      </div>
    </div>
  );
}
