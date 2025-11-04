import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ✅ ต้อง await ก่อนใช้
    const cookieStore = await cookies();
    const nisit_email = cookieStore.get("email")?.value;

    if (!nisit_email) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const [rows] = await db.execute(
      `SELECT lr.LossReport_ID,lr.remark, lr.LossReport_Date, lr.LossReport_receipt, lr.LossReport_Status, lr.admin_email, br.Borrow_ID, br.Bicycle_ID 
      FROM bicycle_loss_report lr 
      JOIN bicycle_borrow_request br ON br.Borrow_ID = ( SELECT b.Borrow_ID FROM bicycle_borrow_request b WHERE b.Bicycle_ID = lr.Bicycle_ID AND b.nisit_email = lr.nisit_email ORDER BY b.Borrow_Date DESC LIMIT 1 ) 
      WHERE lr.nisit_email = ? ORDER BY lr.LossReport_ID DESC`,
      [nisit_email]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/loss-report/history error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
