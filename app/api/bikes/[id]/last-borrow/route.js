import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // ✅ ดึงเฉพาะรายการที่ยัง active เท่านั้น
    const [rows] = await db.execute(`
      SELECT 
        b.Borrow_ID, 
        b.nisit_email, 
        n.Nisit_ID, 
        n.prefix, 
        n.First_Name, 
        n.Last_Name, 
        b.Borrow_Date, 
        TRIM(b.borrow_status) AS borrow_status
      FROM bicycle_borrow_request b 
      JOIN nisits n ON b.nisit_email = n.nisit_email 
      WHERE 
        b.Bicycle_ID = ? 
        AND TRIM(b.borrow_status) IN ('อยู่ระหว่างการตรวจสอบ', 'รอการอนุมัติ', 'อนุมัติ')
      ORDER BY b.Borrow_Date DESC
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json(null); // ❌ ไม่มีคนที่กำลังยืมหรือจอง
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/bikes/[id]/last-borrow error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
