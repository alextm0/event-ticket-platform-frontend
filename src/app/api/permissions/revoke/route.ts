import { stackServerApp } from '@/stack/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    
    // Get the authenticated user or throw if not authenticated
    const user = await stackServerApp.getUser({ or: 'throw' });
    
    // Validate that the role is one of our predefined roles
    const validRoles = ['role:admin', 'role:mentor', 'role:student'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Get current permissions to check if the user has this role
    const currentPermissions = await user.listPermissions();
    const hasPermission = currentPermissions.some(p => p.id === role);

    if (!hasPermission) {
      return NextResponse.json(
        { message: 'User does not have this permission' },
        { status: 200 }
      );
    }

    // Revoke the permission
    await user.revokePermission(role);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully revoked ${role} permission`
    });
  } catch (error) {
    console.error('Error revoking permission:', error);
    
    if (error instanceof Error && error.message?.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized to revoke permissions' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    );
  }
}