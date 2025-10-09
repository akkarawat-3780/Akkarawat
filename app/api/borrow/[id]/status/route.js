// app/api/borrow/[id]/status/route.js
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // Borrow_ID
    const { status } = await req.json();

    if (!['อนุมัติ', 'ไม่อนุมัติ'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // ดึง email ของ admin จาก cookies
    const cookieStore = await cookies();
    const adminEmail = cookieStore.get('email')?.value || null;

    // อัปเดตสถานะ + admin_email
    await db.execute(
      `UPDATE bicycle_borrow_request
       SET borrow_status = ?, admin_email = ?
       WHERE Borrow_ID = ?`,
      [status, adminEmail, id]
    );

    // ถ้าอนุมัติ → อัปเดตจักรยานเป็น "ไม่พร้อมใช้งาน"
    if (status === 'อนุมัติ') {
      await db.execute(
        `UPDATE bicycle
         SET Bicycle_Status = 'ไม่พร้อมใช้งาน'
         WHERE Bicycle_ID = (
           SELECT Bicycle_ID 
           FROM bicycle_borrow_request 
           WHERE Borrow_ID = ?
         )`,
        [id]
      );
    }else if (status === 'ไม่อนุมัติ') {
      await db.execute(
        `UPDATE bicycle
         SET Bicycle_Status = 'ว่าง'
         WHERE Bicycle_ID = (
           SELECT Bicycle_ID 
           FROM bicycle_borrow_request 
           WHERE Borrow_ID = ?
         )`,
        [id]
      );
    }

    return NextResponse.json({ 
      message: `อัปเดตสถานะเป็น "${status}" สำเร็จ`, 
      admin: adminEmail 
    });
  } catch (err) {
    console.error('PUT /api/borrow/[id]/status error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
