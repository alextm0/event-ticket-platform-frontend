import { stackServerApp } from '@/stack/server';
import { NextResponse } from 'next/server';

interface StackError extends Error {
  statusCode?: number;
  humanReadableMessage?: string;
  __stackKnownErrorBrand?: string;
}

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

    // Get current permissions to check if the user already has this role
    const currentPermissions = await user.listPermissions();
    const hasPermission = currentPermissions.some(p => p.id === role);

    if (hasPermission) {
      return NextResponse.json(
        { message: 'User already has this permission' },
        { status: 200 }
      );
    }

    // Grant the permission using stackAuth
    await user.grantPermission(role);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully granted ${role} permission`
    });
  } catch (error) {
    const stackError = error as StackError;
    console.error('Error granting permission:', stackError);
    
    // Handle specific error cases
    if (stackError.humanReadableMessage) {
      return NextResponse.json(
        { error: stackError.humanReadableMessage },
        { status: stackError.statusCode || 500 }
      );
    }
    
    if (stackError.message?.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized to grant permissions' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to grant permission' },
      { status: 500 }
    );
  }
}