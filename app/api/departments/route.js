import { db } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const faculty_id = searchParams.get('faculty_id');

  const [rows] = await db.execute(
    `SELECT department_id AS id, department_name AS name FROM department WHERE faculty_id = ?`,
    [faculty_id]
  );

  return Response.json(rows);
}
