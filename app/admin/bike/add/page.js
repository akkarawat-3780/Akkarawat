'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css'; // คุณสามารถสร้างไฟล์นี้แยกต่างหาก

export default function AddBikePage() {
  const [form, setForm] = useState({
    Bicycle_ID: '',
    Bicycle_Status: 'ว่าง',
  });
  const [file, setFile] = useState(null);
  const router = useRouter();

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/bike', { method: 'POST', body: formData });
    const data = await res.json();
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imagePath = await handleUpload();

    const res = await fetch('/api/bikes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, Image: imagePath }),
    });

    if (res.ok) {
      alert('เพิ่มจักรยานเรียบร้อย');
      router.push('/admin/bike');
    } else {
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="bike-form-container">
      <h1>➕ เพิ่มจักรยาน</h1>
      <form onSubmit={handleSubmit} className="bike-form">
        <label>รหัสจักรยาน:</label>
        <input
          name="Bicycle_ID"
          placeholder="กรอกรหัสจักรยาน"
          value={form.Bicycle_ID}
          onChange={handleInput}
          required
        />

        <label>รูปภาพ:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} required />

        <label>สถานะ:</label>
        <select name="Bicycle_Status" value={form.Bicycle_Status} onChange={handleInput}>
          <option value="ว่าง">ว่าง</option>
          <option value="อยู่ระหว่างการตรวจสอบ">อยู่ระหว่างการตรวจสอบ</option>
          <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
        </select>

        <button type="submit">เพิ่มจักรยาน</button>
      </form>
    </div>
  );
}
