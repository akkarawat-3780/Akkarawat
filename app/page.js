import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login/nisit'); // เปลี่ยนเส้นทางไปหน้า login
}
