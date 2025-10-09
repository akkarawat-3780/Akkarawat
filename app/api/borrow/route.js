import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT Borrow_ID,Bicycle_ID, Borrow_Date,due_date,return_date,
             n.Nisit_ID,n.prefix, n.First_Name, n.Last_Name,
             borrow_status,d.department_name,f.faculty_name 
      FROM bicycle_borrow_request 
      INNER JOIN nisits n ON n.nisit_email = bicycle_borrow_request.nisit_email 
      INNER JOIN department d ON d.department_id = n.department_id 
      INNER JOIN faculty f ON f.faculty_id = d.faculty_id 
      ORDER BY Borrow_Date DESC;
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/borrow error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    // ✅ ให้ตรงกับ frontend ใช้ Borrow_Date
    const { Bicycle_ID, Borrow_Date, due_date } = await req.json();
    const cookieStore = await cookies();
    const nisit_email = cookieStore.get('email')?.value;

    if (!nisit_email) {
      return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    // 1. ตรวจสอบว่าผู้ใช้มีการจองที่ยังไม่คืนอยู่หรือไม่
    const [activeBorrow] = await db.execute(
      `SELECT * FROM bicycle_borrow_request
       WHERE nisit_email = ? AND borrow_status IN ('อยู่ระหว่างการตรวจสอบ', 'อนุมัติ')`,
      [nisit_email]
    );
    if (activeBorrow.length > 0) {
      return NextResponse.json(
        { message: 'คุณมีจักรยานที่ยังไม่ได้คืน' },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบว่าจักรยานยังว่างอยู่
    const [bikeRows] = await db.execute(
      `SELECT * FROM bicycle WHERE Bicycle_ID = ? AND Bicycle_Status = 'ว่าง'`,
      [Bicycle_ID]
    );
    if (bikeRows.length === 0) {
      return NextResponse.json(
        { message: 'จักรยานนี้ไม่ว่าง' },
        { status: 400 }
      );
    }

    // 3. สร้างรหัสการจอง
    const Borrow_ID = 'BR' + Date.now().toString().slice(-6);

    // 4. ใช้วันที่เลือกเอง ถ้าไม่เลือกให้ default = วันนี้
    const today = new Date().toISOString().split('T')[0];
    const borrowDateToUse = Borrow_Date || today;

    // ✅ ตรวจสอบว่า due_date > borrow_date
    if (due_date && new Date(due_date) < new Date(borrowDateToUse)) {
      return NextResponse.json(
        { message: 'วันครบกำหนดต้องไม่น้อยกว่าวันที่ยืม' },
        { status: 400 }
      );
    }

    // 5. บันทึกข้อมูลการจอง
    await db.execute(
      `INSERT INTO bicycle_borrow_request 
        (Borrow_ID, Borrow_Date, due_date, borrow_status, nisit_email, Bicycle_ID) 
       VALUES (?, ?, ?, 'อยู่ระหว่างการตรวจสอบ', ?, ?)`,
      [
        Borrow_ID,
        borrowDateToUse,
        due_date,
        nisit_email,
        Bicycle_ID
      ]
    );

    // 6. เปลี่ยนสถานะจักรยาน
    await db.execute(
      `UPDATE bicycle SET Bicycle_Status = 'อยู่ระหว่างการตรวจสอบ' WHERE Bicycle_ID = ?`,
      [Bicycle_ID]
    );

    return NextResponse.json({ message: 'จองจักรยานสำเร็จ', Borrow_ID });
  } catch (err) {
    console.error('POST /api/borrow error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
