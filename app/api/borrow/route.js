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
      ORDER BY CAST(SUBSTRING(Borrow_ID, 3) AS UNSIGNED) DESC;
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/borrow error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// app/api/borrow/route.js

export async function POST(req) {
  try {
    // ... (โค้ดส่วนตรวจสอบข้อมูลอื่นๆ)

    // 3. **✅ แก้ไข: สร้างรหัสการจองแบบเรียงลำดับ**
    // 3.1 ค้นหาเลข ID สูงสุดปัจจุบัน
    const [maxIdRows] = await db.execute(`
      SELECT MAX(CAST(SUBSTRING(Borrow_ID, 3) AS UNSIGNED)) AS maxNumber
      FROM bicycle_borrow_request;
    `);
    
    // 3.2 คำนวณเลขใหม่ (ถ้ายังไม่มีให้เริ่มที่ 0 + 1)
    const maxNumber = maxIdRows[0].maxNumber || 0;
    const newNumber = maxNumber + 1;
    
    // 3.3 สร้าง ID ใหม่ เช่น 'BR000001', 'BR000002'
    const Borrow_ID = 'BR' + newNumber.toString().padStart(6, "0");


    // 4. ใช้วันที่เลือกเอง ถ้าไม่เลือกให้ default = วันที่ยืม (จาก form)
    // *** แก้ไขการใช้ today ไม่ให้เป็น default ให้ใช้วันที่ที่ส่งมาจาก form เท่านั้น ***
    const { Bicycle_ID, Borrow_Date, due_date } = await req.json();
    const cookieStore = await cookies();
    const nisit_email = cookieStore.get('email')?.value;
    
    if (!Borrow_Date) {
      return NextResponse.json(
        { message: 'กรุณาระบุวันที่ยืม' }, 
        { status: 400 }
      );
    }
    const borrowDateToUse = Borrow_Date;

    // ✅ ตรวจสอบว่า due_date > borrow_date
    if (due_date && new Date(due_date) <= new Date(borrowDateToUse)) {
      return NextResponse.json(
        { message: 'วันครบกำหนดต้องหลังจากวันที่ยืมอย่างน้อย 1 วัน' }, 
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
    // ... (โค้ดส่วนเปลี่ยนสถานะ)
        await db.execute(
      `UPDATE bicycle
       SET Bicycle_Status = 'อยู่ระหว่างการตรวจสอบ' 
       WHERE Bicycle_ID = ?`,
      [Bicycle_ID]
    );

    return NextResponse.json({ message: 'จองจักรยานสำเร็จ', Borrow_ID });
  } catch (err) {
    console.error('POST /api/borrow error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
