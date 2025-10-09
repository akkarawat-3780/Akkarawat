import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;

  if (role !== 'nisit') {
    redirect('/login');
  }
  redirect('/nisit/request');

}
