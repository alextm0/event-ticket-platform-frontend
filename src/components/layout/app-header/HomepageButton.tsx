import Link from 'next/link'
import React from 'react'

function HomepageButton() {
  return (
    <div>
        <Link href="/" className="font-semibold tracking-tight text-slate-100">
            Event Ticketing Platform
        </Link>
    </div>
  )
}

export default HomepageButton
