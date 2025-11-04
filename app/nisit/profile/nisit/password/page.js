'use client';

import { useState } from "react";
import "./style.css";

export default function AdminChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });

  // 👁️ สถานะซ่อน/แสดงรหัสผ่าน
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showPopup("❌ รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup("❌ รหัสผ่านไม่ตรงกัน", "error");
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
      showPopup("✅ เปลี่ยนรหัสผ่านสำเร็จ", "success");
      setTimeout(() => (window.location.href = "/nisit/profile/nisit"), 1500);
    } else {
      showPopup("❌ ไม่สามารถเปลี่ยนรหัสผ่านได้", "error");
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

        {/* ช่องรหัสผ่านใหม่ */}
        <div className="row">
          <i className="fas fa-lock"></i>
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <i
            className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
            onClick={() => setShowNewPassword(!showNewPassword)}
          ></i>
        </div>

        {/* ช่องยืนยันรหัสผ่านใหม่ */}
        <div className="row">
          <i className="fas fa-lock"></i>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <i
            className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          ></i>
        </div>

        <div className="button">
          <button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
          </button>
          <a href="/nisit/profile/nisit" className="link-button">⬅ ย้อนกลับ</a>
        </div>
      </form>

      {/* ✅ Popup แจ้งเตือน */}
      {popup.show && (
        <div className={`success-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
