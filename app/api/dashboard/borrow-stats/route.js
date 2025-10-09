import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 🔹 สถิติการยืมจักรยาน (ตามคณะ + เดือน)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const faculty = searchParams.get("faculty");
    const month = searchParams.get("month"); // รูปแบบ YYYY-MM

    // สร้างเงื่อนไข SQL
    let conditions = [];
    let params = [];

    if (faculty && faculty !== "ทั้งหมด") {
      conditions.push("f.faculty_name = ?");
      params.push(faculty);
    }

    if (month) {
      conditions.push("DATE_FORMAT(br.Borrow_Date, '%Y-%m') = ?");
      params.push(month);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // 🔹 Query รวมสถิติ
    const [rows] = await db.execute(
      `
      SELECT 
        f.faculty_name,
        br.Borrow_Status AS borrow_status,
        COUNT(*) AS count
      FROM bicycle_borrow_request br
      JOIN nisits n ON br.nisit_email = n.nisit_email
      JOIN department d ON n.department_id = d.department_id
      JOIN faculty f ON d.faculty_id = f.faculty_id
      ${whereClause}
      GROUP BY f.faculty_name, br.Borrow_Status
      ORDER BY f.faculty_name;
      `,
      params
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/dashboard/borrow-stats error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
