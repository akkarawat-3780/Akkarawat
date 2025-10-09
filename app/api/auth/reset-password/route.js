import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    // ตรวจสอบ token
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    // เข้ารหัสรหัสผ่านใหม่
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE nisits SET Password = ? WHERE nisit_email = ?",
      [hashed, email]
    );

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
  }
}
