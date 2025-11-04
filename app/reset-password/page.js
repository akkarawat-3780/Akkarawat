"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./style.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({ password: "", confirm: "" });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // 💅 เพิ่ม state สำหรับจัดการการแสดง/ซ่อนรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const showPopup = (message, type = "success", redirect = false) => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
      if (redirect) router.push("/login/nisit");
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    const newError = { password: "", confirm: "" };

    if (password.length < 6) {
      newError.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      valid = false;
    }

    if (password !== confirmPassword) {
      newError.confirm = "รหัสผ่านไม่ตรงกัน";
      valid = false;
    }

    setError(newError);
    if (!valid) return;

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();

    if (res.ok) {
      showPopup("✅ ตั้งรหัสผ่านใหม่สำเร็จ กำลังกลับไปหน้าเข้าสู่ระบบ...", "success", true);
    } else {
      setError({ password: "", confirm: data.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้" });
    }
  };

  return (
    <div className="reset-container">
      {/* 💅 เพิ่ม Link สำหรับ CSS ของ FontAwesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />

      <h1 className="reset-title">🔐 ตั้งรหัสผ่านใหม่</h1>

      <form onSubmit={handleSubmit} className="reset-form">
        {/* ✅ ช่องรหัสผ่านใหม่ */}
        {/* 💅 ห่อ input และ icon ด้วย div */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"} // เปลี่ยน type ตาม state
            className={`reset-input ${error.password ? "error-input" : ""}`}
            placeholder="รหัสผ่านใหม่"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError({ ...error, password: "" });
            }}
            required
          />
          {/* 💅 เพิ่มไอคอนสำหรับกดสลับ */}
          <i
            className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>
        {error.password && <p className="error-text">{error.password}</p>}

        {/* ✅ ช่องยืนยันรหัสผ่าน */}
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"} // เปลี่ยน type ตาม state
            className={`reset-input ${error.confirm ? "error-input" : ""}`}
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError({ ...error, confirm: "" });
            }}
            required
          />
          <i
            className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          ></i>
        </div>
        {error.confirm && <p className="error-text">{error.confirm}</p>}

        <button type="submit" className="reset-button">
          ยืนยัน
        </button>
      </form>

      {/* ✅ Popup เฉพาะกรณีสำเร็จ */}
      {popup.show && (
        <div className={`success-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}