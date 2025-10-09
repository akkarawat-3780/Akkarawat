'use client';
import { useEffect, useState } from "react";
import "./style.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
    .toString().padStart(2, "0")}-${d.getFullYear()}`;
}

export default function AdminLossReportPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, id: "", status: "" });
  const [approveModal, setApproveModal] = useState({ open: false, report: null });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const fetchReports = async () => {
    const res = await fetch("/api/loss-report/admin-history");
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openModal = (id, status) => {
    setModal({ open: true, id, status });
  };

  const closeModal = () => setModal({ open: false, id: "", status: "" });
  const closeApproveModal = () => setApproveModal({ open: false, report: null });

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const confirmUpdate = async () => {
    const { id, status } = modal;
    if (!id) return;

    const match = document.cookie.match(/email=([^;]+)/);
    const admin_email = match ? decodeURIComponent(match[1]) : "";

    const res = await fetch(`/api/loss-report/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_email }),
    });

    if (res.ok) {
      showPopup(`✅ อัปเดตสถานะเป็น "${status}" สำเร็จ`, "success");
      fetchReports();
    } else {
      const err = await res.json();
      showPopup(`❌ ${err.message || "อัปเดตไม่สำเร็จ"}`, "error");
    }
    closeModal();
  };

  const confirmApprovePayment = async () => {
    if (!approveModal.report) return;
    const match = document.cookie.match(/email=([^;]+)/);
    const admin_email = match ? decodeURIComponent(match[1]) : "";

    const res = await fetch(`/api/loss-report/${approveModal.report.LossReport_ID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "อนุมัติการชำระเงิน", admin_email }),
    });

    if (res.ok) {
      showPopup("✅ อนุมัติการชำระเงินสำเร็จ", "success");
      fetchReports();
    } else {
      const err = await res.json();
      showPopup(`❌ ${err.message || "ไม่สามารถอนุมัติได้"}`, "error");
    }
    closeApproveModal();
  };

  const filteredReports = reports.filter((r) =>
    (
      r.LossReport_ID +
      " " +
      r.nisit_email +
      " " +
      r.Bicycle_ID +
      " " +
      r.LossReport_Status
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="loss-container">
      <h1 className="loss-title">📋 จัดการการแจ้งหาย</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหา รหัสแจ้งหาย / อีเมล / จักรยาน / สถานะ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredReports.length === 0 ? (
        <p className="no-data">ไม่มีข้อมูลการแจ้งหาย</p>
      ) : (
        <table className="loss-table">
          <thead>
            <tr>
              <th>รหัสแจ้งหาย</th>
              <th>เลขทะเบียนจักรยาน</th>
              <th>รหัสนิสิต</th>
              <th>ผู้แจ้ง</th>
              <th>คณะ</th>
              <th>ภาควิชา</th>
              <th>วันที่แจ้ง</th>
              <th>ใบเสร็จ</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r) => (
              <tr key={r.LossReport_ID}>
                <td>{r.LossReport_ID}</td>
                <td>{r.Bicycle_ID}</td>
                <td>{r.nisit_ID}</td>
                <td>{r.prefix} {r.First_Name} {r.Last_Name}</td>
                <td>{r.department_name}</td>
                <td>{r.faculty_name}</td>
                <td>{formatDate(r.LossReport_Date)}</td>
                <td>
                  {r.LossReport_receipt ? (
                    <a href={r.LossReport_receipt} target="_blank" rel="noreferrer" className="receipt-link">📄 ดูสลิป</a>
                  ) : (
                    <span className="no-receipt">ยังไม่ส่ง</span>
                  )}
                </td>
                <td>
                  <span className={`status ${r.LossReport_Status}`}>
                    {r.LossReport_Status}
                  </span>
                </td>
                <td>
                  {r.LossReport_Status === "รอตรวจสอบการแจ้งหาย" && (
                    <>
                      <button
                        className="btn approve"
                        onClick={() => openModal(r.LossReport_ID, "รอการชำระเงิน")}
                      >
                        ✅ หายจริง
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => openModal(r.LossReport_ID, "ไม่อนุมัติการแจ้งหาย")}
                      >
                        ❌ ไม่หายจริง
                      </button>
                    </>
                  )}

                  {r.LossReport_Status === "รอตรวจสอบการชำระเงิน" && (
                    <>
                      <button
                        className="btn success"
                        onClick={() => setApproveModal({ open: true, report: r })}
                      >
                        💰 อนุมัติการชำระเงิน
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => openModal(r.LossReport_ID, "ชำระเงินไม่ถูกต้อง")}
                      >
                        ❌ ชำระเงินไม่ถูกต้อง
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal ยืนยันทั่วไป */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการดำเนินการ</h3>
            <p>คุณต้องการเปลี่ยนสถานะเป็น “{modal.status}” ใช่หรือไม่?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmUpdate}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={closeModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal แสดงรายละเอียดก่อนอนุมัติ */}
      {approveModal.open && approveModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>💰 ตรวจสอบรายละเอียดก่อนอนุมัติ</h3>
            <div className="detail-box">
              <p><b>รหัสแจ้งหาย:</b> {approveModal.report.LossReport_ID}</p>
              <p><b>รหัสนิสิต:</b> {approveModal.report.nisit_ID}</p>
              <p><b>ชื่อผู้แจ้ง:</b> {approveModal.report.prefix} {approveModal.report.First_Name} {approveModal.report.Last_Name}</p>
              <p><b>คณะ:</b> {approveModal.report.faculty_name}</p>
              <p><b>วันที่แจ้ง:</b> {formatDate(approveModal.report.LossReport_Date)}</p>
              <div className="receipt-preview">
                <p><b>ใบเสร็จ:</b></p>
                {approveModal.report.LossReport_receipt ? (
                  <img
                    src={approveModal.report.LossReport_receipt}
                    alt="ใบเสร็จ"
                    className="receipt-image"
                  />
                ) : (
                  <p>❌ ไม่มีใบเสร็จแนบมา</p>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmApprovePayment}>✅ ยืนยันอนุมัติ</button>
              <button className="cancel-btn" onClick={closeApproveModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup */}
      {popup.show && (
        <div className={`success-popup ${popup.type}`}>{popup.message}</div>
      )}
    </div>
  );
}
