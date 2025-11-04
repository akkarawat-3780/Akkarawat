// app/api/bikes/[id]/route.js

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
export async function GET(_, { params }) {
  const { id } = await params;

   try {
    const [rows] = await db.execute('SELECT * FROM bicycle WHERE Bicycle_ID = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const data = await req.json();
  const { Image, Bicycle_Status } = data;

  try {
    await db.execute(
      'UPDATE bicycle SET Image = ?, Bicycle_Status = ? WHERE Bicycle_ID = ?',
      [Image, Bicycle_Status, id]
    );

    return NextResponse.json({ message: 'อัปเดตสำเร็จ' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function DELETE(_, { params }) {
  const { id } = await params;

  try {
    const [result] = await db.execute(
      'DELETE FROM bicycle WHERE Bicycle_ID = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่พบจักรยาน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบจักรยานสำเร็จ' });
  } catch (err) {
    console.error(err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
