import { cookies } from 'next/headers';

export async function getLoginCookie() {
  const cookieStore = cookies();  // ไม่ต้อง await ในฟังก์ชันนี้ (ถ้าใช้ใน Server Component)
  const token = cookieStore.get('token')?.value;
  return token || null;
}
