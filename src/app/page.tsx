import { stackServerApp } from '@/stack/server';
import PermissionButtons from '@/components/PermissionButtons';
import Link from 'next/link';

export default async function Home() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  const permissions = await user.listPermissions();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Role-Based Auth Demo
      </h1>

      <div className="space-y-6">
        {/* Current Roles */}
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-semibold mb-4">Your Current Roles</h2>
          {permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissions.map(p => (
                <span key={p.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {p.id.replace('role:', '')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No roles assigned</p>
          )}
        </div>

        {/* Role Management */}
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-semibold mb-4">Manage Roles</h2>
          <PermissionButtons currentTeams={permissions.map(p => p.id)} />
        </div>

        {/* Protected Pages */}
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-semibold mb-4">Protected Pages</h2>
          <div className="space-y-2">
            <Link href="/admin" className="block p-2 bg-gray-100 hover:bg-gray-200 rounded">
              Admin Dashboard (requires admin role)
            </Link>
            <Link href="/mentor" className="block p-2 bg-gray-100 hover:bg-gray-200 rounded">
              Mentor Dashboard (requires mentor role)
            </Link>
            <Link href="/student" className="block p-2 bg-gray-100 hover:bg-gray-200 rounded">
              Student Dashboard (requires student role)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
