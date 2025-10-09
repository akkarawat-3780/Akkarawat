import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔹 ตรวจสอบโฟลเดอร์ uploads/slips
    const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
    await fs.mkdir(uploadDir, { recursive: true });

    // 🔹 ตั้งชื่อไฟล์ใหม่ ป้องกันชื่อชนกัน
    const ext = file.name.split(".").pop();
    const newFileName = `slip_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, newFileName);

    // 🔹 แปลงไฟล์เป็น Buffer และบันทึก
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // 🔹 return path สำหรับเก็บใน DB
    return NextResponse.json({
      path: `/uploads/slips/${newFileName}`,
    });
  } catch (err) {
    console.error("upload slip error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
