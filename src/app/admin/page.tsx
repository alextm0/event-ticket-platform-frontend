// app/admin/page.tsx
import { stackServerApp } from '@/stack/server';

export default async function AdminPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  const canAdmin = await user.getPermission('role:admin'); // returns object or null
  if (!canAdmin) {
    // You can throw, redirect, or render a 403.
    return <div>Access denied</div>;
  }
  return <div>Admin dashboard</div>;
}
