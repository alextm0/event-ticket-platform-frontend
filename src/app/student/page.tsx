import { stackServerApp } from '@/stack/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StudentPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  const canStudent = await user.getPermission('role:student');

  if (!canStudent) {
    return redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Student Page</h1>
      <p>You can see this because you have the student role.</p>
      <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">← Back to home</Link>
    </div>
  );
}