import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const cookieStore = cookies();
    const admin_email = cookieStore.get("email")?.value;

    if (!id || !status) {
      return NextResponse.json(
        { message: "กรุณาระบุ id และ status" },
        { status: 400 }
      );
    }

    // ✅ whitelist สถานะที่อนุญาต
    const allowedStatuses = [
      "รอตรวจสอบการแจ้งหาย",
      "รอการชำระเงิน",
      "รอตรวจสอบการชำระเงิน",
      "อนุมัติการชำระเงิน",
      "ชำระเงินไม่ถูกต้อง",
      "ไม่อนุมัติการแจ้งหาย",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: `สถานะ "${status}" ไม่ถูกต้อง` },
        { status: 400 }
      );
    }

    // ✅ ตรวจสอบว่ารายงานมีอยู่จริง
    const [rows] = await db.execute(
      "SELECT * FROM bicycle_loss_report WHERE LossReport_ID = ?",
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลการแจ้งหาย" },
        { status: 404 }
      );
    }

    // ✅ อัปเดตสถานะ + admin_email
    await db.execute(
    `UPDATE bicycle_loss_report 
     SET LossReport_Status = ?, admin_email = ? 
     WHERE LossReport_ID = ?`,
    [status, admin_email, id]
    );

    return NextResponse.json({
      message: "อัปเดตสถานะสำเร็จ",
      status,
      admin_email: admin_email || null,
    });
  } catch (err) {
    console.error("PUT /api/loss-report/[id]/status error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
