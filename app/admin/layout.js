'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react'; // icon menu
import './style.css';

export default function Navbar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState('/default-profile.png');
  const dropdownRef = useRef(null);

  // อ่าน profile จาก cookie
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const profileCookie = cookies.find(c => c.startsWith('profile='));
    if (profileCookie) {
      const value = decodeURIComponent(profileCookie.split('=')[1]);
      const normalized = value.startsWith('/') ? value : '/' + value;
      setProfile(normalized);
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login/admin';
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          {/* ปุ่มเมนูเปิด Sidebar */}
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
        <h2 className='logo'>🚲 KU-Bike</h2>

        <div className="navbar-right" ref={dropdownRef}>
          <Link href="/admin/profile/admin">
            <img
              src={profile}
              alt="Profile"
              className="profile-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.png';
              }}
              style={{ cursor: 'pointer' }}
            />
          </Link>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>
        <div className="sidebar-profile">
          <img src={profile} alt="Profile" className="sidebar-img" />
          <p>ผู้ดูแลระบบ</p>
        </div>
        <Link href="/admin/dashboard/borrow-stats" onClick={() => setSidebarOpen(false)}>📜 รายงานการจอง</Link>
        <Link href="/admin/bike" onClick={() => setSidebarOpen(false)}>🚲 จัดการข้อมูลจักรยาน</Link>
        <Link href="/admin/member" onClick={() => setSidebarOpen(false)}>👤 จัดการข้อมูลสมาชิก</Link>
        <Link href="/admin/bike/approved" onClick={() => setSidebarOpen(false)}>✅ อนุมัติข้อมูลจักรยาน</Link>
        <Link href="/admin/loss-report" onClick={() => setSidebarOpen(false)}>✅ อนุมัติการแจ้งหาย</Link>
        <Link href="/admin/profile/admin" onClick={() => setSidebarOpen(false)}>👤 แก้ไขข้อมูลส่วนตัว</Link>
        <button onClick={handleLogout}>🚪 ออกจากระบบ</button><br/>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main>{children}</main>
    </>
  );
}
