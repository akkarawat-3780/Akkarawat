// app/api/members/[id]/status/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(_, { params }) {
  const { id } = await params;

  try {
    const [result] = await db.execute(
      'DELETE FROM nisits WHERE Nisit_ID = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่พบนิสิต' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบนิสิตสำเร็จ' });
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
