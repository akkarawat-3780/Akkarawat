import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('file');

  if (!file) return new Response("No file uploaded", { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}-${file.name}`;

  const dir = path.join(process.cwd(), 'public/uploads/admin');
  const filePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);

  return Response.json({ path: `/uploads/admin/${filename}` });
}
