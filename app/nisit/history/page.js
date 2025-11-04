'use client';

import { useEffect, useState } from 'react';
import './style.css';

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

export default function BorrowHistoryPage() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, type: "", id: "" });
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
  const [currentPage, setCurrentPage] = useState(1); // ✅ หน้าที่กำลังดู
  const itemsPerPage = 20; // ✅ จำนวนข้อมูลต่อหน้า

  const fetchHistory = async () => {
    const res = await fetch('/api/borrow/history');
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ Popup
  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 3000);
  };

  const showSuccessPopup = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
  };

  const openModal = (type, id) => setModal({ open: true, type, id });
  const closeModal = () => setModal({ open: false, type: "", id: "" });

  const confirmAction = async () => {
    if (!modal.id) return;

    if (modal.type === "cancel") {
      // ... (โค้ดส่วน cancel เดิม)
      const res = await fetch(`/api/borrow/${modal.id}`, { method: 'PUT' });
      if (res.ok) {
        showSuccessPopup('✅ ยกเลิกการจองสำเร็จ');
        fetchHistory();
      } else showPopup('❌ ไม่สามารถยกเลิกได้', 'error');
    }

    if (modal.type === "lost") {
      
      // ✅ ลบโค้ดการสร้าง ID แบบสุ่มและส่ง body ออก
      
      // ✅ ส่ง request ไป API โดยไม่ต้องส่ง body (ID จะถูกสร้างที่ฝั่ง Server)
      const res = await fetch(`/api/borrow/${modal.id}/lost`, { 
        method: 'POST',
        // headers และ body ไม่จำเป็นแล้ว
      });

      if (res.ok) {
        showSuccessPopup('🚨 แจ้งหายเรียบร้อย (รอตรวจสอบ)');
        fetchHistory();
      } else showPopup('❌ ไม่สามารถแจ้งหายได้', 'error');
    }

    closeModal();
  };

  // ✅ Filter ผลลัพธ์การค้นหา
  const filteredHistory = history.filter(item =>
    item.Borrow_ID.toLowerCase().includes(search.toLowerCase()) ||
    item.Bicycle_ID.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="history-container">
      <h1 className="heading">📜 ประวัติการจองจักรยาน</h1>

      {/* ✅ Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาด้วยรหัสการจองหรือรหัสจักรยาน..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // 🔄 กลับไปหน้าแรกเมื่อพิมพ์ค้นหา
          }}
        />
      </div>

      {currentData.length === 0 ? (
        <p>❌ ไม่พบประวัติการจอง</p>
      ) : (
        <>
          <table className="bike-table">
            <thead>
              <tr>
                <th>รหัสการจอง</th>
                <th>รหัสจักรยาน</th>
                <th>วันที่จอง</th>
                <th>กำหนดคืน</th>
                <th>วันที่คืน</th>
                <th>ผู้อนุมัติ</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(item => (
                <tr key={item.Borrow_ID}>
                  <td>{item.Borrow_ID}</td>
                  <td>{item.Bicycle_ID}</td>
                  <td>{formatDate(item.Borrow_Date)}</td>
                  <td>{formatDate(item.due_date)}</td>
                  <td>{formatDate(item.return_date)}</td>
                  <td>{item.admin_email}</td>
                  <td>
                    <span
                      className={`status ${
                        item.borrow_status === 'อนุมัติ'
                          ? 'approved'
                          : item.borrow_status === 'อยู่ระหว่างการตรวจสอบ'
                          ? 'pending'
                          : item.borrow_status === 'คืนแล้ว'
                          ? 'returned'
                          : item.borrow_status === 'ยกเลิก'
                          ? 'cancelled'
                          : item.borrow_status === 'แจ้งหาย'
                          ? 'lost'
                          : 'rejected'
                      }`}
                    >
                      {item.borrow_status}
                    </span>
                  </td>
                  <td>
                    {item.borrow_status === 'อยู่ระหว่างการตรวจสอบ' && (
                      <button
                        className="btn cancel-btn"
                        onClick={() => openModal("cancel", item.Borrow_ID)}
                      >
                        ❌ ยกเลิก
                      </button>
                    )}
                    {item.borrow_status === 'อนุมัติ' && (
                      <button
                        className="btn lost-btn"
                        onClick={() => openModal("lost", item.Borrow_ID)}
                      >
                        🚨 แจ้งหาย
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Pagination Controls */}
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
        </>
      )}

      {/* ✅ Modal ยืนยัน */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการดำเนินการ</h3>
            <p>
              {modal.type === "cancel"
                ? `คุณต้องการยกเลิกการจอง ${modal.id} ใช่หรือไม่?`
                : `คุณต้องการแจ้งหายสำหรับการจอง ${modal.id} ใช่หรือไม่?`}
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmAction}>✅ ยืนยัน</button>
              <button className="cancel-btn" onClick={closeModal}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup แจ้งเตือนทั่วไป */}
      {popup.show && (
        <div className={`popup-message ${popup.type}`}>
          {popup.message}
        </div>
      )}

      {/* ✅ Success Popup แบบใหญ่ */}
      {successPopup.show && (
        <div className="success-popup">
          <p>{successPopup.message}</p>
        </div>
      )}
    </div>
  );
}
