import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// เปลี่ยนสถานะการจองเป็น "ยกเลิก"
export async function PUT(_, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.execute(
      `UPDATE bicycle_borrow_request 
       INNER JOIN bicycle ON bicycle_borrow_request.Bicycle_ID = bicycle.Bicycle_ID
       SET bicycle_borrow_request.borrow_status = 'ยกเลิก', 
           bicycle.Bicycle_Status = 'ว่าง'
       WHERE bicycle_borrow_request.Borrow_ID = ? 
         AND bicycle_borrow_request.borrow_status = 'อยู่ระหว่างการตรวจสอบ'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่พบหรือไม่สามารถยกเลิกได้' }, { status: 400 });
    }

    return NextResponse.json({ message: 'ยกเลิกการจองสำเร็จ' });
  } catch (err) {
    console.error('PUT /api/borrow/[id] error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
