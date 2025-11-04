'use client';

import { useEffect, useState } from 'react';
import "./style.css";

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" }); // ✅ popup state

  // โหลดข้อมูล admin
  useEffect(() => {
    fetch('/api/profile/admin')
      .then(res => res.json())
      .then(data => setAdmin(data));
  }, []);

  // ✅ ฟังก์ชันแสดง popup
  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
      if (type === "success") window.location.reload(); // ✅ รีเฟรชหน้า
    }, 2500);
  };

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', profileFile);

    const res = await fetch('/api/upload/admin', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let profilePath = admin.profile;
      if (profileFile) {
        profilePath = await handleUpload();
      }

      const res = await fetch('/api/profile/admin', {
        method: 'PUT',
        body: JSON.stringify({ ...admin, profile: profilePath }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        document.cookie = `profile=${encodeURIComponent(profilePath)}; path=/`;
        showPopup("✅ บันทึกข้อมูลเรียบร้อย", "success");
      } else {
        showPopup("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
      }
    } catch (err) {
      console.error("update error:", err);
      showPopup("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
  };

  if (!admin) return <p>⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div className="wrapper">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      />
      <form onSubmit={handleSubmit}>
        <h1 className="title">แก้ไขข้อมูลผู้ดูแลระบบ</h1>

        <div className="row">
          <img
            src={previewUrl || admin.profile}
            alt="profile"
            className="profile-preview"
          />
        </div>

        <div className="row">
          <i className="fas fa-image"></i>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="row">
          <i className="fas fa-envelope"></i>
          <input value={admin.admin_email} readOnly disabled />
        </div>

        <div className="row row-name">
          <i className="fas fa-user"></i>
          <div className="name-fields">
            <input
              placeholder="ชื่อ"
              name="First_Name"
              value={admin.First_Name}
              onChange={handleChange}
            />
            <input
              placeholder="นามสกุล"
              name="Last_Name"
              value={admin.Last_Name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <i className="fas fa-phone"></i>
          <input
            placeholder="เบอร์โทรศัพท์"
            name="Phone_Number"
            value={admin.Phone_Number}
            onChange={handleChange}
          />
        </div>

        <div className="button">
          <button type="submit">💾 บันทึกข้อมูล</button>
          <a href="/admin/profile/admin/password" className="link-button">
            🔐 เปลี่ยนรหัสผ่าน
          </a>
        </div>
      </form>

      {/* ✅ Popup กลางจอ */}
      {popup.show && (
        <div className={`popup-overlay ${popup.type}`}>
          <div className="popup-box">
            <h3>{popup.type === "success" ? "✅ สำเร็จ" : "❌ ข้อผิดพลาด"}</h3>
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
