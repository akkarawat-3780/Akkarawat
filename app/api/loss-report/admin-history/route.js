// app/api/loss-report/admin-history/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
    lr.LossReport_ID,
    lr.Bicycle_ID,
    n.nisit_ID,
    n.prefix,
    n.First_Name,
    n.Last_Name,
    d.department_name,
    f.faculty_name,
    lr.LossReport_Date,
    lr.LossReport_receipt,
    lr.LossReport_Status,
    lr.admin_email,
    MAX(br.Borrow_ID) AS Borrow_ID, -- เอาอันล่าสุด
    lr.Bicycle_ID,
    lr.nisit_email
FROM bicycle_loss_report lr
INNER JOIN bicycle_borrow_request br 
    ON lr.Bicycle_ID = br.Bicycle_ID 
   AND br.nisit_email = lr.nisit_email
   INNER JOIN nisits n ON lr.nisit_email = n.nisit_email
   INNER JOIN department d ON d.department_id = n.department_id
   INNER JOIN faculty f ON f.faculty_id = d.faculty_id
GROUP BY 
    lr.LossReport_ID,
    lr.LossReport_Date,
    lr.LossReport_receipt,
    lr.LossReport_Status,
    lr.admin_email,
    lr.Bicycle_ID,
    lr.nisit_email
ORDER BY lr.LossReport_Date DESC;

    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/loss-report/admin-history error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
