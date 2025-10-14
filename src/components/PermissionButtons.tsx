'use client';

import { useTransition } from 'react';
import { grantRole, revokeRole } from '@/app/actions/roles';

const ROLES = [
  { id: 'role:admin', label: 'Admin' },
  { id: 'role:mentor', label: 'Mentor' },
  { id: 'role:student', label: 'Student' }
] as const;

type RoleId = typeof ROLES[number]['id'];

export default function PermissionButtons({ currentTeams: currentRoles }: { currentTeams: string[] }) {
  const [pending, start] = useTransition();

  const handleRole = (id: RoleId, action: 'grant' | 'revoke') => {
    start(async () => {
      try {
        if (action === 'grant') {
          await grantRole(id);
        } else {
          await revokeRole(id);
        }
        location.reload();
      } catch (error) {
        console.error(`Failed to ${action} role:`, error);
      }
    });
  };

  return (
    <div className="grid gap-2">
      {ROLES.map(role => (
        <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="font-medium">{role.label} Role</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleRole(role.id, 'grant')}
              disabled={pending || currentRoles.includes(role.id)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded disabled:opacity-50 hover:bg-green-600"
            >
              Grant {role.label} Role
            </button>
            <button
              onClick={() => handleRole(role.id, 'revoke')}
              disabled={pending || !currentRoles.includes(role.id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded disabled:opacity-50 hover:bg-red-600"
            >
              Revoke {role.label} Role
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
