"use client";

import React, { useState } from 'react'
interface TicketPurchaseCounterProps {
  eventId?: string;
  ticketTypeId?: string;
  isSoldOut: boolean;
  isInactive: boolean;
  onChange?: (quantity: number) => void;
}
function TicketPurchaseCounter({ eventId, ticketTypeId, isSoldOut, isInactive, onChange }: TicketPurchaseCounterProps) {
    const [counter, setCounter] = useState(0);
    const isDisabled = isSoldOut || isInactive;
    
    function increment() {
        if (!isDisabled) {
            const newValue = counter + 1;
            setCounter(newValue);
            onChange?.(newValue);
        }
    }
    function decrement() {
        if (!isDisabled) {
            const newValue = counter - 1;
            setCounter(newValue);
            onChange?.(newValue);
        }
    }
    

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={decrement} disabled={isDisabled}> - </button>
        <span> {counter} </span>
        <button onClick={increment} disabled={isDisabled}> + </button>
    </div>
  )
}

export default TicketPurchaseCounter
