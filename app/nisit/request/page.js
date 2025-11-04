'use client';

import { useEffect, useState } from 'react';
import './style.css'; // ✅ import CSS

export default function BikeListPage() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // ✅ หน้าที่กำลังดูอยู่
  const itemsPerPage = 20; // ✅ จำนวนรายการต่อหน้า

  useEffect(() => {
    fetch('/api/bikes')
      .then(res => res.json())
      .then(setBikes);
  }, []);

  const filteredBikes = bikes.filter(bike =>
    bike.Bicycle_ID.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredBikes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBikes = filteredBikes.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // ✅ คืน class สีตามสถานะ
  const getStatusClass = (status) => {
    switch (status) {
      case 'ว่าง':
        return 'status-available';
      case 'อยู่ระหว่างการตรวจสอบ':
        return 'status-pending';
      case 'ไม่พร้อมใช้งาน':
        return 'status-unavailable';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="container">
      <h1 className="heading">🚲 รายการจักรยาน</h1>

      {/* ✅ Search Box */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="ค้นหาตามรหัสจักรยาน..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // 🔄 รีเซ็ตกลับหน้าแรกเมื่อค้นหาใหม่
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '250px'
          }}
        />
      </div>

      {currentBikes.length === 0 ? (
        <p>❌ ไม่พบจักรยาน</p>
      ) : (
        <>
          <table className="bike-table">
            <thead>
              <tr>
                <th>เลขทะเบียนจักรยาน</th>
                <th>รูป</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentBikes.map(bike => (
                <tr key={bike.Bicycle_ID}>
                  <td>{bike.Bicycle_ID}</td>
                  <td>
                    <img src={bike.Image} alt="bike" className="bike-img" width="80" />
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(bike.Bicycle_Status)}`}>
                      {bike.Bicycle_Status}
                    </span>
                  </td>
                  <td>
                    {bike.Bicycle_Status === 'ว่าง' ? (
                      <button
                        className="action-btn"
                        onClick={() =>
                          window.location.href = `/nisit/request/borrow/${bike.Bicycle_ID}`
                        }
                      >
                        จองจักรยาน
                      </button>
                    ) : (
                      <button className="action-btn" disabled>ไม่ว่าง</button>
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
    </div>
  );
}
