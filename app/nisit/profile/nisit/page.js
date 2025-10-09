'use client';

import { useEffect, useState } from 'react';
import "./style.css"

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // โหลดข้อมูลนิสิต
    fetch('/api/profile/nisit')
      .then(res => res.json())
      .then(async (data) => {
        setUser(data);
        if (data.faculty_id) {
          const res = await fetch(`/api/departments?faculty_id=${data.faculty_id}`);
          const dept = await res.json();
          setDepartments(dept);
        }
      });

    // โหลดคณะ
    fetch('/api/faculties')
      .then(res => res.json())
      .then(setFaculties);
  }, []);

  const [previewUrl, setPreviewUrl] = useState(null);
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value })
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

    const res = await fetch('/api/upload/nisit', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let profilePath = user.profile;
    if (profileFile) {
      profilePath = await handleUpload();
    }

    const res = await fetch('/api/profile/nisit', {
      method: 'PUT',
      body: JSON.stringify({ ...user, profile: profilePath }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      alert('บันทึกข้อมูลเรียบร้อย');
      document.cookie = `profile=${encodeURIComponent(profilePath)}; path=/`;
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="wrapper">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
      <form onSubmit={handleSubmit}>
        <h1 className='title'>แก้ไขข้อมูลนิสิต</h1>

        <div className="row">
          <img src={previewUrl || user.profile} alt="profile" className="profile-preview"/>
        </div>

        <div className="row">
          <i className="fas fa-envelope"></i>
          <input type="file" accept="image/*" onChange={handleFileChange}/>
        </div>

        <div className="row">
          <i className="fas fa-id-card"></i>
          <input value={user.Nisit_ID} readOnly disabled />
        </div>

        {/* <div className="row">
          <i className="fas fa-user-tag"></i>
          <select name="prefix" value={user.prefix} onChange={handleChange}>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>
        </div> */}

        <div className="row row-name">
          <i className="fas fa-user"></i>
          <div className="name-fields">
            <input placeholder="ชื่อ" name="First_Name" value={user.First_Name} onChange={handleChange} />
            <input placeholder="นามสกุล" name="Last_Name" value={user.Last_Name} onChange={handleChange} />
          </div>
        </div>


        <div className="row">
          <i className="fas fa-building-columns"></i>
          <select name="faculty_id" value={user.faculty_id} onChange={async (e) => {
            handleChange(e);
            const res = await fetch(`/api/departments?faculty_id=${e.target.value}`);
            const dept = await res.json();
            setDepartments(dept);
            setUser(u => ({ ...u, department_id: '' }));
          }}>
            <option value="">-- เลือกคณะ --</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="row">
          <i className="fas fa-building"></i>
          <select name="department_id" value={user.department_id} onChange={handleChange}>
            <option value="">-- เลือกภาควิชา --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="row">
          <i className="fas fa-phone"></i>
          <input placeholder="เบอร์โทรศัพท์" name="Phone_Number" value={user.Phone_Number} onChange={handleChange} />
        </div>

        <div className="button">
          <button type="submit">บันทึกข้อมูล</button>
          <a href="/nisit/profile/nisit/password" className="link-button">เปลี่ยนรหัสผ่าน</a>
        </div>
      </form>
    </div>
  );
}
