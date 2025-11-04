import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { reason } = await req.json();

    if (!id) return NextResponse.json({ message: "ไม่พบ ID" }, { status: 400 });

    const [rows] = await db.execute(
      "SELECT * FROM bicycle_loss_report WHERE LossReport_ID = ?",
      [id]
    );

    if (rows.length === 0)
      return NextResponse.json({ message: "ไม่พบข้อมูล" }, { status: 404 });

    const report = rows[0];

    // ✅ อัปเดตสถานะเป็น “ยกเลิก” และบันทึกเหตุผล
    await db.execute(
      `UPDATE bicycle_loss_report 
       SET LossReport_Status = 'ยกเลิก', remark = ? 
       WHERE LossReport_ID = ?`,
      [reason, id]
    );

    // ✅ คืนจักรยานให้ “ว่าง”
    if (report.Bicycle_ID) {
      await db.execute(
        `UPDATE bicycle SET Bicycle_Status = 'ว่าง' WHERE Bicycle_ID = ?`,
        [report.Bicycle_ID]
      );
    }

    return NextResponse.json({ message: "ยกเลิกการแจ้งหายสำเร็จ" });
  } catch (err) {
    console.error("PUT /api/loss-report/[id]/cancel error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
