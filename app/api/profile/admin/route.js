import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('email')?.value;

  if (!email) return new Response("Unauthorized", { status: 401 });

  const [rows] = await db.execute(`
    SELECT admin_email, prefix, First_Name, Last_Name, Phone_Number, profile
    FROM admin
    WHERE admin_email = ?
  `, [email]);

  if (!rows.length) return new Response("Not found", { status: 404 });

  return Response.json(JSON.parse(JSON.stringify(rows[0])));
}

export async function PUT(req) {
  const data = await req.json();

  await db.execute(`
    UPDATE admin SET
      prefix = ?, First_Name = ?, Last_Name = ?, Phone_Number = ?, profile = ?
    WHERE admin_email = ?
  `, [
    data.prefix,
    data.First_Name,
    data.Last_Name,
    data.Phone_Number,
    data.profile,
    data.admin_email
  ]);

  return new Response(null, { status: 200 });
}
