import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('email')?.value;

  if (!email) return new Response("Unauthorized", { status: 401 });

  const [rows] = await db.execute(`
    SELECT *,
      (SELECT faculty_id FROM department WHERE department_id = n.department_id) AS faculty_id
    FROM nisits n
    WHERE nisit_email = ?
  `, [email]);

  if (!rows.length) return new Response("Not found", { status: 404 });

  return Response.json(JSON.parse(JSON.stringify(rows[0])));
}

export async function PUT(req) {
  const data = await req.json();

  await db.execute(`
    UPDATE nisits SET
      prefix = ?, First_Name = ?, Last_Name = ?, department_id = ?,
      Password = ?, Phone_Number = ?, profile = ?
    WHERE Nisit_ID = ?
  `, [
    data.prefix,
    data.First_Name,
    data.Last_Name,
    data.department_id,
    data.Password,
    data.Phone_Number,
    data.profile,
    data.Nisit_ID
  ]);

  return new Response(null, { status: 200 });
}
