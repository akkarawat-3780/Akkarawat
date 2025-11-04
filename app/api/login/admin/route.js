import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const cookieStore = await cookies();

    // ตรวจ admin
    const [adminRows] = await db.execute(
      'SELECT * FROM admin WHERE admin_email = ?',
      [email]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const match = await bcrypt.compare(password, admin.Password);

      if (match) {
        cookieStore.set('email', email, { httpOnly: true, path: '/' });
        cookieStore.set('role', 'admin', { httpOnly: true, path: '/' });
        cookieStore.set('profile', admin.profile || '/default-profile.png', {
          httpOnly: false,
          path: '/'
        });

        return Response.json({ success: true, role: 'admin' });
      }
    }

    return new Response(JSON.stringify({ success: false }), { status: 401 });

  } catch (err) {
    console.error('Login error:', err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
