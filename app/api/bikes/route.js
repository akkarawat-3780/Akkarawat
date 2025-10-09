import { db } from '@/lib/db';

export async function GET() {
  const [rows] = await db.execute('SELECT * FROM bicycle');
  return Response.json(rows);
}
export async function POST(req) {
  try {
    const data = await req.json();
    const { Bicycle_ID, Image, Bicycle_Status } = data;

    await db.execute(
      'INSERT INTO bicycle (Bicycle_ID, Image, Bicycle_Status) VALUES (?, ?, ?)',
      [Bicycle_ID, Image, Bicycle_Status]
    );

    return new Response(null, { status: 201 });
  } catch (err) {
    console.error('POST /api/bikes error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}