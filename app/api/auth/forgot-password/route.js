import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // ตรวจสอบว่า email มีอยู่ในระบบไหม
    const [rows] = await db.execute("SELECT * FROM nisits WHERE nisit_email = ?", [email]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "ไม่พบอีเมลนี้" }, { status: 404 });
    }

    // สร้าง token อายุ 15 นาที
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

    // ลิงก์ reset
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // ส่งเมล
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'akarawatjun@gmail.com',
          pass: 'bbss sjqs pzxg jbyv' // ต้องเป็น App Password ไม่ใช่รหัสผ่านบัญชีทั่วไป
        }
      });


    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: email,
      subject: "รีเซ็ตรหัสผ่าน",
      html: `<p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน (ภายใน 15 นาที)</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    return NextResponse.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
