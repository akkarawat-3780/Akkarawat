import { db } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } = await params; // id = nisit_email

  try {
    // ตรวจสอบว่ามีคำร้องขอยืมที่ยังไม่จบหรือไม่
    const [borrow] = await db.query(
      `SELECT COUNT(*) AS c 
       FROM bicycle_borrow_request 
       WHERE nisit_email = ? 
       AND borrow_status NOT IN ('คืนแล้ว', 'ยกเลิก', 'แจ้งหาย')`,
      [id]
    );

    // ตรวจสอบว่ามีคำร้องแจ้งหายที่ยังไม่จบหรือไม่
    const [loss] = await db.query(
      `SELECT COUNT(*) AS c 
       FROM bicycle_loss_report 
       WHERE nisit_email = ? 
       AND LossReport_Status NOT IN ('อนุมัติการชำระเงิน')`,
      [id]
    );

    const hasActive = borrow.c > 0 || loss.c > 0;

    return Response.json({ hasActive });
  } catch (err) {
    console.error("❌ check-active error:", err);
    return Response.json({ error: "Database query failed" }, { status: 500 });
  }
}
