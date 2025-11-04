'use client';

import { useEffect, useState } from 'react';
import './style.css';

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

export default function LostHistoryPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState({ open: false, report: null });
  const [cancelModal, setCancelModal] = useState({ open: false, id: "", reason: "" });
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });

  const fetchReports = async () => {
    const res = await fetch('/api/loss-report/history');
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "success" }), 2500);
  };

  // ✅ ฟังก์ชันยกเลิกการแจ้งหาย (พร้อมเหตุผล)
  const handleCancel = async () => {
    if (!cancelModal.id) return;

    if (!cancelModal.reason.trim()) {
      showPopup("⚠️ กรุณากรอกเหตุผลก่อนยกเลิก", "error");
      return;
    }

    const res = await fetch(`/api/loss-report/${cancelModal.id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: cancelModal.reason }),
    });

    if (res.ok) {
      showPopup("✅ ยกเลิกการแจ้งหายสำเร็จ");
      await fetchReports();
    } else {
      showPopup("❌ ไม่สามารถยกเลิกการแจ้งหายได้", "error");
    }

    setCancelModal({ open: false, id: "", reason: "" });
  };

  const filteredReports = reports.filter(r =>
    r.LossReport_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.Borrow_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.Bicycle_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.LossReport_Status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusClass = (status) => {
    if (status === "อนุมัติการชำระเงิน") return "approved";
    if (status === "ไม่อนุมัติการแจ้งหาย" || status === "ชำระเงินไม่ถูกต้อง") return "rejected";
    if (status === "รอตรวจสอบการชำระเงิน" || status === "รอการชำระเงิน") return "lost-pending";
    if (status === "ยกเลิกการแจ้งหาย") return "cancelled";
    return "pending";
  };

  return (
    <div className="container">
      <h1 className="heading">🚨 ประวัติการแจ้งหาย</h1>

      {/* ✅ Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาด้วยรหัส/สถานะ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredReports.length === 0 ? (
        <p>ไม่มีประวัติการแจ้งหาย</p>
      ) : (
        <table className="bike-table">
          <thead>
            <tr>
              <th>รหัสแจ้งหาย</th>
              <th>รหัสการจอง</th>
              <th>เลขทะเบียนจักรยาน</th>
              <th>วันที่แจ้ง</th>
              <th>สถานะ</th>
              <th>ผู้ตรวจสอบ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(r => (
              <tr key={r.LossReport_ID}>
                <td>{r.LossReport_ID}</td>
                <td>{r.Borrow_ID}</td>
                <td>{r.Bicycle_ID}</td>
                <td>{formatDate(r.LossReport_Date)}</td>
                <td>
                  <span className={`status ${getStatusClass(r.LossReport_Status)}`}>
                    {r.LossReport_Status}
                  </span>
                </td>
                <td>{r.admin_email || "-"}</td>
                <td>
                  {/* ✅ เงื่อนไขการแสดงปุ่ม */}
                  {["รอการตรวจสอบ", "รอการชำระเงิน"].includes(r.LossReport_Status) && (
                    <>
                      {r.LossReport_Status === "รอการชำระเงิน" && (
                        <button 
                          onClick={() => (window.location.href = `/nisit/lost/${r.LossReport_ID}`)}
                          className="confirm-btn"
                        >
                          💳 ไปหน้าชำระเงิน
                        </button>
                      )}
                      <button
                        className="cancel-btn"
                        onClick={() => setCancelModal({ open: true, id: r.LossReport_ID, reason: "" })}
                      >
                        ❌ ยกเลิก
                      </button>
                    </>
                  )}

                  {/* ✅ ถ้า “ชำระเงินไม่ถูกต้อง” → ให้ปุ่มไปหน้าชำระเงินใหม่ */}
                  {r.LossReport_Status === "ไม่อนุมัติ" && (
                    <button
                      className="confirm-btn"
                      onClick={() => (window.location.href = `/nisit/lost/${r.LossReport_ID}`)}
                    >
                      💸 ชำระใหม่
                    </button>
                  )}

                  {/* ✅ ปุ่มดูรายละเอียด */}
                  {["อนุมัติ", "ไม่อนุมัติ", "ยกเลิก","รอการอนุมัติ"].includes(r.LossReport_Status) && (
                    <button
                      className="btn view"
                      onClick={() => setViewModal({ open: true, report: r })}
                    >
                      👁️ ตรวจสอบ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal ดูรายละเอียด */}
      {viewModal.open && viewModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📄 ตรวจสอบการแจ้งหาย</h3>
            <div className="modal-content">
              <p><b>รหัสแจ้งหาย:</b> {viewModal.report.LossReport_ID}</p>
              <p><b>รหัสการจอง:</b> {viewModal.report.Borrow_ID}</p>
              <p><b>เลขทะเบียนจักรยาน:</b> {viewModal.report.Bicycle_ID}</p>
              <p><b>วันที่แจ้ง:</b> {formatDate(viewModal.report.LossReport_Date)}</p>
              <p><b>สถานะ:</b> {viewModal.report.LossReport_Status}</p>
              <p><b>ผู้ตรวจสอบ:</b> {viewModal.report.admin_email || "-"}</p>

              {/* ✅ แสดงเหตุผลที่ไม่อนุมัติหรือเหตุผลการยกเลิก */}
              {viewModal.report.remark && (
                <div className="remark-box">
                  <b>เหตุผล:</b> {viewModal.report.remark}
                </div>
              )}

              <div className="receipt-preview">
                <p><b>ใบเสร็จ:</b></p>
                {viewModal.report.LossReport_receipt ? (
                  <img
                    src={viewModal.report.LossReport_receipt}
                    alt="ใบเสร็จ"
                    className="receipt-image"
                  />
                ) : (
                  <p>❌ ไม่มีใบเสร็จแนบมา</p>
                )}
              </div>
            </div>

            {/* ✅ ถ้าสถานะคือ “ชำระเงินไม่ถูกต้อง” เพิ่มปุ่มไปชำระใหม่ */}
            <div className="modal-buttons">
              {viewModal.report.LossReport_Status === "ชำระเงินไม่ถูกต้อง" && (
                <button
                  className="confirm-btn"
                  onClick={() => (window.location.href = `/nisit/lost/${viewModal.report.LossReport_ID}`)}
                >
                  💸 ไปชำระใหม่
                </button>
              )}
              <button
                className="cancel-btn"
                onClick={() => setViewModal({ open: false, report: null })}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal ยกเลิกการแจ้งหาย พร้อมกรอกเหตุผล */}
      {cancelModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการยกเลิก</h3>
            <p>กรุณาระบุเหตุผลในการยกเลิกการแจ้งหายรหัส <b>{cancelModal.id}</b></p>
            <textarea
              placeholder="กรอกเหตุผลการยกเลิก..."
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              rows={4}
              className="reason-input"
            />
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleCancel}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={() => setCancelModal({ open: false, id: "", reason: "" })}>
                ❌ ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup */}
      {popup.show && (
        <div className={`success-popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
}
