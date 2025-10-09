import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    // Hash password
    const hashed = await bcrypt.hash(newPassword, 10);

    // ลองอัปเดตทั้ง admin และ nisits
    const [adminResult] = await db.execute(
      'UPDATE admin SET Password = ? WHERE admin_email = ?',
      [hashed, email]
    );

    const [nisitResult] = await db.execute(
      'UPDATE nisits SET Password = ? WHERE nisit_email = ?',
      [hashed, email]
    );

    // ตรวจสอบว่ามีการเปลี่ยนจริงไหม
    if (adminResult.affectedRows === 0 && nisitResult.affectedRows === 0) {
      return new Response(JSON.stringify({ success: false }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Forgot Password error:', err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
