"use client";
import { useState } from "react";
import "./style.css"; // ✅ import CSS

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [error, setError] = useState("");

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // ล้าง error เดิมก่อนส่ง

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      showPopup(data.message || "✅ ส่งลิงก์รีเซ็ตรหัสผ่านสำเร็จ", "success");
      setEmail("");
    } else {
      setError(data.message || "❌ ไม่พบอีเมลในระบบ");
    }
  };

  return (
    <div className="forgot-container">
      <h1 className="forgot-title">🔑 ลืมรหัสผ่าน</h1>

      <form onSubmit={handleSubmit} className="forgot-form">
        <input
          type="email"
          className={`forgot-input ${error ? "error-input" : ""}`}
          placeholder="กรอกอีเมลของคุณ"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(""); // ล้าง error เมื่อพิมพ์ใหม่
          }}
          required
        />
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="forgot-button">
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>

      {/* ✅ Popup แสดงเฉพาะ success */}
      {popup.show && (
        <div className={`success-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
