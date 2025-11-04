'use client';
import { useEffect, useState } from "react";
import "./style.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getFullYear()}`;
}

export default function AdminLossReportPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, id: "", status: "" });
  const [approveModal, setApproveModal] = useState({ open: false, report: null });
  const [rejectModal, setRejectModal] = useState({ open: false, report: null, reason: "" });
  const [viewModal, setViewModal] = useState({ open: false, report: null });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, report: null, reason: "" }); // ✅ ยกเลิก

  // ✅ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchReports = async () => {
    const res = await fetch("/api/loss-report/admin-history");
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openModal = (id, status) => setModal({ open: true, id, status });
  const closeModal = () => setModal({ open: false, id: "", status: "" });
  const closeApproveModal = () => setApproveModal({ open: false, report: null });
  const closeViewModal = () => setViewModal({ open: false, report: null });
  const closeRejectModal = () => setRejectModal({ open: false, report: null, reason: "" });

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
  // ✅ ยกเลิก (เพิ่มเหตุผล)
  const confirmCancelReport = async () => {
    if (!cancelModal.report) return;
    const match = document.cookie.match(/email=([^;]+)/);
    const admin_email = match ? decodeURIComponent(match[1]) : "";

    const res = await fetch(`/api/loss-report/${cancelModal.report.LossReport_ID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ยกเลิก",
        admin_email,
        remark: cancelModal.reason,
      }),
    });

    if (res.ok) {
      showPopup("❌ ยกเลิกรายการแจ้งหายเรียบร้อย", "error");
      fetchReports();
    } else {
      const err = await res.json();
      showPopup(`❌ ${err.message || "ยกเลิกไม่สำเร็จ"}`, "error");
    }
    setCancelModal({ open: false, report: null, reason: "" });
  };

  const confirmApprovePayment = async () => {
    if (!approveModal.report) return;
    const match = document.cookie.match(/email=([^;]+)/);
    const admin_email = match ? decodeURIComponent(match[1]) : "";

    const res = await fetch(`/api/loss-report/${approveModal.report.LossReport_ID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "อนุมัติ", admin_email }), // ✅ แก้เป็น "อนุมัติ"
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

  const confirmRejectPayment = async () => {
    if (!rejectModal.report) return;
    const match = document.cookie.match(/email=([^;]+)/);
    const admin_email = match ? decodeURIComponent(match[1]) : "";

    const res = await fetch(`/api/loss-report/${rejectModal.report.LossReport_ID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ไม่อนุมัติ",
        admin_email,
        remark: rejectModal.reason,
      }),
    });

    if (res.ok) {
      showPopup("❌ ไม่อนุมัติการชำระเงิน (ชำระเงินไม่ถูกต้อง)", "error");
      fetchReports();
    } else {
      const err = await res.json();
      showPopup(`❌ ${err.message || "ไม่สามารถอัปเดตสถานะได้"}`, "error");
    }
    closeRejectModal();
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

  // ✅ pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="loss-container">
      <h1 className="loss-title">📋 จัดการการแจ้งหาย</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหา รหัสแจ้งหาย / อีเมล / จักรยาน / สถานะ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // รีเซ็ตหน้าแรกเมื่อค้นหา
          }}
        />
      </div>

      {currentReports.length === 0 ? (
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
                    <span className="no-receipt">ส่งแล้ว</span>
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
                  {r.LossReport_Status === "รอการตรวจสอบ" && (
                    <>
                      <button
                        className="btn approve"
                        onClick={() => openModal(r.LossReport_ID, "รอการชำระเงิน")}
                      >
                        ✅ ส่งใบชำระเงิน
                      </button>
                      <button className="btn reject" onClick={() => setCancelModal({ open: true, report: r, reason: "" })}>❌ ยกเลิก</button>
                    </>
                  )}
                  {r.LossReport_Status === "รอการชำระเงิน" && (
                    <>
                      <button className="btn reject" onClick={() => setCancelModal({ open: true, report: r, reason: "" })}>❌ ยกเลิก</button>
                    </>
                  )}

                  {r.LossReport_Status === "รอการอนุมัติ" && (
                    <>
                      <button
                        className="btn success"
                        onClick={() => setApproveModal({ open: true, report: r })}
                      >
                        💰 อนุมัติ
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => setRejectModal({ open: true, report: r, reason: "" })}
                      >
                        ❌ ไม่อนุมัติ
                      </button>
                    </>
                  )}

                  {(r.LossReport_Status === "อนุมัติ" ||
                    r.LossReport_Status === "ไม่อนุมัติ" ||
                    r.LossReport_Status === "ยกเลิก") && (
                    <button
                      className="btn view"
                      onClick={() => setViewModal({ open: true, report: r })}
                    >
                      👁️ ดูรายละเอียด
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Pagination */}
      {filteredReports.length > 0 && (
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ⬅ ก่อนหน้า
          </button>
          <span>
            หน้า {currentPage} จาก {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="page-btn"
          >
            ถัดไป ➡
          </button>
        </div>
      )}

     {/* ✅ Modal ยืนยันอัปเดตสถานะ */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการอัปเดตสถานะ</h3>
            <p>คุณต้องการอัปเดต <b>{modal.id}</b> เป็น <b>{modal.status}</b> ใช่ไหม?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmUpdate}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={closeModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
        {/* ✅ Modal เหตุผลการยกเลิก */}
      {cancelModal.open && cancelModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>❌ ยกเลิกรายการแจ้งหาย</h3>
            <p>กรุณาระบุเหตุผลการยกเลิก:</p>
            <textarea
              rows="3"
              placeholder="เช่น แจ้งผิดจักรยาน หรือ ขอยกเลิกคำร้อง"
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
              className="reason-box"
            />
            <div className="modal-buttons">
              <button className="confirm-btn" disabled={!cancelModal.reason.trim()} onClick={confirmCancelReport}>✅ ยืนยันยกเลิก</button>
              <button className="cancel-btn" onClick={() => setCancelModal({ open: false, report: null, reason: "" })}>❌ ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal อนุมัติการชำระเงิน */}
      {approveModal.open && approveModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>💰 ตรวจสอบและอนุมัติการชำระเงิน</h3>
            <div className="detail-box">
              <p><b>รหัสแจ้งหาย:</b> {approveModal.report.LossReport_ID}</p>
              <p><b>ชื่อผู้แจ้ง:</b> {approveModal.report.prefix} {approveModal.report.First_Name} {approveModal.report.Last_Name}</p>
              <div className="receipt-preview">
                <p><b>ใบเสร็จที่แนบมา:</b></p>
                {approveModal.report.LossReport_receipt ? (
                  <img src={approveModal.report.LossReport_receipt} alt="ใบเสร็จ" className="receipt-image" />
                ) : <p>❌ ไม่มีใบเสร็จ</p>}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmApprovePayment}>✅ ยืนยันอนุมัติ</button>
              <button className="cancel-btn" onClick={closeApproveModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal เหตุผลไม่อนุมัติ */}
      {rejectModal.open && rejectModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>❌ ไม่อนุมัติการชำระเงิน</h3>
            <p>กรุณาระบุเหตุผล:</p>
            <textarea
              rows="4"
              className="reason-box"
              placeholder="เช่น ใบเสร็จไม่ชัดเจน"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
            />
            <div className="modal-buttons">
              <button className="confirm-btn" disabled={!rejectModal.reason.trim()} onClick={confirmRejectPayment}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={closeRejectModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal ดูรายละเอียด */}
      {viewModal.open && viewModal.report && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📄 รายละเอียด ({viewModal.report.LossReport_Status})</h3>
            <div className="detail-box">
              <p><b>รหัสแจ้งหาย:</b> {viewModal.report.LossReport_ID}</p>
              <p><b>ชื่อผู้แจ้ง:</b> {viewModal.report.prefix} {viewModal.report.First_Name} {viewModal.report.Last_Name}</p>
              <p><b>วันที่แจ้ง:</b> {formatDate(viewModal.report.LossReport_Date)}</p>
              {viewModal.report.remark && <p className="remark-box"><b>หมายเหตุ:</b> {viewModal.report.remark}</p>}
              <div className="receipt-preview">
                <p><b>ใบเสร็จ:</b></p>
                {viewModal.report.LossReport_receipt ? (
                  <img src={viewModal.report.LossReport_receipt} alt="ใบเสร็จ" className="receipt-image" />
                ) : <p>❌ ไม่มีใบเสร็จแนบมา</p>}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={closeViewModal}>ปิด</button>
            </div>
          </div>
        </div>
      )}


      {popup.show && (
        <div className={`success-popup ${popup.type}`}>{popup.message}</div>
      )}
    </div>
  );
}