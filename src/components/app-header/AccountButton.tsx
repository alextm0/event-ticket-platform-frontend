import { useUser, UserButton } from '@stackframe/stack'
import Link from 'next/link';
import React from 'react'

function AccountButton() {
    var user = useUser({ or: "return-null" });
    return (
        <div className="flex items-center gap-3">
            {user ? ( <UserButton /> ) : (<Link href="/sign-in" className="rounded bg-sky-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-400">Sign in</Link> )}
        </div>
    )
}

export default AccountButton
