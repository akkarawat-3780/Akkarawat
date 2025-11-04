'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import './style.css';

export default function EditBikePage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    Bicycle_ID: '',
    Image: '',
    Bicycle_Status: 'ว่าง',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ Popup state
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 3000);
  };

  // โหลดข้อมูลจักรยาน
  useEffect(() => {
    if (!id) return;
    fetch(`/api/bikes/${id}`)
      .then(res => res.json())
      .then(data => setForm(data))
      .catch(err => console.error('โหลดจักรยานผิดพลาด', err));
  }, [id]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return form.Image;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/bike', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imagePath = await handleUpload();

    const res = await fetch(`/api/bikes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...form, Image: imagePath }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      showPopup('✅ แก้ไขข้อมูลจักรยานสำเร็จ', 'success');
      setTimeout(() => {
        window.location.href = '/admin/bike';
      }, 2000);
    } else {
      showPopup('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  return (
    <div className="edit-bike-container">
      <h1>🛠️ แก้ไขจักรยานรหัส {id}</h1>

      <form onSubmit={handleSubmit} className="edit-bike-form">
        <div className="form-group">
          <label>รหัสจักรยาน</label>
          <input name="Bicycle_ID" value={form.Bicycle_ID} disabled />
        </div>

        <div className="form-group">
          <label>สถานะจักรยาน</label>
          <select
            name="Bicycle_Status"
            value={form.Bicycle_Status}
            onChange={handleInput}
          >
            <option value="ว่าง">ว่าง</option>
            <option value="อยู่ระหว่างการตรวจสอบ">อยู่ระหว่างการตรวจสอบ</option>
            <option value="ไม่พร้อมใช้งาน">ไม่พร้อมใช้งาน</option>
          </select>
        </div>

        <div className="form-group">
          <label>รูปภาพจักรยาน</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {(previewUrl || form.Image) && (
            <div style={{ marginTop: '1rem' }}>
              <img
                src={previewUrl || form.Image}
                alt="Bike"
                width="200"
                className="bike-preview"
              />
            </div>
          )}
        </div>

        <button type="submit" className="save-btn">💾 บันทึก</button>
      </form>

      {/* ✅ Popup กลางจอ */}
      {popup.show && (
        <div className={`popup-overlay ${popup.type}`}>
          <div className="popup-box">
            <h3>{popup.type === 'success' ? '✅ สำเร็จ' : '❌ เกิดข้อผิดพลาด'}</h3>
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
