// app/actions/roles.ts
'use server';

import { stackServerApp } from '@/stack/server';

export async function grantRole(roleId: 'role:student' | 'role:mentor' | 'role:admin') {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  await user.grantPermission(roleId);            // project-level permission
}

export async function revokeRole(roleId: 'role:student' | 'role:mentor' | 'role:admin') {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  await user.revokePermission(roleId);           // project-level permission
}
