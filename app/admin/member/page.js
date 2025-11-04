"use client";

import { useEffect, useState } from "react";
import "./style.css";

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // ✅ หน้าปัจจุบัน
  const itemsPerPage = 20; // ✅ 20 รายการต่อหน้า

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("โหลดข้อมูลสมาชิกไม่สำเร็จ");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("fetchMembers error:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const checkRes = await fetch(`/api/members/${deleteTarget}/check-active`);
      const checkData = await checkRes.json();

      if (checkData.hasActive) {
        setDeleteTarget(null);
        setMessage({
          type: "error",
          text: `ไม่สามารถลบนิสิตรหัส ${deleteTarget} ได้ เนื่องจากมีรายการค้างอยู่`,
        });
        return;
      }

      const res = await fetch(`/api/members/${deleteTarget}/status`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `ลบนิสิตรหัส ${deleteTarget} สำเร็จ`,
        });
        fetchMembers();
      } else {
        setMessage({
          type: "error",
          text: `เกิดข้อผิดพลาดในการลบข้อมูลนิสิตรหัส ${deleteTarget}`,
        });
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error("handleDeleteConfirm error:", err);
      setMessage({
        type: "error",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
      });
    }
  };

  // ✅ ฟิลเตอร์ตามการค้นหา
  const filteredMembers = members.filter((m) =>
    (
      m.Nisit_ID +
      " " +
      m.prefix +
      " " +
      m.First_Name +
      " " +
      m.Last_Name +
      " " +
      m.nisit_email +
      " " +
      m.Phone_Number +
      " " +
      m.department_name +
      " " +
      m.faculty_name
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ แบ่งหน้า
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="members-container">
      <h1 className="members-title">👥 จัดการสมาชิก</h1>
      <button
        className="add-btn"
        onClick={() => (window.location.href = `/admin/member/add`)}
      >
        ➕ เพิ่มข้อมูลนิสิต
      </button>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาสมาชิก..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // ✅ รีเซ็ตกลับหน้าแรก
          }}
        />
      </div>

      <h2 className="table-title">📋 รายชื่อสมาชิก</h2>
      <table className="members-table">
        <thead>
          <tr>
            <th>รหัสนิสิต</th>
            <th>ชื่อ</th>
            <th>อีเมล</th>
            <th>เบอร์โทร</th>
            <th>ภาควิชา</th>
            <th>หลักสูตร</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentMembers.map((m) => (
            <tr key={m.nisit_email}>
              <td>{m.Nisit_ID}</td>
              <td>
                {m.prefix} {m.First_Name} {m.Last_Name}
              </td>
              <td>{m.nisit_email}</td>
              <td>{m.Phone_Number}</td>
              <td>{m.department_name}</td>
              <td>{m.faculty_name}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteTarget(m.Nisit_ID)}
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          ))}
          {currentMembers.length === 0 && (
            <tr>
              <td colSpan="7" className="no-data">
                ไม่พบข้อมูลสมาชิก
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination */}
      {filteredMembers.length > 0 && (
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

      {/* ✅ Modal ยืนยันลบ */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ ยืนยันการลบ</h3>
            <p>
              คุณต้องการลบนิสิตรหัส <b>{deleteTarget}</b> ใช่หรือไม่?
            </p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleDeleteConfirm}>
                ✅ ลบ
              </button>
              <button
                className="cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                ❌ ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Popup แจ้งผล */}
      {message && (
        <div
          className={`success-popup ${
            message.type === "error" ? "error" : "success"
          }`}
        >
          <h3>
            {message.type === "success" ? "✅ สำเร็จ" : "⚠️ ไม่สามารถลบได้"}
          </h3>
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
}
