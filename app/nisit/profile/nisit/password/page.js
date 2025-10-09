'use client';

import { useState } from "react";
import "./style.css";

export default function AdminChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/profile/nisit/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    setLoading(false);
    if (res.ok) {
      alert("✅ เปลี่ยนรหัสผ่านสำเร็จ");
      window.location.href = "/nisit/profile/nisit"; // กลับไปหน้าข้อมูลส่วนตัว
    } else {
      alert("❌ ไม่สามารถเปลี่ยนรหัสผ่านได้");
    }
  };

  return (
    <div className="wrapper">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      />
      <form onSubmit={handleSubmit}>
        <h1 className="title">🔒 เปลี่ยนรหัสผ่าน</h1>

        <div className="row">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="row">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="button">
          <button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
          </button>
          <a href="/nisit/profile/nisit" className="link-button">⬅ ย้อนกลับ</a>
        </div>
      </form>
    </div>
  );
}
