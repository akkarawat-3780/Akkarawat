'use client';

import { useEffect, useState } from 'react';
import "./style.css";

export default function AdminBorrowPage() {
  const [borrows, setBorrows] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, type: "", id: "", status: "" });
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
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

  // ✅ กรองข้อมูล
  const filteredBorrows = borrows.filter(b =>
    (b.Borrow_ID + " " + b.Bicycle_ID + " " + b.borrow_status + " " + b.Nisit_ID)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ แบ่งหน้า
  const totalPages = Math.ceil(filteredBorrows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBorrows = filteredBorrows.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="admin-borrow-container">
      <h1>📋 จัดการการจองจักรยาน</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหารหัสการจอง / วันที่ / สถานะ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหาใหม่
          }}
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
          {currentBorrows.map(b => (
            <tr key={b.Borrow_ID}>
              <td>{b.Borrow_ID}</td>
              <td>{b.Bicycle_ID}</td>
              <td>{formatDate(b.Borrow_Date)}</td>
              <td>{formatDate(b.due_date)}</td>
              <td>{formatDate(b.return_date)}</td>
              <td>{b.Nisit_ID}</td>
              <td>{b.prefix} {b.First_Name} {b.Last_Name}</td>
              <td>{b.faculty_name}</td>
              <td>{b.department_name}</td>
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
          {currentBorrows.length === 0 && (
            <tr>
              <td colSpan="11" className="no-data">ไม่พบข้อมูลการจอง</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination */}
      {filteredBorrows.length > 0 && (
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ⬅ ก่อนหน้า
          </button>
          <span>หน้า {currentPage} จาก {totalPages}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            ถัดไป ➡
          </button>
        </div>
      )}

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
