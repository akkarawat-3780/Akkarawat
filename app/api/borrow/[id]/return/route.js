import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // Borrow_ID

    // 1. อัปเดตสถานะการยืม
    await db.execute(
        `UPDATE bicycle_borrow_request
        SET borrow_status = 'คืนแล้ว', return_date = CURDATE()
        WHERE Borrow_ID = ? AND borrow_status = 'อนุมัติ'`,
        [id]
    );


    // 2. คืนสถานะจักรยานเป็น "ว่าง"
    await db.execute(
      `UPDATE bicycle
       SET Bicycle_Status = 'ว่าง'
       WHERE Bicycle_ID = (
         SELECT Bicycle_ID FROM bicycle_borrow_request WHERE Borrow_ID = ?
       )`,
      [id]
    );

    return NextResponse.json({ message: 'คืนจักรยานสำเร็จ ✅' });
  } catch (err) {
    console.error('PUT /api/borrow/[id]/return error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
