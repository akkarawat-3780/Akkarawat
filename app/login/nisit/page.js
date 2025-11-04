'use client';

import { useState } from 'react';
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/login/nisit', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' }
  });

  const result = await res.json();

  if (res.ok && result.success) {
    if (result.role === 'nisit') {
      window.location.href = '/nisit';
    }
  } else {
    setError('Email หรือ Password ไม่ถูกต้อง');
  }
};


  return (
      <div className ="wrapper" >
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
        <form onSubmit={handleLogin}>
          <div className="title"><span>ยืมคืนจักรยาน</span></div>
          <div className="pass"><p>
            <a href="/login/admin">ไปยังหน้า Admin</a>
          </p></div>
        <div className="row">
          <i className="fas fa-user"></i>
          <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="row">
          <i className="fas fa-lock"></i>
          {/* เปลี่ยน type ของ input ตาม state */}
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
          {/* ปุ่มสำหรับ toggle การแสดงรหัสผ่าน */}
          <i
            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>
        <div>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="pass">
          <p><a href="/forgot-password">ลืมรหัสผ่าน?</a></p>
        </div>
        <div className='row button'>
          <button type="submit">เข้าสู่ระบบ</button>
        </div>
         <div className="signup-link"><p><a href='/register'>สมัครสมาชิก</a></p></div>
      </form>
    </div>
  );
}
