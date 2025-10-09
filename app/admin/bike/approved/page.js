'use client';

import { useEffect, useState } from 'react';
import "./style.css";

export default function AdminBorrowPage() {
  const [borrows, setBorrows] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ modal สำหรับยืนยันก่อนทำรายการ
  const [modal, setModal] = useState({ open: false, type: "", id: "", status: "" });

  // ✅ popup แจ้งผลลัพธ์
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });

  useEffect(() => {
    loadBorrows();
  }, []);

  const loadBorrows = async () => {
    const res = await fetch('/api/borrow');
    const data = await res.json();
    setBorrows(data);
  };

  const openModal = (id, type, status = "") => {
    setModal({ open: true, id, type, status });
  };

  const closeModal = () => setModal({ open: false, type: "", id: "", status: "" });

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000); // ⏱️ หายไปใน 3 วิ
  };

  const confirmAction = async () => {
    if (!modal.id) return;

    if (modal.type === "status") {
      const res = await fetch(`/api/borrow/${modal.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modal.status }),
      });

      if (res.ok) {
        showSuccess(`✅ อนุมัติการยืมจักรยานสำเร็จ`);
        await loadBorrows();
      }
    }

    if (modal.type === "return") {
      const res = await fetch(`/api/borrow/${modal.id}/return`, { method: 'PUT' });

      if (res.ok) {
        showSuccess(`🔁 คืนจักรยานสำเร็จ`);
        await loadBorrows();
      }
    }

    closeModal();
  };

  function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }

  const filteredBorrows = borrows.filter(b =>
    (b.Borrow_ID + " " + b.Bicycle_ID + " " + b.borrow_status + " " + b.Nisit_ID)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-borrow-container">
      <h1>📋 จัดการการจองจักรยาน</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหารหัสการจอง / วันที่ / สถานะ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="borrow-table">
        <thead>
          <tr>
            <th>รหัสการจอง</th>
            <th>เลขทะเบียนจักรยาน</th>
            <th>วันที่จอง</th>
            <th>กำหนดคืน</th>
            <th>วันที่คืน</th>
            <th>รหัสนิสิต</th>
            <th>ชื่อ</th>
            <th>คณะ</th>
            <th>ภาควิชา</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredBorrows.map(b => (
            <tr key={b.Borrow_ID}>
              <td>{b.Borrow_ID}</td>
              <td>{b.Bicycle_ID}</td>
              <td>{formatDate(b.Borrow_Date)}</td>
              <td>{formatDate(b.due_date)}</td>
              <td>{formatDate(b.return_date)}</td>
              <td>{b.Nisit_ID}</td>
              <td>{b.prefix} {b.First_Name} {b.Last_Name}</td>
              <td>{b.department_name}</td>
              <td>{b.faculty_name}</td>
              <td>
                <span
                  className={`status-tag ${
                    b.borrow_status === "อยู่ระหว่างการตรวจสอบ"
                      ? "pending"
                      : b.borrow_status === "อนุมัติ"
                      ? "approved"
                      : b.borrow_status === "ไม่อนุมัติ"
                      ? "rejected"
                      : b.borrow_status === "คืนแล้ว"
                      ? "returned"
                      : b.borrow_status === "ยกเลิก"
                      ? "cancelled"
                      : b.borrow_status === "แจ้งหาย"
                      ? "lost"
                      : ""
                  }`}
                >
                  {b.borrow_status}
                </span>
              </td>
              <td>
                {b.borrow_status === 'อยู่ระหว่างการตรวจสอบ' && (
                  <>
                    <button
                      className="btn btn-approve"
                      onClick={() => openModal(b.Borrow_ID, "status", "อนุมัติ")}
                    >
                      ✅ อนุมัติ
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => openModal(b.Borrow_ID, "status", "ไม่อนุมัติ")}
                    >
                      ❌ ไม่อนุมัติ
                    </button>
                  </>
                )}
                {b.borrow_status === "อนุมัติ" && (
                  <button
                    className="btn btn-return"
                    onClick={() => openModal(b.Borrow_ID, "return")}
                  >
                    🔁 คืนจักรยาน
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredBorrows.length === 0 && (
            <tr>
              <td colSpan="11" className="no-data">ไม่พบข้อมูลการจอง</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Modal ยืนยัน */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการดำเนินการ</h3>
            <p>
              {modal.type === "status"
                ? `คุณต้องการเปลี่ยนสถานะเป็น "${modal.status}" ใช่หรือไม่?`
                : "คุณต้องการยืนยันการคืนจักรยานใช่หรือไม่?"}
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmAction}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={closeModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup แจ้งสำเร็จ */}
      {successPopup.show && (
        <div className="success-popup">
          {successPopup.message}
        </div>
      )}
    </div>
  );
}
