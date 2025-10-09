export const dynamic = 'force-dynamic'; // 💥 บอก Next.js ว่านี่คือ dynamic route

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;

  if (role !== 'admin') {
    redirect('/login');
  }
  redirect("/admin/dashboard/borrow-stats");
}
