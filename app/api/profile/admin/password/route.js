import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function PUT(req) {
  try {
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ message: "รหัสผ่านไม่ถูกต้อง" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const admin_email = cookieStore.get("email")?.value;

    if (!admin_email) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `UPDATE admin SET Password = ? WHERE admin_email = ?`,
      [hashedPassword, admin_email]
    );

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อย" });
  } catch (err) {
    console.error("PUT /api/profile/admin/password error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
