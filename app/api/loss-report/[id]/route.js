import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ✅ GET: ดึงข้อมูลการแจ้งหาย 1 รายการ
export async function GET(req, context) {
  try {
    const { id } = await context.params; // ต้อง await
    const [rows] = await db.execute(
      `SELECT lr.*, br.Borrow_ID, br.Bicycle_ID 
       FROM bicycle_loss_report lr
       JOIN bicycle_borrow_request br ON lr.Bicycle_ID = br.Bicycle_ID
       WHERE lr.LossReport_ID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/loss-report/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ✅ PUT: อัปโหลดสลิป + อัปเดตสถานะ
export async function PUT(req, context) {
  try {
    const { id } = await context.params;

    const contentType = req.headers.get("content-type") || "";

    let receipt = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const fileName = `slip_${Date.now()}_${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        receipt = `/uploads/slips/${fileName}`;
      }
    } else {
      return NextResponse.json({ error: "ต้องส่ง multipart/form-data เท่านั้น" }, { status: 400 });
    }

    if (!receipt) {
      return NextResponse.json({ error: "กรุณาอัปโหลดสลิป" }, { status: 400 });
    }

    // 🔹 อัปเดตสถานะ + แนบสลิป
    const [result] = await db.execute(
      `UPDATE bicycle_loss_report
       SET LossReport_Status = 'รอตรวจสอบการชำระเงิน',
           LossReport_receipt = ?
       WHERE LossReport_ID = ?`,
      [receipt, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสำหรับอัปเดต" }, { status: 404 });
    }

    return NextResponse.json({
      message: "✅ อัปโหลดสลิปและอัปเดตสถานะเป็น 'รอตรวจสอบการชำระเงิน' สำเร็จ",
      receipt,
    });
  } catch (err) {
    console.error("PUT /api/loss-report/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
