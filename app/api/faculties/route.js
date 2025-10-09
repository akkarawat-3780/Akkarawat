import { db } from '@/lib/db';

export async function GET() {
  const [rows] = await db.execute(`SELECT faculty_id AS id, faculty_name AS name FROM faculty`);
  return Response.json(rows);
}
