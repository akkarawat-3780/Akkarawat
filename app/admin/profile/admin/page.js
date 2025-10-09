'use client';

import { useEffect, useState } from 'react';
import "./style.css"; // หรือเปลี่ยนเป็น "admin-profile.css"

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    fetch('/api/profile/admin')
      .then(res => res.json())
      .then(data => setAdmin(data));
  }, []);
  const [previewUrl, setPreviewUrl] = useState(null);
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };
  // ใน handleChange สำหรับไฟล์ภาพ
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
      alert('บันทึกข้อมูลเรียบร้อย');
      document.cookie = `profile=${encodeURIComponent(profilePath)}; path=/`;
    }
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <div className="wrapper">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
      <form onSubmit={handleSubmit}>
        <h1 className="title">แก้ไขข้อมูลผู้ดูแลระบบ</h1>

        <div className="row">
          <img src={previewUrl || admin.profile} alt="profile" className="profile-preview"/>
        </div>
        <div className="row">
          <i className="fas fa-envelope"></i>
          <input type="file" accept="image/*" onChange={handleFileChange}/>
        </div>

        <div className="row">
          <i className="fas fa-envelope"></i>
          <input value={admin.admin_email} readOnly disabled />
        </div>

        <div className="row row-name">
          <i className="fas fa-user"></i>
          <div className="name-fields">
            <input placeholder="ชื่อ" name="First_Name" value={admin.First_Name} onChange={handleChange}/>
            <input placeholder="นามสกุล" name="Last_Name" value={admin.Last_Name} onChange={handleChange}/>
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
          <button type="submit">บันทึกข้อมูล</button>
          <a href="/admin/profile/admin/password" className="link-button">เปลี่ยนรหัสผ่าน</a>
        </div>
      </form>
    </div>
  );
}
