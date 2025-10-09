import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(body.password, 10); // รอบ hash = 10

    await db.execute(
      `INSERT INTO nisits 
        (nisit_email, Nisit_ID, prefix, First_Name, Last_Name, profile, Password, Phone_Number, department_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.email,
        body.nisit_id,
        body.prefix,
        body.first_name,
        body.last_name,
        body.profile,
        hashedPassword, // 🔐 รหัสผ่านที่แฮชแล้ว
        body.phone,
        body.department_id
      ]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
