'use client';

import { useEffect, useState } from 'react';
import "./style.css";

export default function AdminBikePage() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "success" });
  const [detailModal, setDetailModal] = useState({ open: false, bike: null, lastBorrow: null });
  const [currentPage, setCurrentPage] = useState(1); // ✅ หน้าปัจจุบัน
  const itemsPerPage = 20; // ✅ แสดง 20 รายการต่อหน้า

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    const res = await fetch('/api/bikes');
    const data = await res.json();
    setBikes(data);
  };

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "success" }), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const res = await fetch(`/api/bikes/${deleteTarget}`, { method: 'DELETE' });

    if (res.ok) {
      showPopup(`✅ ลบจักรยานรหัส ${deleteTarget} สำเร็จ`, "success");
      loadBikes();
    } else {
      showPopup(`❌ ไม่สามารถลบจักรยานรหัส ${deleteTarget} ได้`, "error");
    }

    setDeleteTarget(null);
  };

  // ✅ เปิด modal รายละเอียด
  const openDetailModal = async (bike) => {
    try {
      const res = await fetch(`/api/bikes/${bike.Bicycle_ID}/last-borrow`);
      const data = await res.json();
      setDetailModal({ open: true, bike, lastBorrow: data });
    } catch (err) {
      console.error("fetch detail error:", err);
      setDetailModal({ open: true, bike, lastBorrow: null });
    }
  };

  const closeDetailModal = () => setDetailModal({ open: false, bike: null, lastBorrow: null });

  // ✅ ค้นหา
  const filteredBikes = bikes.filter(b =>
    b.Bicycle_ID.toLowerCase().includes(search.toLowerCase()) ||
    b.Bicycle_Status.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ แบ่งหน้า
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBikes = filteredBikes.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="bike-page">
      <h1>🛠️ จัดการข้อมูลจักรยาน</h1>
      <button
        className="add-btn"
        onClick={() => window.location.href = `/admin/bike/add`}
      >
        ➕ เพิ่มข้อมูลจักรยาน
      </button>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาจักรยานด้วยรหัสหรือสถานะ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // ✅ รีเซ็ตไปหน้าแรกเมื่อค้นหาใหม่
          }}
        />
      </div>

      <table className="bike-table">
        <thead>
          <tr>
            <th>เลขทะเบียนจักรยาน</th>
            <th>รูปภาพ</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentBikes.map(b => (
            <tr key={b.Bicycle_ID}>
              <td>{b.Bicycle_ID}</td>
              <td>{b.Image && <img src={b.Image} width="80" alt="bike" />}</td>
              <td>{b.Bicycle_Status}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => openDetailModal(b)}
                >
                  👁️ รายละเอียด
                </button>
                <button
                  className="edit-btn"
                  onClick={() => window.location.href = `/admin/bike/update/${b.Bicycle_ID}`}
                >
                  ✏️ แก้ไข
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteTarget(b.Bicycle_ID)}
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          ))}
          {currentBikes.length === 0 && (
            <tr>
              <td colSpan="4" className="no-data">ไม่พบข้อมูลจักรยาน</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination */}
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ⬅ ก่อนหน้า
          </button>
          <span>หน้า {currentPage} จาก {totalPages || 1}</span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="page-btn"
          >
            ถัดไป ➡
          </button>
        </div>


      {/* ✅ Modal ลบจักรยาน */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการลบ</h3>
            <p>คุณต้องการลบจักรยานรหัส <b>{deleteTarget}</b> ใช่หรือไม่?</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleDeleteConfirm}>✅ ลบ</button>
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>❌ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal รายละเอียดจักรยาน */}

      {detailModal.open && detailModal.bike && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📄 รายละเอียดจักรยาน</h3>
            <div className="detail-box">
              <p><b>เลขทะเบียน:</b> {detailModal.bike.Bicycle_ID}</p>
              <p><b>สถานะ:</b> {detailModal.bike.Bicycle_Status}</p>
              {detailModal.bike.Image && (
                <img src={detailModal.bike.Image} alt="bike" className="receipt-image" />
              )}

              <hr />
              <h4>🧍 ผู้ที่กำลังยืมหรือจองจักรยาน</h4>
              {detailModal.lastBorrow ? (
                <>
                  <p><b>รหัสนิสิต:</b> {detailModal.lastBorrow.Nisit_ID}</p>
                  <p><b>ชื่อ:</b> {detailModal.lastBorrow.prefix} {detailModal.lastBorrow.First_Name} {detailModal.lastBorrow.Last_Name}</p>
                  <p><b>วันที่จอง:</b> {new Date(detailModal.lastBorrow.Borrow_Date).toLocaleDateString("th-TH")}</p>
                  <p><b>สถานะ:</b> {detailModal.lastBorrow.borrow_status}</p>
                </>
              ) : (
                <p>❌ ยังไม่มีผู้ที่กำลังยืมหรือจองจักรยานคันนี้</p>
              )}

            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={closeDetailModal}>ปิด</button>
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
