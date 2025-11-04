'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import './style.css';   // ✅ import CSS

// ✅ ฟังก์ชันแก้ timezone
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReserveBikePage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    Borrow_ID: '',
    Borrow_Date: '',
    due_date: '',
    nisit_email: '',
    Bicycle_ID: ''
  });

  // ✅ state สำหรับ popup
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  // ✅ แสดง popup 3 วิ
  const showPopup = (message, type = 'error') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 3000);
  };

useEffect(() => {
    const match = document.cookie.match(/email=([^;]+)/);
    const today = new Date();

    // ❌ ลบการสร้าง Borrow_ID จาก localStorage ออก
    // เนื่องจากจะสร้าง Borrow_ID ที่ฝั่ง Server (API Route) แทน

    setForm({
      Borrow_ID: '', // ✅ กำหนดให้เป็นค่าว่าง หรือลบออกจาก state ก็ได้ เพราะจะถูกสร้างบน Server
      Borrow_Date: formatDateLocal(today),
      due_date: "",
      nisit_email: match ? decodeURIComponent(match[1]) : "",
      Bicycle_ID: id,
    });
  }, [id]);


  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ ตรวจสอบข้อมูลก่อนส่ง
    if (!form.Borrow_Date || !form.due_date) {
      showPopup('⚠️ กรุณาเลือกวันที่ยืมและวันครบกำหนดให้ครบ');
      return;
    }

    if (!form.Bicycle_ID) {
      showPopup('⚠️ ไม่พบรหัสจักรยาน');
      return;
    }

    if (new Date(form.due_date) <= new Date(form.Borrow_Date)) {
      showPopup('⚠️ วันครบกำหนดต้องหลังจากวันที่ยืมอย่างน้อย 1 วัน');
      return;
    }

    // ✅ ถ้าข้อมูลครบ → ส่งข้อมูล
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
        const data = await res.json();
      showPopup('✅ จองจักรยานสำเร็จ รหัส: ' + data.Borrow_ID, 'success'); // ⬅️ แสดง Borrow_ID ที่ได้กลับมา
      setTimeout(() => {
        window.location.href = '/nisit/history';
      }, 1500);
    } else {
      const data = await res.json();
      showPopup('❌ ' + (data.message || 'จองไม่สำเร็จ'));
    }
  };

  return (
    <div className="reserve-container">
      <h1>🚲 จองจักรยานรหัส {id}</h1>
      <form onSubmit={handleSubmit} className="reserve-form">
        <div className="form-group">
          <label>วันที่ยืม:</label>
          <input
            type="date"
            name="Borrow_Date"
            value={form.Borrow_Date}
            onChange={handleInput}
            required
          />
        </div>

        <div className="form-group">
          <label>วันครบกำหนด:</label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleInput}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          📌 ยืนยันการจอง
        </button>
      </form>

      {/* ✅ Popup ตรงกลางจอ */}
      {popup.show && (
        <div className={`popup-message ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
