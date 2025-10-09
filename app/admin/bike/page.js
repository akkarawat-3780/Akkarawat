'use client';

import { useEffect, useState } from 'react';
import "./style.css";

export default function AdminBikePage() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // ✅ จักรยานที่กำลังจะลบ

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    const res = await fetch('/api/bikes');
    const data = await res.json();
    setBikes(data);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/bikes/${deleteTarget}`, { method: 'DELETE' });
    setDeleteTarget(null);
    loadBikes();
  };

  const filteredBikes = bikes.filter(b =>
    b.Bicycle_ID.toLowerCase().includes(search.toLowerCase()) ||
    b.Bicycle_Status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bike-page">
      <h1>🛠️ จัดการข้อมูลจักรยาน</h1>
      <button className="add-btn" onClick={() => window.location.href = `/admin/bike/add`}>เพิ่มข้อมูลจักรยาน</button>

      {/* ✅ Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาจักรยานด้วยรหัสหรือสถานะ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          {filteredBikes.map(b => (
            <tr key={b.Bicycle_ID}>
              <td>{b.Bicycle_ID}</td>
              <td>{b.Image && <img src={b.Image} width="80" />}</td>
              <td>{b.Bicycle_Status}</td>
              <td>
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
        </tbody>
      </table>

      {/* ✅ Popup Modal ลบจักรยาน */}
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
    </div>
  );
}
