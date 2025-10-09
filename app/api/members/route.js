import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 📌 ดึงข้อมูลสมาชิกทั้งหมด
export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT nisit_email, Nisit_ID, prefix, First_Name, Last_Name, profile, Phone_Number, d.department_name, f.faculty_name 
      FROM nisits INNER JOIN department d ON d.department_id = nisits.department_id INNER JOIN faculty f on f.faculty_id = d.faculty_id ORDER BY First_Name ASC;`
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/members error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

