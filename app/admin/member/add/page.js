'use client';

import { useState, useEffect } from 'react';
import './style.css';

export default function RegisterPage() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    nisit_id: '',
    prefix: 'นาย',
    first_name: '',
    last_name: '',
    faculty_id: '',
    department_id: '',
    email: '',
    password: '',
    phone: '',
    profile: '/default-profile.png'
  });

  const [errors, setErrors] = useState({
    nisit_id: '',
    phone: '',
    email: '',
  });

  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetch('/api/faculties')
      .then(res => res.json())
      .then(setFaculties);
  }, []);

  useEffect(() => {
    if (form.faculty_id) {
      fetch(`/api/departments?faculty_id=${form.faculty_id}`)
        .then(res => res.json())
        .then(setDepartments);
    }
  }, [form.faculty_id]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { nisit_id: '', phone: '', email: '' };

    if (!/^[0-9]{10}$/.test(form.nisit_id)) {
      newErrors.nisit_id = 'รหัสนิสิตต้องเป็นตัวเลข 10 หลักเท่านั้น';
      valid = false;
    }

    if (!/^0[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0';
      valid = false;
    }

    if (!/^[^\s@]+@(ku\.th)$/.test(form.email)) {
      newErrors.email = 'อีเมลต้องลงท้ายด้วย @ku.th เท่านั้น';
      valid = false;
    }if (!form.password || form.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
      valid = false;
   }

    setErrors(newErrors);
    return valid;
  };

  const showPopup = (message, type = 'success', redirect = false) => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: '', type: '' });
      if (redirect) window.location.href = '/admin/member';
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      showPopup('✅ เพิ่มข้อมูลสมาชิกสำเร็จ!', 'success', true);
    } else {
      showPopup('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล', 'error');
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // ตรวจสอบเรียลไทม์ และลบข้อความ error เมื่อแก้ถูก
    setErrors(prev => ({
      ...prev,
      [field]:
        field === 'nisit_id' && /^[0-9]{10}$/.test(value)
          ? ''
          : field === 'phone' && /^0[0-9]{9}$/.test(value)
          ? ''
          : field === 'email' && /^[^\s@]+@(ku\.th)$/.test(value)
          ? ''
          : prev[field],
    }));
  };

  return (
    <div className="register-form-container">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      />
      <div className="title">เพิ่มข้อมูลสมาชิก</div>
      <form onSubmit={handleSubmit}>

        {/* 🔹 รหัสนิสิต */}
        <div className="row">
          <i className="fas fa-id-card"></i>
          <input
            required
            placeholder="รหัสนิสิต (10 หลัก)"
            value={form.nisit_id}
            onChange={e => handleChange('nisit_id', e.target.value)}
            className={errors.nisit_id ? 'error-input' : ''}
          />
        </div>
        {errors.nisit_id && <p className="error-text">{errors.nisit_id}</p>}

        {/* 🔹 คำนำหน้า */}
        <div className="row">
          <i className="fas fa-user-tag"></i>
          <select value={form.prefix} onChange={e => handleChange('prefix', e.target.value)}>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>
        </div>

        {/* 🔹 ชื่อ-นามสกุล */}
        <div className="row row-name">
          <i className="fas fa-user"></i>
          <div className="name-fields">
            <input required placeholder="ชื่อ" onChange={e => handleChange('first_name', e.target.value)} />
            <input required placeholder="นามสกุล" onChange={e => handleChange('last_name', e.target.value)} />
          </div>
        </div>

        {/* 🔹 คณะ */}
        <div className="row">
          <i className="fas fa-building-columns"></i>
          <select required value={form.faculty_id} onChange={e => handleChange('faculty_id', e.target.value)}>
            <option value="">-- เลือกคณะ --</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* 🔹 ภาควิชา */}
        <div className="row">
          <i className="fas fa-building"></i>
          <select required value={form.department_id} onChange={e => handleChange('department_id', e.target.value)}>
            <option value="">-- เลือกภาควิชา --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* 🔹 อีเมล */}
        <div className="row">
          <i className="fas fa-envelope"></i>
          <input
            required
            type="email"
            placeholder="อีเมล"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            className={errors.email ? 'error-input' : ''}
          />
        </div>
        {errors.email && <p className="error-text">{errors.email}</p>}

        {/* 🔹 รหัสผ่าน */}
        <div className="row">
          <i className="fas fa-lock"></i>
          <input required type="password" placeholder="รหัสผ่าน" onChange={e => handleChange('password', e.target.value)} />
        </div>
        {errors.password && <p className="error-text">{errors.password}</p>}

        {/* 🔹 เบอร์โทร */}
        <div className="row">
          <i className="fas fa-phone"></i>
          <input
            required
            placeholder="เบอร์โทรศัพท์ (10 หลัก)"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            className={errors.phone ? 'error-input' : ''}
          />
        </div>
        {errors.phone && <p className="error-text">{errors.phone}</p>}

        <div className="button">
          <button type="submit">เพิ่มข้อมูลสมาชิก</button>
        </div>
      </form>

      {/* ✅ Popup แจ้งผลลัพธ์ */}
      {popup.show && (
        <div className={`popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
