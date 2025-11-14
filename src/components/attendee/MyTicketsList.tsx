'use client';
import { mockTickets } from '@/lib/mocked-data';
import { useUser } from '@stackframe/stack';
import React, { useMemo, useState } from 'react'
import TicketCard from './TicketCard';
import SelectSortingCriterias from './SelectSortingCriterias';
import AddFiltersButton from './AddFiltersButton';
import Ticket from '@/types/ticket-model';

function MyTicketsList() {
  
    const [sortCriteria, setSortCriteria] = useState<string>('created_at_desc');
    const [filtersList, applyFilters] = useState<string[]>([]);
    const user = useUser({or: "return-null"}) ?? null
    const userId = user?.id;
    const tickets = mockTickets;
    // TODO: Replace the request below with a real API call to fetch tickets for the authenticated user

    // try{
    //     const res = await fetch(`/api/my-tickets/{userId}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     });
    //     if (res.ok) {
    //         tickets = await res.json();
    //     }
    // } catch (error) {
    //     console.log("Displaying mocked tickets due to error:", error);  
    // }

    // TODO: Change sorting criterias to more relevant ones

    const sortedTickets = useMemo(() => {
    const ticketsCopy = [...tickets];
    
    switch(sortCriteria) {
      case 'created_at_desc':
        return ticketsCopy.sort((a, b) => a.created_at > b.created_at ? -1 : 1);
      case 'created_at_asc':
        return ticketsCopy.sort((a, b) => a.created_at < b.created_at ? -1 : 1);
      case 'status_asc':
        return ticketsCopy.sort((a, b) => a.status.localeCompare(b.status));
      case 'status_desc':
        return ticketsCopy.sort((a, b) => b.status.localeCompare(a.status));
      default:
        return ticketsCopy;
    }
  }, [tickets, sortCriteria]);
    return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <SelectSortingCriterias value={sortCriteria} onChange={setSortCriteria} />
            
            <AddFiltersButton value={filtersList} onChange={applyFilters}/>
        </div>
        <div className="space-y-3">
            {sortedTickets && sortedTickets.length > 0 ? (
                sortedTickets.map((ticket: Ticket) => (
                    <TicketCard key={String(ticket.id)} ticket={ticket} />
                ))
            ) : (
                <p className="text-slate-400">No tickets found.</p>
            )}
        </div>
    </div>
  )
}

export default MyTicketsList
