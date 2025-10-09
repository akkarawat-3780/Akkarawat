"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ import useRouter
import "./style.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ ใช้สำหรับ redirect
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      router.push("/login/nisit"); // ✅ กลับไปหน้า login
    }
  };

  return (
    <div className="reset-container">
      <h1 className="reset-title">🔐 ตั้งรหัสผ่านใหม่</h1>
      <form onSubmit={handleSubmit} className="reset-form">
        <input
          type="password"
          className="reset-input"
          placeholder="รหัสผ่านใหม่"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="reset-input"
          placeholder="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="reset-button">
          ยืนยัน
        </button>
      </form>
    </div>
  );
}
