'use client';

import { useState, useEffect } from 'react';
import './style.css';
import Link from 'next/link';
import { Menu } from 'lucide-react'; // ไอคอนเมนู

export default function Navbar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState('/default-profile.png');

  // โหลดโปรไฟล์จาก cookie
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
    window.location.href = '/login/nisit';
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
        <div>
          <h2 className='logo'>🚲 KU-Bike</h2>
        </div>

        <div className="navbar-right">
          <Link href="/nisit/profile/nisit">
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
          <p>นิสิต</p>
        </div>
        <Link href="/nisit/request" onClick={() => setSidebarOpen(false)}>📌 จองจักรยาน</Link>
        <Link href="/nisit/history" onClick={() => setSidebarOpen(false)}>📜 ประวัติการจองจักรยาน</Link>
        <Link href="/nisit/lost/history" onClick={() => setSidebarOpen(false)}>🚨 ประวัติการแจ้งหาย</Link>
        <Link href="/nisit/profile/nisit" onClick={() => setSidebarOpen(false)}>👤 แก้ไขข้อมูลส่วนตัว</Link>
        <button onClick={handleLogout}>🚪 ออกจากระบบ</button>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main>{children}</main>
    </>
  );
}
