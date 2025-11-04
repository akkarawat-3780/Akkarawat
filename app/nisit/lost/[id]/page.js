'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./style.css"; // ✅ import CSS

export default function LostPaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [report, setReport] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Popup state
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
      if (type === "success") router.push("/nisit/lost/history");
    }, 2500);
  };

  // ✅ โหลดข้อมูลแจ้งหาย
  const fetchReport = async () => {
    const res = await fetch(`/api/loss-report/${id}`);
    if (res.ok) {
      const data = await res.json();
      setReport(data);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showPopup("❌ กรุณาอัปโหลดสลิปการโอนเงิน", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/loss-report/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");

      const data = await res.json();
      showPopup(data.message || "✅ ส่งสลิปสำเร็จ รอการตรวจสอบจากแอดมิน", "success");
    } catch (err) {
      console.error("payment error:", err);
      showPopup("❌ เกิดข้อผิดพลาดในการอัปโหลด", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!report) return <p className="loading-text">⏳ กำลังโหลด...</p>;

  return (
    <div className="payment-container">
      <h1>💳 ชำระเงินค่าชดใช้จักรยาน</h1>

      <div className="payment-info">
        <p><b>รหัสแจ้งหาย:</b> {report.LossReport_ID}</p>
        <p><b>รหัสจักรยาน:</b> {report.Bicycle_ID}</p>
        <p><b>สถานะปัจจุบัน:</b> {report.LossReport_Status}</p>
        <p><b>ยอดที่ต้องชำระ:</b> 1500 บาท</p>
        <p><b>บัญชีธนาคาร:</b> 123-456-7890 (ธนาคารกรุงไทย)</p>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <label>📎 อัปโหลดสลิปการโอนเงิน:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {previewUrl && (
          <div className="slip-preview">
            <p>📷 ตัวอย่างสลิป:</p>
            <img src={previewUrl} alt="slip preview" />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "⏳ กำลังส่ง..." : "📤 ส่งสลิป"}
        </button>
      </form>

      {/* ✅ Popup กลางจอ */}
      {popup.show && (
        <div className={`popup-overlay ${popup.type}`}>
          <div className="popup-box">
            <h3>{popup.type === "success" ? "✅ สำเร็จ" : "❌ ข้อผิดพลาด"}</h3>
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
