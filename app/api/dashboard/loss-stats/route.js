import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 🔹 สถิติการแจ้งหาย + การชำระเงิน (ตามคณะ + เดือน)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const faculty = searchParams.get("faculty");
    const month = searchParams.get("month"); // YYYY-MM

    let conditions = [];
    let params = [];

    if (faculty && faculty !== "ทั้งหมด") {
      conditions.push("f.faculty_name = ?");
      params.push(faculty);
    }

    if (month) {
      conditions.push("DATE_FORMAT(lr.LossReport_Date, '%Y-%m') = ?");
      params.push(month);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // 🔹 Query รวมสถิติแจ้งหาย
    const [rows] = await db.execute(
      `
      SELECT 
        f.faculty_name,
        lr.LossReport_Status AS status,
        COUNT(*) AS count
      FROM bicycle_loss_report lr
      JOIN nisits n ON lr.nisit_email = n.nisit_email
      JOIN department d ON n.department_id = d.department_id
      JOIN faculty f ON d.faculty_id = f.faculty_id
      ${whereClause}
      GROUP BY f.faculty_name, lr.LossReport_Status
      ORDER BY f.faculty_name;
      `,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/dashboard/loss-stats error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
