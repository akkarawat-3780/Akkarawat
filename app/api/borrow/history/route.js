import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const nisit_email = cookieStore.get('email')?.value;

    if (!nisit_email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await db.execute(
      `SELECT Borrow_ID, Bicycle_ID, Borrow_Date, due_date, return_date, borrow_status, admin_email
      FROM bicycle_borrow_request
      WHERE nisit_email = ?
      ORDER BY CAST(SUBSTRING(Borrow_ID, 3) AS UNSIGNED) DESC`,
      [nisit_email]
    );


    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/borrow/history error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
