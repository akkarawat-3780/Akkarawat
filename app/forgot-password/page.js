"use client";
import { useState } from "react";
import "./style.css"; // ✅ import CSS

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="forgot-container">
      <h1 className="forgot-title">🔑 ลืมรหัสผ่าน</h1>
      <form onSubmit={handleSubmit} className="forgot-form">
        <input
          type="email"
          className="forgot-input"
          placeholder="กรอกอีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="forgot-button">
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>
    </div>
  );
}
