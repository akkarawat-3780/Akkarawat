import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies(); // ✅ ใช้ await

  cookieStore.delete('email');
  cookieStore.delete('role');
  cookieStore.delete('profile');

  return new Response(null, { status: 200 });
}
