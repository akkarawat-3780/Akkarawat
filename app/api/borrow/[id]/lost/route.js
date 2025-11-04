import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req, { params }) {
  try {
    const { id } = params; // Borrow_ID
    const cookieStore = await cookies();
    const nisit_email = cookieStore.get("email")?.value;

    if (!nisit_email) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // 🔹 ตรวจสอบว่ามีการยืมจริง
    const [borrowRows] = await db.execute(
      `SELECT * FROM bicycle_borrow_request WHERE Borrow_ID = ? AND nisit_email = ?`,
      [id, nisit_email]
    );
    if (borrowRows.length === 0) {
      return NextResponse.json({ message: "ไม่พบการยืมนี้" }, { status: 404 });
    }
    const borrow = borrowRows[0];

    // =======================================================
    // ✅ สร้าง LossReport_ID แบบเรียงลำดับ (ไม่สุ่ม)
    // 1. ดึงรหัสสูงสุดปัจจุบันที่ขึ้นต้นด้วย "LR"
    const [maxIdRows] = await db.execute(`
      SELECT 
        MAX(CAST(SUBSTRING(LossReport_ID, 3) AS UNSIGNED)) AS maxNumber
      FROM bicycle_loss_report
      WHERE LossReport_ID LIKE 'LR%';
    `);

    // 2. ถ้าไม่มีข้อมูล ให้เริ่มที่ 1
    const maxNumber = maxIdRows[0].maxNumber || 0;
    const newNumber = maxNumber + 1;

    // 3. สร้าง ID ใหม่ เช่น LR000123
    const LossReport_ID = "LR" + newNumber.toString().padStart(6, "0");
    // =======================================================

    const today = new Date().toISOString().split("T")[0];

    // 🔹 เพิ่มข้อมูลแจ้งหาย
    await db.execute(
      `INSERT INTO bicycle_loss_report
        (LossReport_ID, Borrow_ID, LossReport_Date, LossReport_Status, nisit_email, Bicycle_ID)
       VALUES (?, ?, ?, 'รอการตรวจสอบ', ?, ?)`,
      [LossReport_ID, borrow.Borrow_ID, today, borrow.nisit_email, borrow.Bicycle_ID]
    );

    // 🔹 อัปเดตสถานะการยืมเป็น "แจ้งหาย"
    await db.execute(
      `UPDATE bicycle_borrow_request SET borrow_status = 'แจ้งหาย' WHERE Borrow_ID = ?`,
      [id]
    );

    return NextResponse.json({ message: "แจ้งหายสำเร็จ", LossReport_ID });
  } catch (err) {
    console.error("POST /api/borrow/[id]/lost error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
