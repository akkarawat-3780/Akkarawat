// app/api/borrow/[id]/lost/route.js
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

    // 🔹 ดึงข้อมูลการยืมมาเช็กก่อน
    const [borrowRows] = await db.execute(
      `SELECT * FROM bicycle_borrow_request WHERE Borrow_ID = ? AND nisit_email = ?`,
      [id, nisit_email]
    );
    if (borrowRows.length === 0) {
      return NextResponse.json({ message: "ไม่พบการยืมนี้" }, { status: 404 });
    }
    const borrow = borrowRows[0];

    // 🔹 สร้าง LossReport_ID
    const LossReport_ID = "LR" + Date.now().toString().slice(-6);
    const today = new Date().toISOString().split("T")[0];

    // 🔹 บันทึกแจ้งหาย
    await db.execute(
      `INSERT INTO bicycle_loss_report
        (LossReport_ID, Borrow_ID, LossReport_Date, LossReport_Status, nisit_email, Bicycle_ID)
       VALUES (?, ?, ?, 'รอตรวจสอบการแจ้งหาย', ?, ?)`,
      [LossReport_ID, borrow.Borrow_ID, today, borrow.nisit_email, borrow.Bicycle_ID]
    );

    // 🔹 อัปเดตสถานะการยืม
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
